import "server-only"

import { randomBytes } from "node:crypto"
import { eq, like } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { invoices } from "@/lib/db/schema"
import { displayStatus, formatDate, type DocumentKind } from "@/lib/invoices"
import { formatMoney, isCurrency, type Currency } from "@/lib/money"
import { buildDocumentPdf } from "@/lib/pdf/document-pdf"
import { getBusinessSettings } from "@/lib/settings"
import { SITE_URL } from "@/lib/site"

// Server helpers shared by the admin actions, the public page, the PDF route and the
// reminder job.

export type DocumentRow = typeof invoices.$inferSelect

export const newToken = () => randomBytes(18).toString("base64url")

export const documentUrl = (token: string) => `${SITE_URL}/i/${token}`
export const documentPdfUrl = (token: string) => `${SITE_URL}/i/${token}/pdf`

export function currencyOf(row: Pick<DocumentRow, "currency">): Currency {
  return isCurrency(row.currency) ? row.currency : "USD"
}

export function amountLabel(row: Pick<DocumentRow, "total" | "currency">) {
  return formatMoney(Number(row.total), currencyOf(row), 2)
}

export function dateLabel(row: Pick<DocumentRow, "kind" | "dueDate">) {
  return row.dueDate ? formatDate(row.dueDate) : row.kind === "quote" ? "no expiry" : "on receipt"
}

// INV-2026-001, Q-2026-001: numbered per year, per kind.
export async function nextDocumentNumber(kind: DocumentKind, year = new Date().getFullYear()) {
  const prefix = `${kind === "quote" ? "Q" : "INV"}-${year}-`
  const rows = await db.select({ number: invoices.number }).from(invoices).where(like(invoices.number, `${prefix}%`))
  const highest = rows.reduce((max, row) => Math.max(max, Number(row.number.slice(prefix.length)) || 0), 0)
  return `${prefix}${String(highest + 1).padStart(3, "0")}`
}

export async function findDocumentByToken(token: string) {
  if (!token) return undefined
  try {
    await ensureSchema()
    const [row] = await db.select().from(invoices).where(eq(invoices.publicToken, token)).limit(1)
    if (row) return row
  } catch (error) {
    console.warn("[documents] Database unavailable in findDocumentByToken, falling back to seed data:", error)
  }

  try {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const seedPath = path.join(process.cwd(), "data", "invoices-seed.json")
    const raw = await fs.readFile(seedPath, "utf-8")
    const seed = JSON.parse(raw)
    const match = seed.find((item: any) => item.publicToken === token)
    if (match) {
      return {
        id: match.id || 1,
        number: match.number,
        kind: match.kind || "invoice",
        status: match.status || "paid",
        clientName: match.clientName,
        clientCompany: match.clientCompany ?? null,
        clientEmail: match.clientEmail ?? null,
        currency: match.currency || "AUD",
        issueDate: match.issueDate,
        dueDate: match.dueDate ?? null,
        taxRate: String(match.taxRate ?? "0"),
        total: String(match.total),
        paymentLink: match.paymentLink ?? null,
        notes: match.notes ?? null,
        terms: match.terms ?? null,
        publicToken: match.publicToken,
        viewedAt: null,
        sentAt: null,
        paidAt: match.paidAt ? new Date(match.paidAt) : match.status === "paid" ? new Date(match.issueDate) : null,
        acceptedAt: null,
        declinedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: match.items || [],
      } as unknown as DocumentRow
    }
  } catch {
    // Seed fallback not found
  }

  return undefined
}

export async function documentPdf(row: DocumentRow) {
  const business = await getBusinessSettings()
  const bytes = await buildDocumentPdf(
    {
      kind: row.kind === "quote" ? "quote" : "invoice",
      number: row.number,
      status: displayStatus(row),
      clientName: row.clientName,
      clientCompany: row.clientCompany,
      clientEmail: row.clientEmail,
      clientAddress: row.clientAddress,
      currency: currencyOf(row),
      items: row.items,
      taxLabel: row.taxLabel,
      taxRate: Number(row.taxRate),
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      notes: row.notes,
      paymentLink: row.paymentLink,
      publicUrl: documentUrl(row.publicToken),
    },
    business,
  )
  return { bytes, filename: `${row.number}.pdf`, business }
}
