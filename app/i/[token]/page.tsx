import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { Download } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { AcceptQuoteForm } from "@/components/documents/accept-quote-form"
import { auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { invoices } from "@/lib/db/schema"
import { currencyOf, findDocumentByToken } from "@/lib/documents"
import { STATUS_LABELS, displayStatus, documentTotals, formatDate, lineAmount, today } from "@/lib/invoices"
import { formatMoney } from "@/lib/money"
import { getBusinessSettings } from "@/lib/settings"

// A client's quote or invoice: /i/<token>. Private (unguessable link, not indexed).
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const row = await findDocumentByToken(token)
  const title = row ? `${row.kind === "quote" ? "Quote" : "Invoice"} ${row.number}` : "Not found"
  return { title, robots: { index: false, follow: false } }
}

export default async function DocumentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const row = await findDocumentByToken(token)
  if (!row || row.status === "void") notFound()

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const isAdmin = isAdminUser(session?.user)
  // Note the client's first visit (not Prajesh's own previews).
  if (!isAdmin && !row.viewedAt) await db.update(invoices).set({ viewedAt: new Date() }).where(eq(invoices.id, row.id))

  const business = await getBusinessSettings()
  const currency = currencyOf(row)
  const taxRate = Number(row.taxRate)
  const totals = documentTotals(row.items, taxRate)
  const status = displayStatus(row)
  const isQuote = row.kind === "quote"
  const label = isQuote ? "Quote" : "Invoice"
  const payment = business.currencies[currency]?.paymentInstructions?.trim()
  const money = (value: number) => formatMoney(value, currency, 2)
  const canAccept = isQuote && row.status === "sent" && !(row.dueDate && row.dueDate < today())

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {isAdmin && <p className="mb-6 border border-dashed border-border p-3 text-xs text-muted-foreground print:hidden">You&apos;re viewing this as the admin. This is exactly what your client sees.</p>}
        <article className="border border-border bg-white p-6 sm:p-10 print:border-0 print:p-0">
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
            <div className="flex items-center gap-3">
              <BrandMark className="h-8 w-8" />
              <span className="text-[12px] font-semibold uppercase tracking-[0.3em]">{business.businessName}</span>
            </div>
            <div className="text-right">
              <h1 className="font-serif text-5xl leading-none">{label}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{row.number}</p>
              {["paid", "accepted", "overdue", "expired", "converted"].includes(status) && (
                <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.2em] ${status === "overdue" ? "text-destructive" : ""}`}>{STATUS_LABELS[status]}</p>
              )}
            </div>
          </header>

          <section className="grid gap-8 border-b border-border py-8 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">From</p>
              <div className="mt-3 space-y-0.5 text-sm leading-relaxed">
                {[business.businessName, business.tagline, business.email, business.phone, business.address, business.taxId].filter(Boolean).map((line) => <p key={line} className="whitespace-pre-line">{line}</p>)}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{isQuote ? "Prepared for" : "Billed to"}</p>
              <div className="mt-3 space-y-0.5 text-sm leading-relaxed">
                {[row.clientName, row.clientCompany, row.clientEmail, row.clientAddress].filter(Boolean).map((line) => <p key={line} className="whitespace-pre-line">{line}</p>)}
              </div>
            </div>
            <dl className="space-y-3 text-sm sm:text-right">
              <div><dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Issued</dt><dd className="mt-1">{formatDate(row.issueDate)}</dd></div>
              {row.dueDate && <div><dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{isQuote ? "Valid until" : "Due"}</dt><dd className="mt-1">{formatDate(row.dueDate)}</dd></div>}
              <div><dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Currency</dt><dd className="mt-1">{currency}</dd></div>
            </dl>
          </section>

          <section className="py-6">
            <div className="hidden grid-cols-[1fr_4rem_8rem_8rem] gap-4 border-b border-border pb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:grid">
              <span>Description</span><span className="text-right">Qty</span><span className="text-right">Unit price</span><span className="text-right">Amount</span>
            </div>
            {row.items.map((item) => (
              <div key={item.id} className="grid gap-1 border-b border-border py-4 text-sm sm:grid-cols-[1fr_4rem_8rem_8rem] sm:gap-4">
                <p className="whitespace-pre-line">{item.description}</p>
                <p className="text-muted-foreground sm:text-right"><span className="sm:hidden">Qty </span>{item.quantity}</p>
                <p className="text-muted-foreground sm:text-right"><span className="sm:hidden">× </span>{money(item.unitPrice)}</p>
                <p className="font-medium sm:text-right">{money(lineAmount(item))}</p>
              </div>
            ))}
            <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
              {taxRate > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">{row.taxLabel || "Tax"} ({taxRate}%)</dt><dd>{money(totals.tax)}</dd></div>}
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{isQuote ? "Total" : status === "paid" ? "Total paid" : "Total due"}</dt>
                <dd className="font-serif text-3xl">{money(totals.total)}</dd>
              </div>
            </dl>
          </section>

          {!isQuote && status !== "paid" && (payment || row.paymentLink) && (
            <section className="space-y-4 border-t border-border py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">How to pay</p>
              {payment && <p className="whitespace-pre-line text-sm leading-relaxed">{payment}</p>}
              {row.paymentLink && <a href={row.paymentLink} target="_blank" rel="noopener noreferrer" className="inline-flex bg-foreground px-6 py-3 text-sm tracking-wide text-background print:hidden">Pay online ↗</a>}
            </section>
          )}
          {row.notes && (
            <section className="space-y-3 border-t border-border py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Notes</p>
              <p className="whitespace-pre-line text-sm leading-relaxed">{row.notes}</p>
            </section>
          )}
          {isQuote && row.acceptedBy && (row.status === "accepted" || row.status === "converted") && (
            <p className="border-t border-border pt-6 text-sm">Accepted by <strong>{row.acceptedBy}</strong>{row.acceptedAt ? ` on ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kathmandu" }).format(row.acceptedAt)}` : ""}. Thank you.</p>
          )}
          {business.footerNote && <p className="mt-8 font-serif text-xl italic">{business.footerNote}</p>}
        </article>

        <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
          <a href={`/i/${row.publicToken}/pdf`} className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-sm"><Download className="h-4 w-4" aria-hidden="true" /> Download PDF</a>
          <p className="text-xs text-muted-foreground">Questions? Reply to the email this came with, or write to {business.email}.</p>
        </div>
        {canAccept && <div className="mt-8"><AcceptQuoteForm token={row.publicToken} /></div>}
        {isQuote && status === "expired" && <p className="mt-8 text-sm text-muted-foreground print:hidden">This quote has expired. Get in touch and I&apos;ll send a fresh one.</p>}
      </div>
    </main>
  )
}
