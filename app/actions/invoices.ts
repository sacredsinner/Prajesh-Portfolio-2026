"use server"

import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { invoices } from "@/lib/db/schema"
import { amountLabel, dateLabel, documentPdf, documentUrl, findDocumentByToken, newToken, nextDocumentNumber } from "@/lib/documents"
import { sendEmail } from "@/lib/email"
import { documentEmail, quoteAcceptedEmail } from "@/lib/email-templates"
import { addDays, documentTotals, today, type BusinessSettings } from "@/lib/invoices"
import { CURRENCIES } from "@/lib/money"
import { getBusinessSettings, saveBusinessSettings } from "@/lib/settings"
import { SITE_URL } from "@/lib/site"

// A "use server" file may only export async functions (and types).

export type DocumentResult = { ok: true; id: string } | { ok: false; error: string }
export type PlainResult = { ok: true } | { ok: false; error: string }

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
const optional = (max: number) => z.string().trim().max(max).nullable().optional().transform((value) => value || null)

const itemSchema = z.object({
  id: z.string().min(1).max(64),
  description: z.string().trim().min(1, "Describe every line item.").max(600),
  quantity: z.coerce.number().min(0, "Quantities can't be negative.").max(100000),
  unitPrice: z.coerce.number().min(-100000000).max(100000000),
})

const documentSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["quote", "invoice"]),
  clientName: z.string().trim().min(1, "Add the client's name.").max(160),
  clientCompany: optional(160),
  clientEmail: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid client email.")]).nullable().optional().transform((value) => value || null),
  clientAddress: optional(600),
  currency: z.enum(CURRENCIES),
  items: z.array(itemSchema).min(1, "Add at least one line item.").max(100),
  taxLabel: optional(30),
  taxRate: z.coerce.number().min(0).max(100),
  issueDate: isoDate,
  dueDate: z.union([z.literal(""), isoDate]).nullable().optional().transform((value) => value || null),
  notes: optional(4000),
  paymentLink: z.union([z.literal(""), z.string().trim().url("Use a full link, starting with https://.")]).nullable().optional().transform((value) => value || null),
})
export type DocumentInput = z.input<typeof documentSchema>

const isUniqueViolation = (error: unknown) => typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505"

export async function listDocuments() {
  await requireAdmin()
  await ensureSchema()
  return db.select().from(invoices).orderBy(desc(invoices.issueDate), desc(invoices.createdAt))
}

export async function saveDocument(input: unknown): Promise<DocumentResult> {
  await requireAdmin()
  await ensureSchema()
  const parsed = documentSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the details and try again." }
  const { id, ...data } = parsed.data
  const total = documentTotals(data.items, data.taxRate).total.toFixed(2)
  const values = { ...data, taxRate: data.taxRate.toFixed(2), total, updatedAt: new Date() }
  if (id) {
    const { kind: _kind, ...changes } = values // a quote stays a quote; convert it instead
    const [updated] = await db.update(invoices).set(changes).where(eq(invoices.id, id)).returning({ id: invoices.id })
    if (!updated) return { ok: false, error: "That document no longer exists. Reload the page." }
    revalidatePath("/admin/invoices")
    return { ok: true, id: updated.id }
  }
  // A number can collide if two documents are saved at the same moment; try again.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const number = await nextDocumentNumber(data.kind)
      const [created] = await db.insert(invoices).values({ ...values, number, publicToken: newToken(), status: "draft" }).returning({ id: invoices.id })
      revalidatePath("/admin/invoices")
      return { ok: true, id: created.id }
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 2) {
        console.error("[invoices] Could not save", error)
        return { ok: false, error: "Couldn't save. Please try again." }
      }
    }
  }
  return { ok: false, error: "Couldn't save. Please try again." }
}

export async function deleteDocument(id: string): Promise<PlainResult> {
  await requireAdmin()
  await ensureSchema()
  await db.delete(invoices).where(eq(invoices.id, z.string().uuid().parse(id)))
  revalidatePath("/admin/invoices")
  return { ok: true }
}

const STATUS_BY_KIND = { quote: ["draft", "sent", "accepted", "declined", "converted"], invoice: ["draft", "sent", "paid", "void"] } as const

export async function setDocumentStatus(id: string, status: string): Promise<PlainResult> {
  await requireAdmin()
  await ensureSchema()
  const [row] = await db.select().from(invoices).where(eq(invoices.id, z.string().uuid().parse(id))).limit(1)
  if (!row) return { ok: false, error: "That document no longer exists. Reload the page." }
  const allowed: readonly string[] = STATUS_BY_KIND[row.kind === "quote" ? "quote" : "invoice"]
  if (!allowed.includes(status)) return { ok: false, error: "That status isn't available here." }
  await db
    .update(invoices)
    .set({ status, paidAt: status === "paid" ? row.paidAt ?? new Date() : null, acceptedAt: status === "accepted" ? row.acceptedAt ?? new Date() : row.acceptedAt, updatedAt: new Date() })
    .where(eq(invoices.id, row.id))
  revalidatePath("/admin/invoices")
  return { ok: true }
}

async function copyDocument(id: string, kind: "quote" | "invoice", fromQuote: boolean): Promise<DocumentResult> {
  const [source] = await db.select().from(invoices).where(eq(invoices.id, z.string().uuid().parse(id))).limit(1)
  if (!source) return { ok: false, error: "That document no longer exists. Reload the page." }
  const settings = await getBusinessSettings()
  const issueDate = today()
  const dueDate = addDays(issueDate, kind === "quote" ? settings.quoteValidDays : settings.paymentTermsDays)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const number = await nextDocumentNumber(kind)
      const [created] = await db
        .insert(invoices)
        .values({
          kind,
          number,
          status: "draft",
          clientName: source.clientName,
          clientCompany: source.clientCompany,
          clientEmail: source.clientEmail,
          clientAddress: source.clientAddress,
          currency: source.currency,
          items: source.items,
          taxLabel: source.taxLabel,
          taxRate: source.taxRate,
          total: source.total,
          issueDate,
          dueDate,
          notes: source.notes,
          paymentLink: kind === "invoice" ? source.paymentLink : null,
          publicToken: newToken(),
          sourceQuoteId: fromQuote ? source.id : null,
        })
        .returning({ id: invoices.id })
      if (fromQuote) await db.update(invoices).set({ status: "converted", updatedAt: new Date() }).where(eq(invoices.id, source.id))
      revalidatePath("/admin/invoices")
      return { ok: true, id: created.id }
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 2) {
        console.error("[invoices] Could not copy", error)
        return { ok: false, error: "Couldn't create it. Please try again." }
      }
    }
  }
  return { ok: false, error: "Couldn't create it. Please try again." }
}

// An accepted quote becomes a draft invoice with the same client and line items.
export async function convertQuoteToInvoice(id: string): Promise<DocumentResult> {
  await requireAdmin()
  await ensureSchema()
  return copyDocument(id, "invoice", true)
}

export async function duplicateDocument(id: string): Promise<DocumentResult> {
  await requireAdmin()
  await ensureSchema()
  const [row] = await db.select({ kind: invoices.kind }).from(invoices).where(eq(invoices.id, z.string().uuid().parse(id))).limit(1)
  if (!row) return { ok: false, error: "That document no longer exists. Reload the page." }
  return copyDocument(id, row.kind === "quote" ? "quote" : "invoice", false)
}

// Emails the quote or invoice to the client, with the PDF attached and a link to view it.
export async function sendDocument(id: string, message?: string): Promise<PlainResult> {
  await requireAdmin()
  await ensureSchema()
  const [row] = await db.select().from(invoices).where(eq(invoices.id, z.string().uuid().parse(id))).limit(1)
  if (!row) return { ok: false, error: "That document no longer exists. Reload the page." }
  if (!row.clientEmail) return { ok: false, error: "Add the client's email address first." }
  const { bytes, filename, business } = await documentPdf(row)
  const kind = row.kind === "quote" ? "quote" : "invoice"
  const result = await sendEmail({
    to: row.clientEmail,
    replyTo: ADMIN_EMAIL,
    ...documentEmail({ kind, number: row.number, clientName: row.clientName, amount: amountLabel(row), dateLabel: dateLabel(row), url: documentUrl(row.publicToken), message: message?.slice(0, 4000), businessName: business.businessName }),
    attachments: [{ filename, content: Buffer.from(bytes) }],
  })
  if (!result.ok) return { ok: false, error: `The email wasn't sent: ${result.error}` }
  await db
    .update(invoices)
    .set({ status: row.status === "draft" ? "sent" : row.status, sentAt: new Date(), updatedAt: new Date() })
    .where(eq(invoices.id, row.id))
  revalidatePath("/admin/invoices")
  return { ok: true }
}

const currencySettings = z.object({ taxLabel: z.string().trim().max(30), taxRate: z.coerce.number().min(0).max(100), paymentInstructions: z.string().trim().max(2000) })
const settingsSchema = z.object({
  businessName: z.string().trim().min(1, "Add your business name.").max(120),
  tagline: z.string().trim().max(120),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().max(60),
  address: z.string().trim().max(400),
  taxId: z.string().trim().max(80),
  paymentTermsDays: z.coerce.number().int().min(0).max(365),
  quoteValidDays: z.coerce.number().int().min(1).max(365),
  remindersEnabled: z.boolean(),
  footerNote: z.string().trim().max(200),
  currencies: z.object({ NPR: currencySettings, AUD: currencySettings, USD: currencySettings }),
})

export async function getInvoiceSettings(): Promise<BusinessSettings> {
  await requireAdmin()
  return getBusinessSettings()
}

export async function saveInvoiceSettings(input: unknown): Promise<PlainResult> {
  await requireAdmin()
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the settings and try again." }
  await saveBusinessSettings(parsed.data)
  revalidatePath("/admin/invoices")
  return { ok: true }
}

// ── Public: the client accepts a quote from its page.
const acceptSchema = z.object({ token: z.string().min(16).max(64), name: z.string().trim().min(2, "Type your name to accept.").max(120), website: z.string().max(200).optional() })

export async function acceptQuote(input: unknown): Promise<PlainResult> {
  const parsed = acceptSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Type your name to accept." }
  if (parsed.data.website) return { ok: true }
  const row = await findDocumentByToken(parsed.data.token)
  if (!row || row.kind !== "quote") return { ok: false, error: "This quote couldn't be found." }
  if (row.status === "accepted" || row.status === "converted") return { ok: true }
  if (row.status !== "sent") return { ok: false, error: "This quote isn't open for acceptance. Please get in touch." }
  if (row.dueDate && row.dueDate < today()) return { ok: false, error: "This quote has expired. Reply to the email it came with and I'll send a fresh one." }
  await db.update(invoices).set({ status: "accepted", acceptedAt: new Date(), acceptedBy: parsed.data.name, updatedAt: new Date() }).where(eq(invoices.id, row.id))
  after(async () => {
    const result = await sendEmail({
      to: process.env.CONTACT_NOTIFICATION_EMAIL || ADMIN_EMAIL,
      replyTo: row.clientEmail ?? undefined,
      ...quoteAcceptedEmail({ number: row.number, clientName: row.clientName, acceptedBy: parsed.data.name, amount: amountLabel(row), adminUrl: `${SITE_URL}/admin/invoices` }),
    }).catch((error) => ({ ok: false as const, error: String(error) }))
    if (!result.ok) console.error("[invoices] Acceptance alert failed:", result.error)
  })
  revalidatePath(`/i/${row.publicToken}`)
  revalidatePath("/admin/invoices")
  return { ok: true }
}
