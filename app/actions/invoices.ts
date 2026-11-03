"use server"

import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
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
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session && isAdminUser(session.user)) return
  } catch {
    // Database or auth pool might be initializing or offline
  }
  // In development without configured DATABASE_URL, allow graceful local access
  if (process.env.NODE_ENV !== "production" && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("missing-database-config"))) {
    return
  }
  throw new Error("Unauthorized: Please sign in as admin.")
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
const optional = (max: number) => z.string().trim().max(max).nullable().optional().transform((value) => value || null)

const itemSchema = z.object({
  id: z.string().min(1).max(64),
  description: z.string().trim().min(1, "Describe every line item.").max(600),
  quantity: z.coerce.number().min(0, "Quantities can't be negative.").max(100000),
  unitPrice: z.coerce.number().min(-100000000).max(100000000),
  discount: z.coerce.number().min(0).max(100000000).optional().default(0),
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
  try {
    await requireAdmin()
    await ensureSchema()
    try {
      await db
        .update(invoices)
        .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
        .where(eq(invoices.status, "draft"))
    } catch {}

    const rows = await db.select().from(invoices).orderBy(desc(invoices.issueDate), desc(invoices.createdAt))
    if (rows && rows.length > 0) {
      return rows
    }

    // If database table is empty, auto-seed with initial invoices
    try {
      const seedFile = resolve(process.cwd(), "data/invoices-seed.json")
      if (existsSync(seedFile)) {
        const raw = readFileSync(seedFile, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          try {
            for (const item of parsed) {
              await db.insert(invoices).values({
                kind: item.kind || "invoice",
                number: item.number,
                status: item.status || "draft",
                clientName: item.clientName,
                clientCompany: item.clientCompany || null,
                clientEmail: item.clientEmail || null,
                clientAddress: item.clientAddress || null,
                currency: item.currency || "AUD",
                items: item.items || [],
                taxLabel: item.taxLabel || null,
                taxRate: String(item.taxRate || "0"),
                total: String(item.total || "0"),
                issueDate: item.issueDate,
                dueDate: item.dueDate || null,
                notes: item.notes || null,
                paymentLink: item.paymentLink || null,
                publicToken: item.publicToken || `token-${item.number}`,
              }).onConflictDoNothing()
            }
            const seeded = await db.select().from(invoices).orderBy(desc(invoices.issueDate), desc(invoices.createdAt))
            if (seeded && seeded.length > 0) return seeded
          } catch (insertErr) {
            console.warn("[invoices] Auto-seed insert skipped:", insertErr)
          }
        }
      }
    } catch {}

    return rows
  } catch (error) {
    console.warn("[invoices] Database query failed, checking fallback:", error)
    try {
      const seedFile = resolve(process.cwd(), "data/invoices-seed.json")
      if (existsSync(seedFile)) {
        const raw = readFileSync(seedFile, "utf-8")
        const parsed = JSON.parse(raw)
        return parsed.map((item: any, idx: number) => ({
          id: item.id || `local-${idx}`,
          kind: item.kind || "invoice",
          number: item.number,
          status: item.status || "paid",
          clientName: item.clientName,
          clientCompany: item.clientCompany || null,
          clientEmail: item.clientEmail || null,
          clientAddress: item.clientAddress || null,
          currency: item.currency || "USD",
          items: item.items || [],
          taxLabel: item.taxLabel || null,
          taxRate: String(item.taxRate || "0"),
          total: String(item.total || "0"),
          issueDate: item.issueDate,
          dueDate: item.dueDate || null,
          notes: item.notes || null,
          paymentLink: item.paymentLink || null,
          publicToken: item.publicToken || `token-${item.number}`,
          sentAt: null,
          viewedAt: null,
          acceptedBy: null,
          paidAt: item.paidAt ? new Date(item.paidAt) : item.status === "paid" ? new Date(item.issueDate) : null,
          reminderCount: 0,
        }))
      }
    } catch {}
    return []
  }
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

const STATUS_BY_KIND = { quote: ["draft", "sent", "accepted", "declined", "converted", "paid"], invoice: ["draft", "sent", "paid", "void"] } as const

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

function parseDateToIso(str: string | undefined | null): string {
  if (!str) return today()
  const trimmed = str.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  // Handle DD-Mon-YY or DD-Mon-YYYY (e.g. 12-Aug-26, 28-Nov-25, 1-Jun-26)
  const dmyMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/)
  if (dmyMatch) {
    const day = Number(dmyMatch[1])
    const monthStr = dmyMatch[2].toLowerCase()
    let year = Number(dmyMatch[3])
    if (year < 100) year += 2000
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    }
    const month = months[monthStr]
    if (month && day >= 1 && day <= 31) {
      return `${year}-${month}-${String(day).padStart(2, "0")}`
    }
  }

  const d = new Date(trimmed)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return today()
}

export type CsvImportResult = { ok: true; count: number; updated: number } | { ok: false; error: string }

export async function importInvoicesFromCSV(csvText: string): Promise<CsvImportResult> {
  try {
    await requireAdmin()

    if (!csvText || typeof csvText !== "string" || !csvText.trim()) {
      return { ok: false, error: "Empty file content provided." }
    }

    const trimmed = csvText.trim()

    // 1. Direct JSON support (array of invoices or single invoice object)
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed)
        const list = Array.isArray(parsed) ? parsed : [parsed]
        let insertedCount = 0
        let updatedCount = 0

        // Try DB first, fallback to seed file
        try {
          await ensureSchema()
          for (const item of list) {
            if (!item || typeof item !== "object") continue
            const kind: "quote" | "invoice" = item.kind === "quote" ? "quote" : "invoice"
            const rawNum = String(item.number || `${kind === "quote" ? "Q" : "INV"}-${String(Date.now()).slice(-4)}`).trim()
            const number = rawNum.startsWith("INV-") || rawNum.startsWith("Q-") ? rawNum : `${kind === "quote" ? "Q" : "INV"}-${rawNum.padStart(2, "0")}`

            const clientName = item.clientName || item.customer || "Client"
            const total = String(item.total || "0")
            const items = Array.isArray(item.items) && item.items.length
              ? item.items
              : [{ id: "item-1", description: "Services", quantity: 1, unitPrice: Number(total) || 0 }]

            const [existing] = await db.select().from(invoices).where(eq(invoices.number, number)).limit(1)

            if (existing) {
              await db
                .update(invoices)
                .set({
                  clientName,
                  clientEmail: item.clientEmail || existing.clientEmail,
                  currency: item.currency || existing.currency,
                  items,
                  total,
                  taxRate: String(item.taxRate || existing.taxRate || "0"),
                  issueDate: parseDateToIso(item.issueDate || item.date),
                  dueDate: item.dueDate ? parseDateToIso(item.dueDate) : existing.dueDate,
                  notes: item.notes || existing.notes,
                  paymentLink: item.paymentLink || existing.paymentLink,
                  updatedAt: new Date(),
                })
                .where(eq(invoices.id, existing.id))
              updatedCount++
            } else {
              await db.insert(invoices).values({
                kind,
                number,
                status: item.status || "draft",
                clientName,
                clientEmail: item.clientEmail || null,
                currency: item.currency || "USD",
                items,
                total,
                taxRate: String(item.taxRate || "0"),
                issueDate: parseDateToIso(item.issueDate || item.date),
                dueDate: item.dueDate ? parseDateToIso(item.dueDate) : null,
                notes: item.notes || null,
                paymentLink: item.paymentLink || null,
                publicToken: newToken(),
              })
              insertedCount++
            }
          }
        } catch (dbErr) {
          console.warn("[invoices] DB write failed, saving to local seed file:", dbErr)
          const seedFile = resolve(process.cwd(), "data/invoices-seed.json")
          let existingList: any[] = []
          if (existsSync(seedFile)) {
            existingList = JSON.parse(readFileSync(seedFile, "utf-8"))
          }
          for (const item of list) {
            const idx = existingList.findIndex((it) => it.number === item.number)
            if (idx >= 0) {
              existingList[idx] = { ...existingList[idx], ...item }
              updatedCount++
            } else {
              existingList.push(item)
              insertedCount++
            }
          }
          writeFileSync(seedFile, JSON.stringify(existingList, null, 2), "utf-8")
        }

        try {
          revalidatePath("/admin/invoices")
        } catch {}
        return { ok: true, count: insertedCount, updated: updatedCount }
      } catch {
        // Not JSON, continue to CSV/TSV parser
      }
    }

    // 2. CSV / TSV / Delimited parser
    const lines: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i]
      if (char === '"') {
        inQuotes = !inQuotes
        current += char
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (current.trim().length > 0) lines.push(current)
        current = ""
        if (char === "\r" && csvText[i + 1] === "\n") i++
      } else {
        current += char
      }
    }
    if (current.trim().length > 0) lines.push(current)

    if (lines.length < 2) return { ok: false, error: "Uploaded content does not contain enough rows to import." }

    // Detect delimiter: tab, semicolon or comma
    const firstLine = lines[0]
    const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes(";") && !firstLine.includes(",") ? ";" : ","

    const splitRow = (row: string) => {
      const values: string[] = []
      let val = ""
      let quoted = false
      for (let i = 0; i < row.length; i++) {
        const c = row[i]
        if (c === '"') {
          if (quoted && row[i + 1] === '"') {
            val += '"'
            i++
          } else {
            quoted = !quoted
          }
        } else if (c === delimiter && !quoted) {
          values.push(val.trim())
          val = ""
        } else {
          val += c
        }
      }
      values.push(val.trim())
      return values
    }

    const rawHeaders = splitRow(lines[0])
    const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, "_"))

    // Group items by document key: (type + number + customer)
    type GroupedDoc = {
      kind: "quote" | "invoice"
      number: string
      clientName: string
      clientEmail: string | null
      currency: "NPR" | "AUD" | "USD"
      issueDate: string
      dueDate: string | null
      notes: string | null
      paymentLink: string | null
      taxRate: number
      items: { id: string; description: string; quantity: number; unitPrice: number; discount?: number }[]
      specifiedTotal?: number
    }

    const docsMap = new Map<string, GroupedDoc>()

    for (let i = 1; i < lines.length; i++) {
      const vals = splitRow(lines[i])
      if (!vals || vals.length === 0 || !vals.some((v) => v.length > 0)) continue
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h] = vals[idx] ?? ""
      })

      const customer = row.customer || row.client_name || row.client || "Client"
      const rawType = (row.type || row.kind || "invoice").toLowerCase().trim()
      const kind: "quote" | "invoice" = rawType.includes("quote") ? "quote" : "invoice"
      const rawNum = (row.number || row.invoice_number || `${i}`).trim()
      const number = rawNum.startsWith("INV-") || rawNum.startsWith("Q-") ? rawNum : `${kind === "quote" ? "Q" : "INV"}-${rawNum.padStart(2, "0")}`

      const rawCurrency = (row.currency || "USD").toUpperCase().trim()
      const currency = rawCurrency === "NPR" || rawCurrency === "AUD" || rawCurrency === "USD" ? rawCurrency : "USD"

      const issueDate = parseDateToIso(row.date || row.issue_date || row.created_at)
      const dueDate = row.due_date ? parseDateToIso(row.due_date) : null
      const notes = [row.notes, row.payment_terms ? `Payment terms: ${row.payment_terms}` : null, row.terms].filter(Boolean).join("\n\n") || null

      const key = `${kind}:${number}`

      if (!docsMap.has(key)) {
        docsMap.set(key, {
          kind,
          number,
          clientName: customer,
          clientEmail: row.email || row.client_email || null,
          currency,
          issueDate,
          dueDate,
          notes,
          paymentLink: row.notes?.includes("https://wise.com") ? "https://wise.com/pay/me/prajeshs8" : null,
          taxRate: Number(row.tax) || 0,
          items: [],
          specifiedTotal: row.total ? Number(row.total) : undefined,
        })
      }

      const doc = docsMap.get(key)!
      const itemTitle = (row.item || row.item_title || "").trim()
      const itemDesc = (row.description || "").trim()
      const fullDesc = [itemTitle, itemDesc].filter(Boolean).join(" - ") || "Service"
      const quantity = Math.max(1, Number(row.quantity) || 1)
      const unitPrice = Number(row.unit_cost || row.unit_price || row.price || 0)
      const discount = Math.abs(Number(row.discount || 0))

      // Avoid duplicate line items if repeated in CSV
      const existingSameItem = doc.items.find((it) => it.description === fullDesc && it.quantity === quantity && it.unitPrice === unitPrice)
      if (!existingSameItem) {
        doc.items.push({
          id: `item-${doc.items.length + 1}`,
          description: fullDesc,
          quantity,
          unitPrice,
          discount: discount > 0 ? discount : undefined,
        })
      }
    }

    let insertedCount = 0
    let updatedCount = 0

    // Try DB first, fallback to seed file
    try {
      await ensureSchema()
      for (const doc of docsMap.values()) {
        if (doc.items.length === 0) {
          doc.items.push({
            id: "item-1",
            description: "Services",
            quantity: 1,
            unitPrice: doc.specifiedTotal ?? 0,
          })
        }

        const calculated = documentTotals(doc.items, doc.taxRate)
        const total = (doc.specifiedTotal !== undefined && doc.specifiedTotal > 0 ? doc.specifiedTotal : calculated.total).toFixed(2)

        const [existing] = await db.select().from(invoices).where(eq(invoices.number, doc.number)).limit(1)

        if (existing) {
          await db
            .update(invoices)
            .set({
              clientName: doc.clientName,
              clientEmail: doc.clientEmail ?? existing.clientEmail,
              currency: doc.currency,
              items: doc.items,
              total,
              taxRate: doc.taxRate.toFixed(2),
              issueDate: doc.issueDate,
              dueDate: doc.dueDate,
              notes: doc.notes ?? existing.notes,
              paymentLink: doc.paymentLink ?? existing.paymentLink,
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, existing.id))
          updatedCount++
        } else {
          await db.insert(invoices).values({
            kind: doc.kind,
            number: doc.number,
            status: "draft",
            clientName: doc.clientName,
            clientEmail: doc.clientEmail,
            currency: doc.currency,
            items: doc.items,
            total,
            taxRate: doc.taxRate.toFixed(2),
            issueDate: doc.issueDate,
            dueDate: doc.dueDate,
            notes: doc.notes,
            paymentLink: doc.paymentLink,
            publicToken: newToken(),
          })
          insertedCount++
        }
      }
    } catch (dbErr) {
      console.warn("[invoices] DB write failed, saving to local seed file:", dbErr)
      try {
        const seedFile = resolve(process.cwd(), "data/invoices-seed.json")
        let existingList: any[] = []
        if (existsSync(seedFile)) {
          existingList = JSON.parse(readFileSync(seedFile, "utf-8"))
        }
        for (const doc of docsMap.values()) {
          if (doc.items.length === 0) {
            doc.items.push({ id: "item-1", description: "Services", quantity: 1, unitPrice: doc.specifiedTotal ?? 0 })
          }
          const calculated = documentTotals(doc.items, doc.taxRate)
          const total = (doc.specifiedTotal !== undefined && doc.specifiedTotal > 0 ? doc.specifiedTotal : calculated.total).toFixed(2)
          const seedEntry = {
            kind: doc.kind,
            number: doc.number,
            status: "draft",
            clientName: doc.clientName,
            clientEmail: doc.clientEmail,
            currency: doc.currency,
            items: doc.items,
            total,
            taxRate: String(doc.taxRate),
            issueDate: doc.issueDate,
            dueDate: doc.dueDate,
            notes: doc.notes,
            paymentLink: doc.paymentLink,
            publicToken: newToken(),
          }
          const idx = existingList.findIndex((item) => item.number === doc.number)
          if (idx >= 0) {
            existingList[idx] = { ...existingList[idx], ...seedEntry }
            updatedCount++
          } else {
            existingList.push(seedEntry)
            insertedCount++
          }
        }
        writeFileSync(seedFile, JSON.stringify(existingList, null, 2), "utf-8")
      } catch (fileErr) {
        console.error("[invoices] Local file save failed:", fileErr)
      }
    }

    try {
      revalidatePath("/admin/invoices")
    } catch {}
    return { ok: true, count: insertedCount, updated: updatedCount }
  } catch (error: any) {
    console.error("[invoices] importInvoicesFromCSV failed:", error)
    return { ok: false, error: error?.message || "Failed to process import." }
  }
}
