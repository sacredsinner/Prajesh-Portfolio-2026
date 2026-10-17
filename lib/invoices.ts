import { fromCents, toCents, type Currency } from "@/lib/money"

// Quotes and invoices share one shape ("documents"). Client-safe: no server imports.

export type DocumentKind = "quote" | "invoice"
export type InvoiceItem = { id: string; description: string; quantity: number; unitPrice: number }

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "converted"
export type InvoiceStatus = "draft" | "sent" | "paid" | "void"
export type DisplayStatus = QuoteStatus | InvoiceStatus | "overdue" | "expired"

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
  converted: "Invoiced",
  paid: "Paid",
  void: "Void",
  overdue: "Overdue",
  expired: "Expired",
}

export const KIND_LABELS: Record<DocumentKind, string> = { quote: "Quote", invoice: "Invoice" }

export function lineAmount(item: Pick<InvoiceItem, "quantity" | "unitPrice">) {
  return fromCents(Math.round((Number(item.quantity) || 0) * toCents(Number(item.unitPrice) || 0)))
}

export function documentTotals(items: Pick<InvoiceItem, "quantity" | "unitPrice">[], taxRate: number) {
  const subtotalCents = items.reduce((sum, item) => sum + Math.round((Number(item.quantity) || 0) * toCents(Number(item.unitPrice) || 0)), 0)
  const taxCents = Math.round((subtotalCents * (Number(taxRate) || 0)) / 100)
  return { subtotal: fromCents(subtotalCents), tax: fromCents(taxCents), total: fromCents(subtotalCents + taxCents) }
}

// YYYY-MM-DD in the business's time zone (Kathmandu), so "today" matches Prajesh's day.
export function today(timeZone = "Asia/Kathmandu") {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
}

export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function formatDate(isoDate: string | null | undefined) {
  if (!isoDate) return ""
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`))
}

// What the client and the list should show: a sent invoice past its due date is overdue,
// a sent quote past its valid-until date has expired.
export function displayStatus(doc: { kind: string; status: string; dueDate: string | null }, now = today()): DisplayStatus {
  if (doc.status === "sent" && doc.dueDate && doc.dueDate < now) return doc.kind === "invoice" ? "overdue" : "expired"
  return doc.status as DisplayStatus
}

export type CurrencySettings = { taxLabel: string; taxRate: number; paymentInstructions: string }

export type BusinessSettings = {
  businessName: string
  tagline: string
  email: string
  phone: string
  address: string
  taxId: string
  paymentTermsDays: number
  quoteValidDays: number
  remindersEnabled: boolean
  footerNote: string
  currencies: Record<Currency, CurrencySettings>
}
