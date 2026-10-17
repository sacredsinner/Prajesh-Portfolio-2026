"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { convertQuoteToInvoice, deleteDocument, duplicateDocument, saveDocument, saveInvoiceSettings, sendDocument, setDocumentStatus } from "@/app/actions/invoices"
import { KIND_LABELS, STATUS_LABELS, addDays, displayStatus, documentTotals, formatDate, lineAmount, today, type BusinessSettings, type DisplayStatus, type DocumentKind, type InvoiceItem } from "@/lib/invoices"
import { CURRENCIES, CURRENCY_LABELS, formatMoney, isCurrency, type Currency } from "@/lib/money"
import { newId } from "@/lib/moodboards"
import { rateCard as buildRateCard, type Pricing } from "@/lib/packages"

export type AdminDocument = {
  id: string
  kind: string
  number: string
  status: string
  clientName: string
  clientCompany: string | null
  clientEmail: string | null
  clientAddress: string | null
  currency: string
  items: InvoiceItem[]
  taxLabel: string | null
  taxRate: string
  total: string
  issueDate: string
  dueDate: string | null
  notes: string | null
  paymentLink: string | null
  publicToken: string
  sentAt: Date | null
  viewedAt: Date | null
  acceptedBy: string | null
  paidAt: Date | null
  reminderCount: number
}

type Draft = {
  id?: string
  kind: DocumentKind
  number?: string
  clientName: string
  clientCompany: string
  clientEmail: string
  clientAddress: string
  currency: Currency
  items: InvoiceItem[]
  taxLabel: string
  taxRate: string
  issueDate: string
  dueDate: string
  notes: string
  paymentLink: string
}

type Lead = { name: string; email: string; company: string | null }

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
const labelClass = "grid gap-1.5 text-sm"
const chip = (status: DisplayStatus) =>
  `inline-flex rounded-full px-2.5 py-0.5 text-xs ${status === "paid" || status === "accepted" ? "bg-foreground text-background" : status === "overdue" || status === "expired" ? "border border-destructive text-destructive" : status === "draft" ? "border border-dashed border-border text-muted-foreground" : "border border-border"}`


function emptyDraft(kind: DocumentKind, settings: BusinessSettings): Draft {
  const currency: Currency = "NPR"
  const issueDate = today()
  return {
    kind,
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientAddress: "",
    currency,
    items: [{ id: newId(), description: "", quantity: 1, unitPrice: 0 }],
    taxLabel: settings.currencies[currency].taxLabel,
    taxRate: String(settings.currencies[currency].taxRate),
    issueDate,
    dueDate: addDays(issueDate, kind === "quote" ? settings.quoteValidDays : settings.paymentTermsDays),
    notes: "",
    paymentLink: "",
  }
}

function toDraft(doc: AdminDocument): Draft {
  return {
    id: doc.id,
    kind: doc.kind === "quote" ? "quote" : "invoice",
    number: doc.number,
    clientName: doc.clientName,
    clientCompany: doc.clientCompany ?? "",
    clientEmail: doc.clientEmail ?? "",
    clientAddress: doc.clientAddress ?? "",
    currency: isCurrency(doc.currency) ? doc.currency : "USD",
    items: doc.items.length ? doc.items : [{ id: newId(), description: "", quantity: 1, unitPrice: 0 }],
    taxLabel: doc.taxLabel ?? "",
    taxRate: String(Number(doc.taxRate)),
    issueDate: doc.issueDate,
    dueDate: doc.dueDate ?? "",
    notes: doc.notes ?? "",
    paymentLink: doc.paymentLink ?? "",
  }
}

export function InvoiceManager({ documents, settings, leads, pricing }: { documents: AdminDocument[]; settings: BusinessSettings; leads: Lead[]; pricing: Pricing }) {
  const router = useRouter()
  const [view, setView] = useState<"documents" | "settings">("documents")
  const [filter, setFilter] = useState<"all" | "quote" | "invoice" | "unpaid" | "paid">("all")
  const [editing, setEditing] = useState<Draft | null>(null)
  const [message, setMessage] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [sending, setSending] = useState<AdminDocument | null>(null)

  const now = today()
  const rows = documents.map((doc) => ({ doc, status: displayStatus(doc, now) }))
  const shown = rows.filter(({ doc, status }) =>
    filter === "all" ? true : filter === "quote" || filter === "invoice" ? doc.kind === filter : filter === "paid" ? status === "paid" : doc.kind === "invoice" && (status === "sent" || status === "overdue"),
  )

  const summary = useMemo(() => {
    const outstanding: Partial<Record<Currency, number>> = {}
    const paidThisYear: Partial<Record<Currency, number>> = {}
    let overdue = 0
    const year = now.slice(0, 4)
    for (const { doc, status } of rows) {
      if (doc.kind !== "invoice" || !isCurrency(doc.currency)) continue
      const total = Number(doc.total)
      if (status === "sent" || status === "overdue") outstanding[doc.currency] = (outstanding[doc.currency] ?? 0) + total
      if (status === "overdue") overdue++
      if (status === "paid" && (doc.paidAt ? new Date(doc.paidAt).getFullYear() === Number(year) : doc.issueDate.startsWith(year))) paidThisYear[doc.currency] = (paidThisYear[doc.currency] ?? 0) + total
    }
    const list = (values: Partial<Record<Currency, number>>) => CURRENCIES.filter((code) => values[code]).map((code) => formatMoney(values[code]!, code)).join(" · ") || "—"
    return { outstanding: list(outstanding), paid: list(paidThisYear), overdue }
  }, [rows, now])

  async function run(id: string, action: () => Promise<{ ok: true } | { ok: false; error: string }>, success: string) {
    setBusyId(id)
    setMessage("")
    try {
      const result = await action()
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setMessage(success)
      router.refresh()
    } catch {
      setMessage("Something went wrong. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusyId(null)
    }
  }

  if (editing) {
    return (
      <DocumentEditor
        initial={editing}
        settings={settings}
        leads={leads}
        pricing={pricing}
        onCancel={() => setEditing(null)}
        onSaved={(note) => {
          setEditing(null)
          setMessage(note)
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Content studio</p>
          <h1 className="mt-2 font-serif text-4xl">Invoices &amp; quotes</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setView("documents")} className={`rounded-full px-4 py-2 text-sm ${view === "documents" ? "bg-foreground text-background" : "border border-border"}`}>Documents</button>
          <button onClick={() => setView("settings")} className={`rounded-full px-4 py-2 text-sm ${view === "settings" ? "bg-foreground text-background" : "border border-border"}`}>Settings</button>
        </div>
      </div>

      {message && <p role="status" className="rounded-lg border border-border p-3 text-sm">{message}</p>}

      {view === "settings" ? (
        <SettingsForm settings={settings} onSaved={() => { setMessage("Settings saved."); router.refresh() }} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Outstanding</p><p className="mt-2 font-serif text-2xl">{summary.outstanding}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Overdue</p><p className="mt-2 font-serif text-2xl">{summary.overdue}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-xs uppercase tracking-widest text-muted-foreground">Paid this year</p><p className="mt-2 font-serif text-2xl">{summary.paid}</p></div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "quote", "invoice", "unpaid", "paid"] as const).map((key) => (
              <button key={key} onClick={() => setFilter(key)} className={`rounded-full px-3 py-1.5 text-xs ${filter === key ? "bg-foreground text-background" : "border border-border"}`}>
                {{ all: "All", quote: "Quotes", invoice: "Invoices", unpaid: "Unpaid", paid: "Paid" }[key]}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button onClick={() => { setMessage(""); setEditing(emptyDraft("quote", settings)) }} className="rounded-full border border-foreground px-4 py-2 text-sm">New quote</button>
              <button onClick={() => { setMessage(""); setEditing(emptyDraft("invoice", settings)) }} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">New invoice</button>
            </div>
          </div>

          {sending && (
            <SendPanel
              doc={sending}
              onCancel={() => setSending(null)}
              onSend={async (note) => {
                const doc = sending
                setSending(null)
                await run(doc.id, () => sendDocument(doc.id, note), `${KIND_LABELS[doc.kind === "quote" ? "quote" : "invoice"]} ${doc.number} sent to ${doc.clientEmail}.`)
              }}
            />
          )}

          <section className="grid gap-3">
            {shown.map(({ doc, status }) => {
              const currency: Currency = isCurrency(doc.currency) ? doc.currency : "USD"
              const busy = busyId === doc.id
              return (
                <article key={doc.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        {KIND_LABELS[doc.kind === "quote" ? "quote" : "invoice"]} · {doc.number} <span className={chip(status)}>{STATUS_LABELS[status]}</span>
                      </p>
                      <h2 className="mt-2 font-serif text-2xl">{doc.clientName}{doc.clientCompany ? ` · ${doc.clientCompany}` : ""}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Issued {formatDate(doc.issueDate)}
                        {doc.dueDate ? ` · ${doc.kind === "quote" ? "valid until" : "due"} ${formatDate(doc.dueDate)}` : ""}
                        {doc.viewedAt ? " · viewed by client" : ""}
                        {doc.acceptedBy ? ` · accepted by ${doc.acceptedBy}` : ""}
                        {doc.reminderCount ? ` · ${doc.reminderCount} reminder${doc.reminderCount === 1 ? "" : "s"} sent` : ""}
                      </p>
                    </div>
                    <p className="font-serif text-2xl sm:text-right">{formatMoney(Number(doc.total), currency, 2)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled={busy} onClick={() => { setMessage(""); setEditing(toDraft(doc)) }} className="rounded-lg border border-border px-3 py-1.5 text-sm">Edit</button>
                    <button disabled={busy || !doc.clientEmail} title={doc.clientEmail ? undefined : "Add the client's email first"} onClick={() => setSending(doc)} className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40">{doc.sentAt ? "Send again" : "Send"}</button>
                    <a href={`/i/${doc.publicToken}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-sm">View</a>
                    <a href={`/i/${doc.publicToken}/pdf`} className="rounded-lg border border-border px-3 py-1.5 text-sm">PDF</a>
                    <button disabled={busy} onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/i/${doc.publicToken}`).then(() => setMessage(`Link to ${doc.number} copied.`))} className="rounded-lg border border-border px-3 py-1.5 text-sm">Copy link</button>
                    {doc.kind === "invoice" && status !== "paid" && status !== "void" && <button disabled={busy} onClick={() => run(doc.id, () => setDocumentStatus(doc.id, "paid"), `${doc.number} marked as paid.`)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Mark paid</button>}
                    {doc.kind === "invoice" && status === "paid" && <button disabled={busy} onClick={() => run(doc.id, () => setDocumentStatus(doc.id, doc.sentAt ? "sent" : "draft"), `${doc.number} marked as unpaid.`)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Mark unpaid</button>}
                    {doc.kind === "quote" && (status === "sent" || status === "accepted" || status === "draft" || status === "expired") && <button disabled={busy} onClick={() => run(doc.id, () => convertQuoteToInvoice(doc.id), `${doc.number} turned into a draft invoice.`)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Turn into invoice</button>}
                    {doc.kind === "quote" && status === "sent" && <button disabled={busy} onClick={() => run(doc.id, () => setDocumentStatus(doc.id, "declined"), `${doc.number} marked as declined.`)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Declined</button>}
                    <button disabled={busy} onClick={() => run(doc.id, () => duplicateDocument(doc.id), `Copy of ${doc.number} created as a draft.`)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Duplicate</button>
                    {doc.kind === "invoice" && status !== "void" && status !== "paid" && <button disabled={busy} onClick={() => { if (window.confirm(`Void ${doc.number}? The client link will stop working.`)) void run(doc.id, () => setDocumentStatus(doc.id, "void"), `${doc.number} voided.`) }} className="rounded-lg border border-border px-3 py-1.5 text-sm">Void</button>}
                    <button disabled={busy} onClick={() => { if (window.confirm(`Delete ${doc.number} permanently?`)) void run(doc.id, () => deleteDocument(doc.id), `${doc.number} deleted.`) }} className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive">Delete</button>
                  </div>
                </article>
              )
            })}
            {shown.length === 0 && <p className="text-muted-foreground">{documents.length ? "Nothing matches this filter." : "No quotes or invoices yet. Start with a quote, then turn it into an invoice once it's accepted."}</p>}
          </section>
        </>
      )}
    </div>
  )
}

function SendPanel({ doc, onCancel, onSend }: { doc: AdminDocument; onCancel: () => void; onSend: (message: string) => void }) {
  const [note, setNote] = useState("")
  const label = doc.kind === "quote" ? "quote" : "invoice"
  return (
    <div className="rounded-xl border border-foreground p-4">
      <p className="font-serif text-xl">Send {label} {doc.number}</p>
      <p className="mt-1 text-sm text-muted-foreground">To {doc.clientEmail}, from your site&apos;s address, with the PDF attached and a link to view it online. Replies come to your Gmail.</p>
      <label className={`${labelClass} mt-4`}>Message (optional)<textarea className={`${inputClass} min-h-24`} value={note} onChange={(e) => setNote(e.target.value)} placeholder={`Leave empty to use the standard ${label} email.`} maxLength={4000} /></label>
      <div className="mt-4 flex gap-3"><button onClick={() => onSend(note)} className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background">Send {label}</button><button onClick={onCancel} className="text-sm underline">Cancel</button></div>
    </div>
  )
}

function DocumentEditor({ initial, settings, leads, pricing, onCancel, onSaved }: { initial: Draft; settings: BusinessSettings; leads: Lead[]; pricing: Pricing; onCancel: () => void; onSaved: (message: string) => void }) {
  const rateCard = (currency: Currency) => buildRateCard(pricing, currency)
  const [draft, setDraft] = useState<Draft>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((old) => ({ ...old, [key]: value }))
  const setItem = (id: string, patch: Partial<InvoiceItem>) => setDraft((old) => ({ ...old, items: old.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }))
  const moveItem = (index: number, by: number) =>
    setDraft((old) => {
      const items = [...old.items]
      const target = index + by
      if (target < 0 || target >= items.length) return old
      ;[items[index], items[target]] = [items[target], items[index]]
      return { ...old, items }
    })
  const totals = documentTotals(draft.items, Number(draft.taxRate) || 0)
  const money = (value: number) => formatMoney(value, draft.currency, 2)
  const isQuote = draft.kind === "quote"

  function changeCurrency(currency: Currency) {
    setDraft((old) => ({ ...old, currency, ...(old.id ? {} : { taxLabel: settings.currencies[currency].taxLabel, taxRate: String(settings.currencies[currency].taxRate) }) }))
  }
  function changeIssueDate(issueDate: string) {
    setDraft((old) => ({ ...old, issueDate, dueDate: old.id || !issueDate ? old.dueDate : addDays(issueDate, isQuote ? settings.quoteValidDays : settings.paymentTermsDays) }))
  }

  async function save(sendAfter: boolean) {
    setBusy(true)
    setError("")
    try {
      const result = await saveDocument({
        ...draft,
        taxRate: Number(draft.taxRate) || 0,
        items: draft.items.filter((item) => item.description.trim() || Number(item.unitPrice)),
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      if (sendAfter) {
        const sent = await sendDocument(result.id)
        if (!sent.ok) {
          setError(`Saved, but not sent: ${sent.error}`)
          return
        }
        onSaved(`${isQuote ? "Quote" : "Invoice"} saved and sent to ${draft.clientEmail}.`)
        return
      }
      onSaved(`${isQuote ? "Quote" : "Invoice"} saved.`)
    } catch {
      setError("Couldn't save. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(false) }} className="grid gap-6 rounded-2xl border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">{draft.id ? `Edit ${isQuote ? "quote" : "invoice"} ${draft.number}` : `New ${isQuote ? "quote" : "invoice"}`}</h1>
        <button type="button" onClick={onCancel} className="text-sm underline">Cancel</button>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Client</legend>
        {leads.length > 0 && (
          <label className={`${labelClass} sm:col-span-2`}>Fill in from an enquiry
            <select className={inputClass} value="" onChange={(e) => { const lead = leads[Number(e.target.value)]; if (lead) setDraft((old) => ({ ...old, clientName: lead.name, clientEmail: lead.email, clientCompany: lead.company ?? "" })) }}>
              <option value="">Choose a contact…</option>
              {leads.map((lead, index) => <option key={`${lead.email}-${index}`} value={index}>{lead.name}{lead.company ? ` · ${lead.company}` : ""} ({lead.email})</option>)}
            </select>
          </label>
        )}
        <label className={labelClass}>Name<input className={inputClass} value={draft.clientName} onChange={(e) => set("clientName", e.target.value)} required maxLength={160} /></label>
        <label className={labelClass}>Company<input className={inputClass} value={draft.clientCompany} onChange={(e) => set("clientCompany", e.target.value)} maxLength={160} placeholder="Optional" /></label>
        <label className={labelClass}>Email<input className={inputClass} type="email" value={draft.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} maxLength={200} placeholder="Needed to send it" /></label>
        <label className={labelClass}>Address<textarea className={inputClass} rows={2} value={draft.clientAddress} onChange={(e) => set("clientAddress", e.target.value)} maxLength={600} placeholder="Optional" /></label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Details</legend>
        <label className={labelClass}>Currency<select className={inputClass} value={draft.currency} onChange={(e) => changeCurrency(e.target.value as Currency)}>{CURRENCIES.map((code) => <option key={code} value={code}>{CURRENCY_LABELS[code]}</option>)}</select></label>
        <label className={labelClass}>Issue date<input className={inputClass} type="date" value={draft.issueDate} onChange={(e) => changeIssueDate(e.target.value)} required /></label>
        <label className={labelClass}>{isQuote ? "Valid until" : "Due date"}<input className={inputClass} type="date" value={draft.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></label>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Line items</legend>
        <div className="hidden grid-cols-[1fr_5rem_9rem_8rem_auto] gap-3 text-xs uppercase tracking-widest text-muted-foreground sm:grid"><span>Description</span><span>Qty</span><span>Unit price</span><span className="text-right">Amount</span><span /></div>
        {draft.items.map((item, index) => (
          <div key={item.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_5rem_9rem_8rem_auto] sm:items-start sm:gap-3 sm:border-0 sm:p-0">
            <textarea aria-label="Description" className={inputClass} rows={item.description.length > 70 ? 3 : 1} value={item.description} onChange={(e) => setItem(item.id, { description: e.target.value })} maxLength={600} placeholder="What's included" />
            <input aria-label="Quantity" className={inputClass} type="number" min={0} step="any" value={item.quantity} onChange={(e) => setItem(item.id, { quantity: Number(e.target.value) })} />
            <input aria-label="Unit price" className={inputClass} type="number" step="0.01" value={item.unitPrice} onChange={(e) => setItem(item.id, { unitPrice: Number(e.target.value) })} />
            <p className="py-2 text-sm sm:text-right">{money(lineAmount(item))}</p>
            <div className="flex gap-1">
              <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move up">↑</button>
              <button type="button" onClick={() => moveItem(index, 1)} disabled={index === draft.items.length - 1} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move down">↓</button>
              <button type="button" onClick={() => setDraft((old) => ({ ...old, items: old.items.length > 1 ? old.items.filter((row) => row.id !== item.id) : old.items }))} className="rounded border border-border px-2 py-1 text-xs" aria-label="Remove line">×</button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setDraft((old) => ({ ...old, items: [...old.items, { id: newId(), description: "", quantity: 1, unitPrice: 0 }] }))} className="rounded-lg border border-border px-3 py-2 text-sm">Add line</button>
          <select className={`${inputClass} w-auto`} value="" onChange={(e) => { const rate = rateCard(draft.currency)[Number(e.target.value)]; if (rate) setDraft((old) => ({ ...old, items: [...old.items.filter((row) => row.description.trim() || Number(row.unitPrice)), { id: newId(), description: rate.description, quantity: 1, unitPrice: rate.price }] })) }}>
            <option value="">Add from your rate card…</option>
            {rateCard(draft.currency).map((rate, index) => <option key={rate.label} value={index}>{rate.label} — {formatMoney(rate.price, draft.currency)}</option>)}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Tax and totals</legend>
        <label className={labelClass}>Tax name<input className={inputClass} value={draft.taxLabel} onChange={(e) => set("taxLabel", e.target.value)} maxLength={30} placeholder="GST, VAT…" /></label>
        <label className={labelClass}>Tax rate (%)<input className={inputClass} type="number" min={0} max={100} step="0.01" value={draft.taxRate} onChange={(e) => set("taxRate", e.target.value)} /></label>
        <dl className="space-y-1 rounded-lg bg-secondary/50 p-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          {Number(draft.taxRate) > 0 && <div className="flex justify-between"><dt>{draft.taxLabel || "Tax"} ({draft.taxRate}%)</dt><dd>{money(totals.tax)}</dd></div>}
          <div className="flex justify-between border-t border-border pt-1 font-semibold"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
        </dl>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Extras</legend>
        {!isQuote && <label className={labelClass}>Online payment link<input className={inputClass} type="url" value={draft.paymentLink} onChange={(e) => set("paymentLink", e.target.value)} placeholder="Optional: a Stripe, PayPal or Wise link" /></label>}
        <label className={`${labelClass} ${isQuote ? "sm:col-span-2" : ""}`}>Notes for the client<textarea className={inputClass} rows={3} value={draft.notes} onChange={(e) => set("notes", e.target.value)} maxLength={4000} placeholder={isQuote ? "Scope, timeline, what happens next…" : "Optional"} /></label>
        <p className="text-xs text-muted-foreground sm:col-span-2">Your business details and {draft.currency} payment instructions come from Settings and are added automatically.</p>
      </fieldset>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} className="rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
        <button type="button" disabled={busy || !draft.clientEmail} onClick={() => void save(true)} className="rounded-full border border-foreground px-5 py-3 text-sm disabled:opacity-40">Save and send</button>
        {!draft.clientEmail && <span className="text-xs text-muted-foreground">Add an email to send it.</span>}
      </div>
    </form>
  )
}

function SettingsForm({ settings, onSaved }: { settings: BusinessSettings; onSaved: () => void }) {
  const [data, setData] = useState<BusinessSettings>(settings)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const set = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => setData((old) => ({ ...old, [key]: value }))
  const setCurrency = (code: Currency, patch: Partial<BusinessSettings["currencies"][Currency]>) => setData((old) => ({ ...old, currencies: { ...old.currencies, [code]: { ...old.currencies[code], ...patch } } }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const result = await saveInvoiceSettings(data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved()
    } catch {
      setError("Couldn't save. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-2xl border border-border p-4 sm:p-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Your details on every quote and invoice</legend>
        <label className={labelClass}>Business name<input className={inputClass} value={data.businessName} onChange={(e) => set("businessName", e.target.value)} required /></label>
        <label className={labelClass}>Tagline<input className={inputClass} value={data.tagline} onChange={(e) => set("tagline", e.target.value)} /></label>
        <label className={labelClass}>Email<input className={inputClass} type="email" value={data.email} onChange={(e) => set("email", e.target.value)} required /></label>
        <label className={labelClass}>Phone<input className={inputClass} value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" /></label>
        <label className={labelClass}>Address<textarea className={inputClass} rows={2} value={data.address} onChange={(e) => set("address", e.target.value)} /></label>
        <label className={labelClass}>Tax number<input className={inputClass} value={data.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="e.g. PAN or ABN (optional)" /></label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Defaults</legend>
        <label className={labelClass}>Invoices due after (days)<input className={inputClass} type="number" min={0} max={365} value={data.paymentTermsDays} onChange={(e) => set("paymentTermsDays", Number(e.target.value))} /></label>
        <label className={labelClass}>Quotes valid for (days)<input className={inputClass} type="number" min={1} max={365} value={data.quoteValidDays} onChange={(e) => set("quoteValidDays", Number(e.target.value))} /></label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" checked={data.remindersEnabled} onChange={(e) => set("remindersEnabled", e.target.checked)} /> Send overdue reminders</label>
        <p className="text-xs text-muted-foreground sm:col-span-3">Reminders go out the day after an invoice is due, then weekly, up to three times. Mark an invoice as paid to stop them.</p>
        <label className={`${labelClass} sm:col-span-3`}>Closing line<input className={inputClass} value={data.footerNote} onChange={(e) => set("footerNote", e.target.value)} placeholder="Thank you for your business." /></label>
      </fieldset>

      {CURRENCIES.map((code) => (
        <fieldset key={code} className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1fr_3fr]">
          <legend className="px-1 text-xs uppercase tracking-widest text-muted-foreground">{CURRENCY_LABELS[code]}</legend>
          <label className={labelClass}>Tax name<input className={inputClass} value={data.currencies[code].taxLabel} onChange={(e) => setCurrency(code, { taxLabel: e.target.value })} /></label>
          <label className={labelClass}>Default tax rate (%)<input className={inputClass} type="number" min={0} max={100} step="0.01" value={data.currencies[code].taxRate} onChange={(e) => setCurrency(code, { taxRate: Number(e.target.value) })} /></label>
          <label className={labelClass}>Payment instructions<textarea className={inputClass} rows={4} value={data.currencies[code].paymentInstructions} onChange={(e) => setCurrency(code, { paymentInstructions: e.target.value })} placeholder="Bank name, account name and number, SWIFT, or an eSewa / PayPal ID. Shown on unpaid invoices." /></label>
        </fieldset>
      ))}
      <p className="text-xs text-muted-foreground">Only add a tax rate once you&apos;re registered for it (GST in Australia, VAT in Nepal). Leave it at 0 otherwise.</p>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="w-fit rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">{busy ? "Saving…" : "Save settings"}</button>
    </form>
  )
}
