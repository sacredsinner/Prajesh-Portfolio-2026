"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  convertQuoteToInvoice,
  deleteDocument,
  duplicateDocument,
  importInvoicesFromCSV,
  saveDocument,
  saveInvoiceSettings,
  sendDocument,
  setDocumentStatus,
} from "@/app/actions/invoices"
import {
  KIND_LABELS,
  STATUS_LABELS,
  addDays,
  displayStatus,
  documentTotals,
  formatDate,
  lineAmount,
  today,
  type BusinessSettings,
  type DisplayStatus,
  type DocumentKind,
  type InvoiceItem,
} from "@/lib/invoices"
import { CURRENCIES, CURRENCY_LABELS, formatMoney, isCurrency, type Currency } from "@/lib/money"
import { newId } from "@/lib/moodboards"
import { rateCard as buildRateCard, type Pricing } from "@/lib/packages"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Search,
  Upload,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

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
  `inline-flex rounded-full px-2.5 py-0.5 text-xs ${
    status === "paid" || status === "accepted"
      ? "bg-foreground text-background"
      : status === "overdue" || status === "expired"
      ? "border border-destructive text-destructive"
      : status === "draft"
      ? "border border-dashed border-border text-muted-foreground"
      : "border border-border"
  }`

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
    items: [{ id: newId(), description: "", quantity: 1, unitPrice: 0, discount: 0 }],
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
    items: doc.items.length
      ? doc.items.map((it) => ({ ...it, discount: it.discount || 0 }))
      : [{ id: newId(), description: "", quantity: 1, unitPrice: 0, discount: 0 }],
    taxLabel: doc.taxLabel ?? "",
    taxRate: String(Number(doc.taxRate)),
    issueDate: doc.issueDate,
    dueDate: doc.dueDate ?? "",
    notes: doc.notes ?? "",
    paymentLink: doc.paymentLink ?? "",
  }
}

export function InvoiceManager({
  documents,
  settings,
  leads,
  pricing,
}: {
  documents: AdminDocument[]
  settings: BusinessSettings
  leads: Lead[]
  pricing: Pricing
}) {
  const router = useRouter()
  const [view, setView] = useState<"documents" | "clients" | "settings">("documents")
  const [filter, setFilter] = useState<"all" | "quote" | "invoice" | "unpaid" | "paid">("all")
  const [editing, setEditing] = useState<Draft | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [sending, setSending] = useState<AdminDocument | null>(null)
  const [search, setSearch] = useState("")
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; number: string; action: "delete" | "void" } | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [importing, setImporting] = useState(false)

  const now = today()
  const rows = documents.map((doc) => ({ doc, status: displayStatus(doc, now) }))
  const shown = rows.filter(({ doc, status }) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "quote" || filter === "invoice"
        ? doc.kind === filter
        : filter === "paid"
        ? status === "paid"
        : doc.kind === "invoice" && (status === "sent" || status === "overdue")
    if (!matchesFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      doc.number.toLowerCase().includes(q) ||
      doc.clientName.toLowerCase().includes(q) ||
      doc.clientCompany?.toLowerCase().includes(q) ||
      doc.clientEmail?.toLowerCase().includes(q)
    )
  })

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
      if (status === "paid" && (doc.paidAt ? new Date(doc.paidAt).getFullYear() === Number(year) : doc.issueDate.startsWith(year)))
        paidThisYear[doc.currency] = (paidThisYear[doc.currency] ?? 0) + total
    }
    const list = (values: Partial<Record<Currency, number>>) =>
      CURRENCIES.filter((code) => values[code])
        .map((code) => formatMoney(values[code]!, code))
        .join(" · ") || "—"
    return { outstanding: list(outstanding), paid: list(paidThisYear), overdue }
  }, [rows, now])

  // Clients breakdown (Lifetime Value & Billing stats)
  const clientsSummary = useMemo(() => {
    type ClientStat = {
      name: string
      company: string | null
      email: string | null
      invoiced: Partial<Record<Currency, number>>
      paid: Partial<Record<Currency, number>>
      pending: Partial<Record<Currency, number>>
      invoicesCount: number
      quotesCount: number
      latestDate: string
    }
    const map = new Map<string, ClientStat>()

    for (const { doc, status } of rows) {
      const key = doc.clientName.trim().toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          name: doc.clientName,
          company: doc.clientCompany,
          email: doc.clientEmail,
          invoiced: {},
          paid: {},
          pending: {},
          invoicesCount: 0,
          quotesCount: 0,
          latestDate: doc.issueDate,
        })
      }
      const entry = map.get(key)!
      if (doc.clientEmail && !entry.email) entry.email = doc.clientEmail
      if (doc.clientCompany && !entry.company) entry.company = doc.clientCompany
      if (doc.issueDate > entry.latestDate) entry.latestDate = doc.issueDate

      const currency = isCurrency(doc.currency) ? doc.currency : "USD"
      const total = Number(doc.total)

      if (doc.kind === "invoice") {
        entry.invoicesCount++
        entry.invoiced[currency] = (entry.invoiced[currency] ?? 0) + total
        if (status === "paid") {
          entry.paid[currency] = (entry.paid[currency] ?? 0) + total
        } else if (status === "sent" || status === "overdue") {
          entry.pending[currency] = (entry.pending[currency] ?? 0) + total
        }
      } else {
        entry.quotesCount++
      }
    }

    return Array.from(map.values()).sort((a, b) => b.latestDate.localeCompare(a.latestDate))
  }, [rows])

  async function run(id: string, action: () => Promise<{ ok: true } | { ok: false; error: string }>, success: string) {
    setBusyId(id)
    try {
      const result = await action()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(success)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please check your connection and retry.")
    } finally {
      setBusyId(null)
    }
  }

  // Export current list to CSV
  function handleExportCSV() {
    const headers = ["Number", "Type", "Client Name", "Client Company", "Client Email", "Issue Date", "Due Date", "Currency", "Total", "Status", "Items"]
    const csvLines = [headers.join(",")]

    for (const { doc, status } of shown) {
      const itemsText = doc.items.map((it) => `${it.quantity}x ${it.description} (${it.unitPrice})`).join(" | ")
      const row = [
        `"${doc.number}"`,
        `"${doc.kind}"`,
        `"${doc.clientName.replace(/"/g, '""')}"`,
        `"${(doc.clientCompany || "").replace(/"/g, '""')}"`,
        `"${doc.clientEmail || ""}"`,
        `"${doc.issueDate}"`,
        `"${doc.dueDate || ""}"`,
        `"${doc.currency}"`,
        `"${doc.total}"`,
        `"${status}"`,
        `"${itemsText.replace(/"/g, '""')}"`,
      ]
      csvLines.push(row.join(","))
    }

    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `invoices-${today()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${shown.length} documents to CSV`)
  }

  // Copy ready-to-send payment reminder text for WhatsApp / Email
  function copyClientMessage(doc: AdminDocument, currency: Currency) {
    const link = `${window.location.origin}/i/${doc.publicToken}`
    const bankDetails = settings.currencies[currency]?.paymentInstructions?.trim()
    const message = [
      `Hi ${doc.clientName},`,
      ``,
      `Here is ${doc.kind === "quote" ? "Quote" : "Invoice"} ${doc.number} for ${formatMoney(Number(doc.total), currency, 2)}.`,
      doc.dueDate ? `Due date: ${formatDate(doc.dueDate)}` : null,
      ``,
      `View & pay online:`,
      link,
      bankDetails ? `\nBank transfer details:\n${bankDetails}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n")

    navigator.clipboard?.writeText(message)
    toast.success(`Client reminder message for ${doc.clientName} copied!`)
  }

  // Handle CSV file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setImportText(text)
  }

  async function executeImport() {
    if (!importText.trim()) {
      toast.error("Please paste or upload CSV data first.")
      return
    }
    setImporting(true)
    try {
      const result = await importInvoicesFromCSV(importText)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Successfully imported ${result.count} new invoices and updated ${result.updated}!`)
      setImportModalOpen(false)
      setImportText("")
      router.refresh()
    } catch {
      toast.error("Import failed. Please check the CSV format and try again.")
    } finally {
      setImporting(false)
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
          toast.success(note)
          router.refresh()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl">Invoices &amp; quotes</h2>
          <p className="mt-1 text-xs text-muted-foreground">Manage client billing, quotes, currencies, taxes and track document view status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setView("documents")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              view === "documents" ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setView("clients")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              view === "clients" ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            Clients &amp; LTV
          </button>
          <button
            onClick={() => setView("settings")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              view === "settings" ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {view === "settings" ? (
        <SettingsForm
          settings={settings}
          onSaved={() => {
            toast.success("Settings saved.")
            router.refresh()
          }}
        />
      ) : view === "clients" ? (
        /* Clients & Lifetime Value View */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl">Client Billing Summary</h3>
              <p className="text-xs text-muted-foreground">Lifetime volume, collected payments, and pending balances by client.</p>
            </div>
            <span className="text-xs text-muted-foreground">{clientsSummary.length} active clients</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clientsSummary.map((client) => {
              const formatCurrencies = (record: Partial<Record<Currency, number>>) =>
                CURRENCIES.filter((code) => record[code])
                  .map((code) => formatMoney(record[code]!, code))
                  .join(" · ") || "—"

              const invoicedStr = formatCurrencies(client.invoiced)
              const paidStr = formatCurrencies(client.paid)
              const pendingStr = formatCurrencies(client.pending)

              return (
                <div key={client.name} className="flex flex-col justify-between rounded-xl border border-border p-4 transition-colors hover:border-foreground/30">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-lg font-medium">{client.name}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {client.invoicesCount} inv · {client.quotesCount} quote{client.quotesCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                    {client.email && <p className="text-xs text-muted-foreground mt-0.5 font-mono">{client.email}</p>}

                    <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Invoiced:</span>
                        <span className="font-medium">{invoicedStr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid to date:</span>
                        <span className="text-emerald-600 font-medium">{paidStr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending / Due:</span>
                        <span className={pendingStr !== "—" ? "text-destructive font-medium" : "text-muted-foreground"}>{pendingStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-3 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">Active {formatDate(client.latestDate)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch(client.name)
                        setView("documents")
                      }}
                      className="text-xs underline hover:text-foreground text-muted-foreground"
                    >
                      View invoices →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Documents View */
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Outstanding</p>
              <p className="mt-1 font-serif text-2xl">{summary.outstanding}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Overdue</p>
              <p className="mt-1 font-serif text-2xl">{summary.overdue}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Paid this year</p>
              <p className="mt-1 font-serif text-2xl">{summary.paid}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "quote", "invoice", "unpaid", "paid"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    filter === key ? "bg-foreground text-background font-medium" : "border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {{ all: "All", quote: "Quotes", invoice: "Invoices", unpaid: "Unpaid", paid: "Paid" }[key]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search number, client…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-foreground"
                />
              </div>

              {/* CSV Export & Import buttons */}
              <button
                type="button"
                onClick={handleExportCSV}
                title="Export shown invoices to CSV"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
              >
                <Download className="size-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                title="Import invoices from CSV"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
              >
                <Upload className="size-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setEditing(emptyDraft("quote", settings))}
                className="rounded-full border border-foreground px-3.5 py-1.5 text-xs hover:bg-secondary transition-colors"
              >
                New quote
              </button>
              <button
                onClick={() => setEditing(emptyDraft("invoice", settings))}
                className="rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
              >
                New invoice
              </button>
            </div>
          </div>

          {sending && (
            <SendPanel
              doc={sending}
              onCancel={() => setSending(null)}
              onSend={async (note) => {
                const doc = sending
                setSending(null)
                await run(
                  doc.id,
                  () => sendDocument(doc.id, note),
                  `${KIND_LABELS[doc.kind === "quote" ? "quote" : "invoice"]} ${doc.number} sent to ${doc.clientEmail}.`
                )
              }}
            />
          )}

          <section className="grid gap-3">
            {shown.map(({ doc, status }) => {
              const currency: Currency = isCurrency(doc.currency) ? doc.currency : "USD"
              const busy = busyId === doc.id
              return (
                <article key={doc.id} className="rounded-xl border border-border p-4 transition-colors hover:border-foreground/30">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        {KIND_LABELS[doc.kind === "quote" ? "quote" : "invoice"]} · {doc.number} <span className={chip(status)}>{STATUS_LABELS[status]}</span>
                      </p>
                      <h2 className="mt-1 font-serif text-2xl truncate">
                        {doc.clientName}
                        {doc.clientCompany ? ` · ${doc.clientCompany}` : ""}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Issued {formatDate(doc.issueDate)}
                        {doc.dueDate ? ` · ${doc.kind === "quote" ? "valid until" : "due"} ${formatDate(doc.dueDate)}` : ""}
                        {doc.viewedAt ? " · viewed by client" : ""}
                        {doc.acceptedBy ? ` · accepted by ${doc.acceptedBy}` : ""}
                        {doc.reminderCount ? ` · ${doc.reminderCount} reminder${doc.reminderCount === 1 ? "" : "s"} sent` : ""}
                      </p>
                    </div>
                    <p className="font-serif text-2xl sm:text-right shrink-0">{formatMoney(Number(doc.total), currency, 2)}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button disabled={busy} onClick={() => setEditing(toDraft(doc))} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors">
                      Edit
                    </button>
                    <button
                      disabled={busy || !doc.clientEmail}
                      title={doc.clientEmail ? undefined : "Add the client's email first"}
                      onClick={() => setSending(doc)}
                      className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      {doc.sentAt ? "Send again" : "Send email"}
                    </button>

                    {/* Instant WhatsApp / Client message copy */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => copyClientMessage(doc, currency)}
                      title="Copy ready-to-send WhatsApp / Email reminder"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors"
                    >
                      <MessageSquare className="size-3 text-muted-foreground" />
                      <span>Copy message</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        navigator.clipboard?.writeText(`${window.location.origin}/i/${doc.publicToken}`)
                        toast.success(`Public link for ${doc.number} copied!`)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors"
                    >
                      <Copy className="size-3 text-muted-foreground" />
                      <span>Copy link</span>
                    </button>

                    <a
                      href={`/i/${doc.publicToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </a>

                    <a
                      href={`/i/${doc.publicToken}/pdf`}
                      download={`${doc.number}.pdf`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors"
                    >
                      <Download className="size-3 text-muted-foreground" />
                      <span>PDF</span>
                    </a>

                    {doc.kind === "invoice" && status !== "paid" && status !== "void" && (
                      <button
                        disabled={busy}
                        onClick={() => run(doc.id, () => setDocumentStatus(doc.id, "paid"), `${doc.number} marked as paid.`)}
                        className="rounded-lg border border-border bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        ✓ Mark paid
                      </button>
                    )}
                    {doc.kind === "invoice" && status === "paid" && (
                      <button
                        disabled={busy}
                        onClick={() => run(doc.id, () => setDocumentStatus(doc.id, doc.sentAt ? "sent" : "draft"), `${doc.number} marked as unpaid.`)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                      >
                        Mark unpaid
                      </button>
                    )}
                    {doc.kind === "quote" && (status === "sent" || status === "accepted" || status === "draft" || status === "expired") && (
                      <button
                        disabled={busy}
                        onClick={() => run(doc.id, () => convertQuoteToInvoice(doc.id), `${doc.number} turned into a draft invoice.`)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                      >
                        Turn into invoice
                      </button>
                    )}
                    {doc.kind === "quote" && status === "sent" && (
                      <button
                        disabled={busy}
                        onClick={() => run(doc.id, () => setDocumentStatus(doc.id, "declined"), `${doc.number} marked as declined.`)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                      >
                        Declined
                      </button>
                    )}
                    <button
                      disabled={busy}
                      onClick={() => run(doc.id, () => duplicateDocument(doc.id), `Copy of ${doc.number} created as a draft.`)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                    >
                      Duplicate
                    </button>
                    {doc.kind === "invoice" && status !== "void" && status !== "paid" && (
                      <button
                        disabled={busy}
                        onClick={() => setConfirmTarget({ id: doc.id, number: doc.number, action: "void" })}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                      >
                        Void
                      </button>
                    )}
                    <button
                      disabled={busy}
                      onClick={() => setConfirmTarget({ id: doc.id, number: doc.number, action: "delete" })}
                      className="rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
            {shown.length === 0 && (
              <p className="text-muted-foreground text-sm p-4 text-center border border-dashed border-border rounded-xl">
                {documents.length ? "Nothing matches this filter or search." : "No quotes or invoices yet. Start with a quote, then turn it into an invoice once it's accepted."}
              </p>
            )}
          </section>
        </>
      )}

      {/* CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl">Import Invoices from CSV</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Compatible with Invoice Generator export or standard CSV.</p>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Choose a CSV file</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-foreground file:text-background hover:file:opacity-90"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Or paste CSV raw content</label>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`customer,type,number,date,currency,total,item,quantity,unit_cost\n"Client Name",invoice,1,"Aug 12, 2026",NPR,5000,"Logo Design",1,5000`}
                  className={`${inputClass} font-mono text-xs`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-xs hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing || !importText.trim()}
                onClick={executeImport}
                className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40"
              >
                {importing ? "Importing…" : "Import Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={confirmTarget?.action === "void" ? `Void ${confirmTarget?.number}` : `Delete ${confirmTarget?.number}`}
        description={confirmTarget?.action === "void" ? "The public client link will immediately stop working." : "Permanently delete this record. This cannot be undone."}
        confirmLabel={confirmTarget?.action === "void" ? "Void document" : "Delete permanently"}
        onConfirm={async () => {
          if (!confirmTarget) return
          if (confirmTarget.action === "void") {
            await run(confirmTarget.id, () => setDocumentStatus(confirmTarget.id, "void"), `${confirmTarget.number} voided.`)
          } else {
            await run(confirmTarget.id, () => deleteDocument(confirmTarget.id), `${confirmTarget.number} deleted permanently.`)
          }
          setConfirmTarget(null)
        }}
      />
    </div>
  )
}

function SendPanel({ doc, onCancel, onSend }: { doc: AdminDocument; onCancel: () => void; onSend: (message: string) => void }) {
  const [note, setNote] = useState("")
  const label = doc.kind === "quote" ? "quote" : "invoice"
  return (
    <div className="rounded-xl border border-foreground p-4">
      <p className="font-serif text-xl">Send {label} {doc.number}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        To {doc.clientEmail}, from your site&apos;s address, with the PDF attached and a link to view it online. Replies come to your Gmail.
      </p>
      <label className={`${labelClass} mt-4`}>
        Message (optional)
        <textarea
          className={`${inputClass} min-h-24`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Leave empty to use the standard ${label} email.`}
          maxLength={4000}
        />
      </label>
      <div className="mt-4 flex gap-3">
        <button onClick={() => onSend(note)} className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background">
          Send {label}
        </button>
        <button onClick={onCancel} className="text-sm underline">
          Cancel
        </button>
      </div>
    </div>
  )
}

function DocumentEditor({
  initial,
  settings,
  leads,
  pricing,
  onCancel,
  onSaved,
}: {
  initial: Draft
  settings: BusinessSettings
  leads: Lead[]
  pricing: Pricing
  onCancel: () => void
  onSaved: (message: string) => void
}) {
  const rateCard = (currency: Currency) => buildRateCard(pricing, currency)
  const [draft, setDraft] = useState<Draft>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((old) => ({ ...old, [key]: value }))
  const setItem = (id: string, patch: Partial<InvoiceItem>) =>
    setDraft((old) => ({ ...old, items: old.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }))
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
    setDraft((old) => ({
      ...old,
      currency,
      ...(old.id ? {} : { taxLabel: settings.currencies[currency].taxLabel, taxRate: String(settings.currencies[currency].taxRate) }),
    }))
  }
  function changeIssueDate(issueDate: string) {
    setDraft((old) => ({
      ...old,
      issueDate,
      dueDate: old.id || !issueDate ? old.dueDate : addDays(issueDate, isQuote ? settings.quoteValidDays : settings.paymentTermsDays),
    }))
  }

  async function save(sendAfter: boolean) {
    setBusy(true)
    setError("")
    try {
      const result = await saveDocument({
        ...draft,
        taxRate: Number(draft.taxRate) || 0,
      })
      if (!result.ok) {
        setError(result.error)
        setBusy(false)
        return
      }
      if (sendAfter) {
        const sendResult = await sendDocument(result.id)
        if (!sendResult.ok) {
          setError(`Saved, but couldn't send: ${sendResult.error}`)
          setBusy(false)
          return
        }
      }
      onSaved(sendAfter ? `${isQuote ? "Quote" : "Invoice"} saved and sent.` : `${isQuote ? "Quote" : "Invoice"} saved.`)
    } catch {
      setError("Something went wrong while saving. Please check your connection and retry.")
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save(false)
      }}
      className="space-y-8 rounded-2xl border border-border p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <h2 className="font-serif text-2xl">
            {draft.id ? `Edit ${isQuote ? "quote" : "invoice"} ${draft.number}` : `New ${isQuote ? "quote" : "invoice"}`}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isQuote ? "Quotes are non-binding estimates. Clients can accept them online." : "Invoices record payment requests with bank transfer or Wise link."}
          </p>
        </div>
        <button type="button" onClick={onCancel} className="text-sm underline">
          Cancel
        </button>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Client details</legend>
        <label className={labelClass}>
          Client name
          <input
            className={inputClass}
            value={draft.clientName}
            onChange={(e) => set("clientName", e.target.value)}
            required
            maxLength={160}
            list="lead-names"
          />
          <datalist id="lead-names">
            {leads.map((l) => (
              <option key={l.email} value={l.name}>
                {l.company ? `${l.name} (${l.company})` : l.name}
              </option>
            ))}
          </datalist>
        </label>
        <label className={labelClass}>
          Company (optional)
          <input className={inputClass} value={draft.clientCompany} onChange={(e) => set("clientCompany", e.target.value)} maxLength={160} />
        </label>
        <label className={labelClass}>
          Client email
          <input
            className={inputClass}
            type="email"
            value={draft.clientEmail}
            onChange={(e) => set("clientEmail", e.target.value)}
            placeholder="For sending and reminders"
          />
        </label>
        <label className={labelClass}>
          Client address (optional)
          <input className={inputClass} value={draft.clientAddress} onChange={(e) => set("clientAddress", e.target.value)} maxLength={600} />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Dates &amp; currency</legend>
        <label className={labelClass}>
          Currency
          <select className={inputClass} value={draft.currency} onChange={(e) => changeCurrency(e.target.value as Currency)}>
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {CURRENCY_LABELS[code]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Issue date
          <input className={inputClass} type="date" value={draft.issueDate} onChange={(e) => changeIssueDate(e.target.value)} required />
        </label>
        <label className={labelClass}>
          {isQuote ? "Valid until" : "Due date"}
          <input className={inputClass} type="date" value={draft.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Line items</legend>
        <div className="hidden grid-cols-[1fr_4.5rem_7.5rem_5.5rem_7rem_auto] gap-2 text-xs uppercase tracking-widest text-muted-foreground sm:grid">
          <span>Description</span>
          <span>Qty</span>
          <span>Unit price</span>
          <span>Discount</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        {draft.items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_4.5rem_7.5rem_5.5rem_7rem_auto] sm:items-start sm:gap-2 sm:border-0 sm:p-0"
          >
            <textarea
              aria-label="Description"
              className={inputClass}
              rows={item.description.length > 70 ? 3 : 1}
              value={item.description}
              onChange={(e) => setItem(item.id, { description: e.target.value })}
              maxLength={600}
              placeholder="What's included"
            />
            <input
              aria-label="Quantity"
              className={inputClass}
              type="number"
              min={0}
              step="any"
              value={item.quantity}
              onChange={(e) => setItem(item.id, { quantity: Number(e.target.value) })}
            />
            <input
              aria-label="Unit price"
              className={inputClass}
              type="number"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => setItem(item.id, { unitPrice: Number(e.target.value) })}
            />
            <input
              aria-label="Discount"
              className={inputClass}
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={item.discount || ""}
              onChange={(e) => setItem(item.id, { discount: Number(e.target.value) || 0 })}
            />
            <p className="py-2 text-sm sm:text-right font-medium">{money(lineAmount(item))}</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === draft.items.length - 1}
                className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft((old) => ({
                    ...old,
                    items: old.items.length > 1 ? old.items.filter((row) => row.id !== item.id) : old.items,
                  }))
                }
                className="rounded border border-border px-2 py-1 text-xs hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove line"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setDraft((old) => ({
                ...old,
                items: [...old.items, { id: newId(), description: "", quantity: 1, unitPrice: 0, discount: 0 }],
              }))
            }
            className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
          >
            Add line
          </button>
          <select
            className={`${inputClass} w-auto`}
            value=""
            onChange={(e) => {
              const rate = rateCard(draft.currency)[Number(e.target.value)]
              if (rate)
                setDraft((old) => ({
                  ...old,
                  items: [
                    ...old.items.filter((row) => row.description.trim() || Number(row.unitPrice)),
                    { id: newId(), description: rate.description, quantity: 1, unitPrice: rate.price, discount: 0 },
                  ],
                }))
            }}
          >
            <option value="">Add from your rate card…</option>
            {rateCard(draft.currency).map((rate, index) => (
              <option key={rate.label} value={index}>
                {rate.label} — {formatMoney(rate.price, draft.currency)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Tax and totals</legend>
        <label className={labelClass}>
          Tax name
          <input className={inputClass} value={draft.taxLabel} onChange={(e) => set("taxLabel", e.target.value)} maxLength={30} placeholder="GST, VAT…" />
        </label>
        <label className={labelClass}>
          Tax rate (%)
          <input
            className={inputClass}
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={draft.taxRate}
            onChange={(e) => set("taxRate", e.target.value)}
          />
        </label>
        <dl className="space-y-1 rounded-lg bg-secondary/50 p-3 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{money(totals.subtotal)}</dd>
          </div>
          {Number(draft.taxRate) > 0 && (
            <div className="flex justify-between">
              <dt>
                {draft.taxLabel || "Tax"} ({draft.taxRate}%)
              </dt>
              <dd>{money(totals.tax)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1 font-semibold">
            <dt>Total</dt>
            <dd>{money(totals.total)}</dd>
          </div>
        </dl>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Extras</legend>
        {!isQuote && (
          <label className={labelClass}>
            Online payment link
            <input
              className={inputClass}
              type="url"
              value={draft.paymentLink}
              onChange={(e) => set("paymentLink", e.target.value)}
              placeholder="Optional: a Stripe, PayPal or Wise link"
            />
          </label>
        )}
        <label className={`${labelClass} ${isQuote ? "sm:col-span-2" : ""}`}>
          Notes for the client
          <textarea
            className={inputClass}
            rows={3}
            value={draft.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={4000}
            placeholder={isQuote ? "Scope, timeline, what happens next…" : "Optional"}
          />
        </label>
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Your business details and {draft.currency} payment instructions come from Settings and are added automatically.
        </p>
      </fieldset>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} className="rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          disabled={busy || !draft.clientEmail}
          onClick={() => void save(true)}
          className="rounded-full border border-foreground px-5 py-3 text-sm disabled:opacity-40"
        >
          Save and send
        </button>
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
  const setCurrency = (code: Currency, patch: Partial<BusinessSettings["currencies"][Currency]>) =>
    setData((old) => ({ ...old, currencies: { ...old.currencies, [code]: { ...old.currencies[code], ...patch } } }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const result = await saveInvoiceSettings(data)
      if (!result.ok) {
        setError(result.error)
        setBusy(false)
        return
      }
      onSaved()
    } catch {
      setError("Something went wrong while saving. Please check your connection and retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8 rounded-2xl border border-border p-6 sm:p-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Your business</legend>
        <label className={labelClass}>
          Business / trade name
          <input className={inputClass} value={data.businessName} onChange={(e) => set("businessName", e.target.value)} required maxLength={120} />
        </label>
        <label className={labelClass}>
          Tagline
          <input className={inputClass} value={data.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={120} placeholder="Brand identity designer" />
        </label>
        <label className={labelClass}>
          Email address
          <input className={inputClass} type="email" value={data.email} onChange={(e) => set("email", e.target.value)} required />
        </label>
        <label className={labelClass}>
          Phone number (optional)
          <input className={inputClass} value={data.phone} onChange={(e) => set("phone", e.target.value)} maxLength={60} />
        </label>
        <label className={labelClass}>
          Tax ID / PAN / ABN (optional)
          <input className={inputClass} value={data.taxId} onChange={(e) => set("taxId", e.target.value)} maxLength={80} placeholder="e.g. PAN 123456789" />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Address
          <input className={inputClass} value={data.address} onChange={(e) => set("address", e.target.value)} maxLength={400} />
        </label>
      </fieldset>

      <fieldset className="grid gap-6">
        <legend className="text-xs uppercase tracking-widest text-muted-foreground">Currencies, taxes and bank payment instructions</legend>
        {CURRENCIES.map((code) => (
          <div key={code} className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-3">
            <p className="font-serif text-lg sm:col-span-3">{CURRENCY_LABELS[code]}</p>
            <label className={labelClass}>
              Default tax name
              <input
                className={inputClass}
                value={data.currencies[code].taxLabel}
                onChange={(e) => setCurrency(code, { taxLabel: e.target.value })}
                maxLength={30}
              />
            </label>
            <label className={labelClass}>
              Default tax rate (%)
              <input
                className={inputClass}
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={data.currencies[code].taxRate}
                onChange={(e) => setCurrency(code, { taxRate: Number(e.target.value) || 0 })}
              />
            </label>
            <label className={`${labelClass} sm:col-span-3`}>
              Payment instructions ({code})
              <textarea
                className={`${inputClass} font-mono text-xs`}
                rows={4}
                value={data.currencies[code].paymentInstructions}
                onChange={(e) => setCurrency(code, { paymentInstructions: e.target.value })}
                maxLength={2000}
                placeholder="Bank name, account number, branch, Swift code, Wise link…"
              />
            </label>
          </div>
        ))}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Defaults</legend>
        <label className={labelClass}>
          Invoice payment terms (days)
          <input
            className={inputClass}
            type="number"
            min={0}
            max={365}
            value={data.paymentTermsDays}
            onChange={(e) => set("paymentTermsDays", Number(e.target.value) || 0)}
          />
        </label>
        <label className={labelClass}>
          Quote validity (days)
          <input
            className={inputClass}
            type="number"
            min={1}
            max={365}
            value={data.quoteValidDays}
            onChange={(e) => set("quoteValidDays", Number(e.target.value) || 30)}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Footer note
          <input
            className={inputClass}
            value={data.footerNote}
            onChange={(e) => set("footerNote", e.target.value)}
            maxLength={200}
            placeholder="Thank you for your business."
          />
        </label>
      </fieldset>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">
        {busy ? "Saving…" : "Save settings"}
      </button>
    </form>
  )
}
