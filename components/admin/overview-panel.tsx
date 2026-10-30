"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Overview } from "@/lib/overview"
import { formatDate } from "@/lib/invoices"
import { formatMoney, isCurrency } from "@/lib/money"
import { syncNotionNotesAction, updateContact } from "@/app/actions/cms"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  Layers,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  User,
  X,
  Megaphone,
  CreditCard,
  Sliders,
  CheckCircle2,
} from "lucide-react"

type AdminTab =
  | "overview"
  | "projects"
  | "posts"
  | "testimonials"
  | "contacts"
  | "showcase"
  | "email"

interface OverviewPanelProps {
  data: Overview
  onOpenContacts?: () => void
  onNavigate?: (tab: AdminTab) => void
}

type PillarFilter = "all" | "marketing" | "finance" | "operations"

export function OverviewPanel({ data, onOpenContacts, onNavigate }: OverviewPanelProps) {
  const router = useRouter()
  const {
    enquiries,
    money,
    moodboards,
    content,
    recentProjects,
    categoryDistribution,
    packageDemands,
    audience,
    pipeline,
  } = data

  // Interactive Pillar Selection & Search
  const [activePillar, setActivePillar] = React.useState<PillarFilter>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [isSyncingNotion, setIsSyncingNotion] = React.useState(false)

  // Enquiry detail modal state & optimistic list
  const [selectedEnquiry, setSelectedEnquiry] = React.useState<(typeof enquiries.recent)[0] | null>(null)
  const [enquiryList, setEnquiryList] = React.useState(enquiries.recent)

  React.useEffect(() => {
    setEnquiryList(enquiries.recent)
  }, [enquiries.recent])

  // Studio live clock in Kathmandu
  const [studioTime, setStudioTime] = React.useState<string>("")
  React.useEffect(() => {
    const updateTime = () => {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kathmandu",
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date())
      setStudioTime(formatted)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Clipboard helper
  const copyToClipboard = (text: string, id: string, label = "Link") => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current))
    }, 2000)
  }

  // Handle Notion Sync
  const handleSyncNotion = async () => {
    setIsSyncingNotion(true)
    const toastId = toast.loading("Syncing notes from Notion database…")
    try {
      const result = await syncNotionNotesAction()
      if (result.ok) {
        toast.success(
          `Notion synced: ${result.added} added, ${result.updated} updated (${result.total} total)`,
          { id: toastId }
        )
        router.refresh()
      } else {
        toast.error(result.errors[0] || "Could not sync Notion notes", { id: toastId })
      }
    } catch {
      toast.error("Failed to connect to Notion API", { id: toastId })
    } finally {
      setIsSyncingNotion(false)
    }
  }

  // Handle Status Update on Enquiry
  const handleUpdateEnquiryStatus = async (id: string, newStatus: string) => {
    setEnquiryList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    )
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus })
    }
    try {
      await updateContact(id, newStatus, selectedEnquiry?.notes || "")
      toast.success(`Enquiry marked as ${newStatus}`)
      router.refresh()
    } catch {
      toast.error("Could not update enquiry status")
    }
  }

  // Urgent attention items
  const urgentTasks = [
    enquiries.newCount > 0 && {
      id: "leads",
      badge: "High",
      label: `${enquiries.newCount} new lead${enquiries.newCount === 1 ? "" : "s"} awaiting reply`,
      action: () => (onOpenContacts ? onOpenContacts() : onNavigate?.("contacts")),
      cta: "Reply",
    },
    money.overdueCount > 0 && {
      id: "overdue",
      badge: "Urgent",
      label: `${money.overdueCount} overdue invoice${money.overdueCount === 1 ? "" : "s"} (${money.overdueAmounts.join(" · ")})`,
      href: "/admin/invoices",
      cta: "Review",
    },
    money.quotesAccepted > 0 && {
      id: "quotes",
      badge: "Ready",
      label: `${money.quotesAccepted} accepted quote${money.quotesAccepted === 1 ? "" : "s"} to bill`,
      href: "/admin/invoices",
      cta: "Invoice",
    },
    moodboards.changesRequested > 0 && {
      id: "boards",
      badge: "Action",
      label: `${moodboards.changesRequested} moodboard${moodboards.changesRequested === 1 ? "" : "s"} with change requests`,
      href: "/admin/moodboards",
      cta: "View",
    },
  ].filter(Boolean) as {
    id: string
    badge: string
    label: string
    cta: string
    href?: string
    action?: () => void
  }[]

  // Filtered datasets based on search
  const query = searchQuery.trim().toLowerCase()

  const filteredEnquiries = enquiryList.filter((c) => {
    if (!query) return true
    return (
      c.name.toLowerCase().includes(query) ||
      (c.company ?? "").toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.packageInterest ?? "").toLowerCase().includes(query)
    )
  })

  const filteredInvoices = money.unpaidList.filter((d) => {
    if (!query) return true
    return (
      d.number.toLowerCase().includes(query) ||
      d.clientName.toLowerCase().includes(query) ||
      d.currency.toLowerCase().includes(query)
    )
  })

  const filteredMoodboards = moodboards.recent.filter((b) => {
    if (!query) return true
    return (
      b.title.toLowerCase().includes(query) ||
      (b.clientName ?? "").toLowerCase().includes(query)
    )
  })

  const filteredProjects = recentProjects.filter((p) => {
    if (!query) return true
    return (
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.client ?? "").toLowerCase().includes(query)
    )
  })

  // Max revenue for the compact bar chart
  const maxRevenue = Math.max(...money.monthlyRevenue.map((m) => m.amount), 1000)

  return (
    <div className="grid gap-5">
      {/* ── 1. COMPACT EXECUTIVE STRIP & GLOBAL SHORTCUTS ── */}
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-2.5 py-0.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-foreground">Studio Operational</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Clock className="size-3 text-foreground" />
            <span>Kathmandu {studioTime || "..."}</span>
          </div>

          <span className="hidden text-border sm:inline">•</span>

          <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">
            Neon DB Active · Resend Connected
          </span>
        </div>

        {/* Compact Speed Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus className="size-3" />
            <span>Project</span>
          </Link>

          <Link
            href="/admin/invoices"
            className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <FileText className="size-3" />
            <span>Invoice</span>
          </Link>

          <Link
            href="/admin/moodboards"
            className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Layers className="size-3" />
            <span>Moodboard</span>
          </Link>

          <button
            type="button"
            onClick={() => onNavigate?.("email")}
            className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Mail className="size-3" />
            <span>Compose</span>
          </button>

          <button
            type="button"
            onClick={handleSyncNotion}
            disabled={isSyncingNotion}
            title="Sync Notion Notes"
            className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`size-3 ${isSyncingNotion ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync Notion</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Portfolio"
            className="flex items-center rounded-full border border-border bg-background p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </section>

      {/* ── 2. COMPACT ATTENTION ALERT BAR ── */}
      {urgentTasks.length > 0 && (
        <section className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground shrink-0 pr-2 border-r border-border/80">
            <AlertCircle className="size-3.5 text-amber-500" />
            <span>Attention</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {urgentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-xs transition-colors hover:border-foreground/40"
              >
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono uppercase font-semibold ${
                    task.badge === "Urgent"
                      ? "bg-destructive/15 text-destructive"
                      : task.badge === "High"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-secondary text-foreground"
                  }`}
                >
                  {task.badge}
                </span>
                <span className="truncate text-foreground font-medium">{task.label}</span>
                {task.href ? (
                  <Link
                    href={task.href}
                    className="shrink-0 font-medium text-foreground underline underline-offset-2 hover:opacity-80"
                  >
                    {task.cta} →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={task.action}
                    className="shrink-0 font-medium text-foreground underline underline-offset-2 hover:opacity-80"
                  >
                    {task.cta} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 3. PILLAR CONTROLLER & SEARCH FILTER ── */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
        {/* Three Pillar Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActivePillar("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activePillar === "all"
                ? "bg-foreground text-background font-semibold"
                : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            All Pillars
          </button>

          <button
            type="button"
            onClick={() => setActivePillar("marketing")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activePillar === "marketing"
                ? "bg-foreground text-background font-semibold"
                : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Megaphone className="size-3" />
            <span>Marketing & Leads</span>
            {enquiries.newCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                {enquiries.newCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePillar("finance")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activePillar === "finance"
                ? "bg-foreground text-background font-semibold"
                : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <CreditCard className="size-3" />
            <span>Finance & Billing</span>
            {money.overdueCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                !
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePillar("operations")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activePillar === "operations"
                ? "bg-foreground text-background font-semibold"
                : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Sliders className="size-3" />
            <span>Operations & Delivery</span>
            {moodboards.changesRequested > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                {moodboards.changesRequested}
              </span>
            )}
          </button>
        </div>

        {/* Global Compact Search Filter */}
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, invoices, works…"
            className="w-full rounded-full border border-border bg-background py-1 pl-8 pr-7 text-xs outline-none focus:border-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </section>

      {/* ── 4. PILLAR I: MARKETING & INBOUND ── */}
      {(activePillar === "all" || activePillar === "marketing") && (
        <section className="rounded-xl border border-border bg-card p-4 transition-all">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-foreground">
                <Megaphone className="size-3.5" />
              </span>
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Marketing & Inbound Pipeline
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (onOpenContacts ? onOpenContacts() : onNavigate?.("contacts"))}
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              <span>Contacts CRM ({enquiries.totalCount})</span>
              <ChevronRight className="size-3" />
            </button>
          </div>

          {/* Marketing KPIs */}
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">New Enquiries</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {enquiries.newCount}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {enquiries.monthCount} in 30 days
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Audience Reach</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {audience.newsletter !== null ? audience.newsletter : "—"}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                Subscribers · {audience.leads ?? 0} leads
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Published Notes</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {content.notes}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {content.drafts} unpublished drafts
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Lead Conversion</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {money.quotesAccepted} / {money.quotesOpen + money.quotesAccepted || 1}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">Quotes accepted</span>
            </div>
          </div>

          {/* Marketing Details Grid: Leads Queue & Service Demand */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Leads Queue (2 cols) */}
            <div className="rounded-lg border border-border/70 bg-background/40 p-3 lg:col-span-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Active Prospects & Inquiries ({filteredEnquiries.length})
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Click to inspect & reply
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {filteredEnquiries.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    No matching leads found.
                  </p>
                ) : (
                  filteredEnquiries.slice(0, 5).map((c) => (
                    <div
                      key={c.id}
                      className="group flex items-center justify-between gap-3 py-2 transition-colors hover:bg-secondary/30 rounded px-1.5 -mx-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(c)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-1.5 rounded-full ${
                              c.status === "new"
                                ? "bg-emerald-500"
                                : c.status === "replied"
                                  ? "bg-blue-500"
                                  : "bg-muted-foreground"
                            }`}
                          />
                          <p className="truncate text-xs font-medium text-foreground">
                            {c.name} {c.company ? `· ${c.company}` : ""}
                          </p>
                          <span className="rounded-full bg-secondary px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground uppercase">
                            {c.status}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground mt-0.5">
                          {[c.packageInterest, c.budget].filter(Boolean).join(" · ") || c.email}
                        </p>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(c.email, c.id, "Email address")}
                          className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                          title="Copy email"
                        >
                          {copiedId === c.id ? (
                            <Check className="size-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-2.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(c)}
                          className="rounded bg-foreground px-2 py-0.5 text-[10px] font-medium text-background hover:opacity-90"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Package & Service Demand (1 col) */}
            <div className="rounded-lg border border-border/70 bg-background/40 p-3 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Service Interest Breakdown
                </span>
                <div className="mt-2.5 space-y-2">
                  {packageDemands.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No package data recorded yet.
                    </p>
                  ) : (
                    packageDemands.slice(0, 4).map((p) => {
                      const maxDemand = Math.max(...packageDemands.map((x) => x.count), 1)
                      const pct = Math.round((p.count / maxDemand) * 100)
                      return (
                        <div key={p.name} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-foreground truncate">{p.name}</span>
                            <span className="font-mono text-muted-foreground">{p.count}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-foreground"
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Newsletter Segment</span>
                <Link
                  href="/admin/newsletter"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Broadcast mailer →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. PILLAR II: FINANCE & COMMERCIAL ── */}
      {(activePillar === "all" || activePillar === "finance") && (
        <section className="rounded-xl border border-border bg-card p-4 transition-all">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-foreground">
                <CreditCard className="size-3.5" />
              </span>
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Finance & Commercial Cashflow
                </h3>
              </div>
            </div>
            <Link
              href="/admin/invoices"
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              <span>Invoices & Billing</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Finance KPIs */}
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div
              className={`rounded-lg border p-2.5 ${
                money.overdueCount > 0
                  ? "border-destructive/60 bg-destructive/5"
                  : "border-border/70 bg-background/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Outstanding</span>
                {money.overdueCount > 0 && (
                  <span className="rounded bg-destructive/15 px-1 py-0.2 text-[9px] font-mono text-destructive font-semibold">
                    {money.overdueCount} overdue
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate font-serif text-2xl font-normal text-foreground">
                {money.outstanding.join(" · ") || "—"}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {money.quotesOpen} open quote{money.quotesOpen === 1 ? "" : "s"}
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Paid in 2026</span>
              <p className="mt-0.5 truncate font-serif text-2xl font-normal text-foreground">
                {money.paidThisYear.join(" · ") || "—"}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {money.totalPaidCount} invoice{money.totalPaidCount === 1 ? "" : "s"} closed
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Accepted Quotes</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {money.quotesAccepted}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">Ready to bill client</span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Billing Status</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {money.unpaidList.length} Active
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {money.unpaidList.filter((x) => !x.overdue).length} within payment term
              </span>
            </div>
          </div>

          {/* Finance Visual Ledger & Receivables */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Unpaid Invoices Ledger (2 cols) */}
            <div className="rounded-lg border border-border/70 bg-background/40 p-3 lg:col-span-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Unpaid Receivables & Terms ({filteredInvoices.length})
                </span>
                <Link
                  href="/admin/invoices"
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  + Create Invoice
                </Link>
              </div>

              <div className="divide-y divide-border/60">
                {filteredInvoices.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    Nothing outstanding. All invoices settled.
                  </p>
                ) : (
                  filteredInvoices.slice(0, 5).map((d) => (
                    <div
                      key={d.id}
                      className="group flex items-center justify-between gap-3 py-2 transition-colors hover:bg-secondary/30 rounded px-1.5 -mx-1.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-mono uppercase ${
                              d.overdue
                                ? "bg-destructive/15 text-destructive font-semibold"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {d.overdue ? "Overdue" : d.status}
                          </span>
                          <p className="truncate text-xs font-medium text-foreground">
                            {d.number} · {d.clientName}
                          </p>
                        </div>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            d.overdue ? "text-destructive font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {d.dueDate
                            ? `${d.overdue ? "Past due since" : "Due"} ${formatDate(d.dueDate)}`
                            : "Due on receipt"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-serif text-sm font-normal text-foreground">
                          {isCurrency(d.currency)
                            ? formatMoney(Number(d.total), d.currency)
                            : `${d.currency} ${d.total}`}
                        </span>

                        {d.publicToken && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const url = `${window.location.origin}/i/${d.publicToken}`
                                copyToClipboard(url, d.id, "Invoice payment link")
                              }}
                              className="rounded border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                              title="Copy invoice link"
                            >
                              {copiedId === d.id ? (
                                <Check className="size-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-2.5" />
                              )}
                            </button>
                            <Link
                              href={`/i/${d.publicToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                              title="View invoice"
                            >
                              <ExternalLink className="size-2.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 6-Month Cashflow Spark/Bar Chart (1 col) */}
            <div className="rounded-lg border border-border/70 bg-background/40 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-border/60">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    Monthly Revenue (Past 6 Mos)
                  </span>
                  <TrendingUp className="size-3 text-muted-foreground" />
                </div>

                <div className="mt-3 flex items-end justify-between gap-1.5 h-28 pt-4 pb-1 border-b border-border/60">
                  {money.monthlyRevenue.map((item) => {
                    const heightPct = Math.max(
                      Math.round((item.amount / maxRevenue) * 100),
                      item.amount > 0 ? 8 : 4
                    )
                    return (
                      <div
                        key={item.month}
                        className="group relative flex flex-1 flex-col items-center h-full justify-end"
                      >
                        {/* Compact Tooltip */}
                        <div className="pointer-events-none absolute -top-8 z-20 hidden rounded border border-border bg-popover px-1.5 py-0.5 text-[9px] font-mono shadow-xs group-hover:flex flex-col items-center whitespace-nowrap">
                          <span className="font-semibold text-foreground">
                            {formatMoney(item.amount, "USD")}
                          </span>
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[28px] rounded-t transition-all ${
                            item.amount > 0 ? "bg-foreground" : "bg-muted-foreground/20"
                          }`}
                        />

                        {/* Month */}
                        <span className="mt-1 text-[9px] font-mono text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-2 text-[10px] text-muted-foreground font-mono">
                Hover over bars to inspect revenue breakdown per month.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. PILLAR III: OPERATIONS & DELIVERY ── */}
      {(activePillar === "all" || activePillar === "operations") && (
        <section className="rounded-xl border border-border bg-card p-4 transition-all">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-foreground">
                <Sliders className="size-3.5" />
              </span>
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Operations & Creative Delivery
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/moodboards"
                className="font-mono text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Moodboards ({moodboards.totalCount})
              </Link>
              <button
                type="button"
                onClick={() => onNavigate?.("projects")}
                className="font-mono text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Projects ({content.projects})
              </button>
            </div>
          </div>

          {/* Operations KPIs */}
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Active Moodboards</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {moodboards.recent.length}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {moodboards.changesRequested} changes requested
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Live Portfolio</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-foreground">
                {content.publishedProjects} / {content.projects}
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {content.featuredProjects} featured items
              </span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">System Health</span>
              <p className="mt-0.5 font-serif text-2xl font-normal text-emerald-600 dark:text-emerald-400">
                100%
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">Neon DB Online</span>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/60 p-2.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Notion State</span>
              <button
                type="button"
                onClick={handleSyncNotion}
                disabled={isSyncingNotion}
                className="mt-0.5 block text-left font-serif text-2xl font-normal text-foreground hover:underline"
              >
                {isSyncingNotion ? "Syncing…" : "Synchronized"}
              </button>
              <span className="font-mono text-[10px] text-muted-foreground">
                Click to resync notes
              </span>
            </div>
          </div>

          {/* Operations Details Grid: Client Review Feed & Portfolio Catalog */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Moodboards & Client Feedback */}
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Client Collaboration Boards ({filteredMoodboards.length})
                </span>
                <Link
                  href="/admin/moodboards"
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  + New Board
                </Link>
              </div>

              <div className="divide-y divide-border/60">
                {/* Recent Client Comments */}
                {moodboards.recentComments.length > 0 && (
                  <div className="py-2 space-y-1.5">
                    {moodboards.recentComments.slice(0, 2).map((comm) => (
                      <div
                        key={comm.id}
                        className="rounded border border-border/60 bg-background/80 p-2 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {comm.author} · {comm.boardTitle}
                          </span>
                          <span className="font-mono text-[9px] uppercase text-muted-foreground">
                            {comm.kind}
                          </span>
                        </div>
                        <p className="mt-0.5 text-muted-foreground line-clamp-1 italic">
                          &ldquo;{comm.body}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {filteredMoodboards.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    No active moodboards found.
                  </p>
                ) : (
                  filteredMoodboards.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="group flex items-center justify-between gap-3 py-2 transition-colors hover:bg-secondary/30 rounded px-1.5 -mx-1.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-mono uppercase ${
                              b.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-600 font-semibold"
                                : b.status === "changes"
                                  ? "bg-amber-500/15 text-amber-600 font-semibold"
                                  : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {b.status}
                          </span>
                          <p className="truncate text-xs font-medium text-foreground">
                            {b.title} {b.clientName ? `· ${b.clientName}` : ""}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {b.shared ? "Shared with client" : "Draft board"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {b.shareToken && (
                          <button
                            type="button"
                            onClick={() => {
                              const url = `${window.location.origin}/m/${b.shareToken}`
                              copyToClipboard(url, b.id, "Client moodboard link")
                            }}
                            className="rounded border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                            title="Copy share link"
                          >
                            {copiedId === b.id ? (
                              <Check className="size-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="size-2.5" />
                            )}
                          </button>
                        )}
                        <Link
                          href={`/admin/moodboards/${b.id}`}
                          className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-secondary"
                        >
                          Editor
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Portfolio Recent Works */}
            <div className="rounded-lg border border-border/70 bg-background/40 p-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Recent Portfolio Releases ({filteredProjects.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate?.("projects")}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Manage All →
                </button>
              </div>

              <div className="divide-y divide-border/60">
                {filteredProjects.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    No matching projects found.
                  </p>
                ) : (
                  filteredProjects.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-center justify-between gap-3 py-2 transition-colors hover:bg-secondary/30 rounded px-1.5 -mx-1.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {p.thumbnail && (
                          <div className="relative size-7 shrink-0 overflow-hidden rounded border border-border bg-muted">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="size-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-medium text-foreground">
                              {p.title}
                            </p>
                            <span className="rounded bg-secondary px-1 py-0.2 text-[9px] font-mono text-muted-foreground">
                              {p.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {p.year} {p.client ? `· ${p.client}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {p.analytics && (
                          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <Eye className="size-2.5" />
                            {p.analytics.views || 0}
                          </span>
                        )}

                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
                          title="View live case study"
                        >
                          <ExternalLink className="size-2.5" />
                        </Link>

                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="rounded bg-foreground px-2 py-0.5 text-[10px] font-medium text-background hover:opacity-90"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7. COMPACT HIGH-CONTRAST ENQUIRY REVIEW DRAWER ── */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-background p-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Prospect Enquiry
                </span>
                <h3 className="mt-0.5 font-serif text-xl font-normal text-foreground">
                  {selectedEnquiry.name}
                </h3>
                {selectedEnquiry.company && (
                  <p className="text-xs text-muted-foreground">{selectedEnquiry.company}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-full border border-border p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-3 text-xs">
              {/* Specification Pills */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border/80 bg-secondary/30 p-2">
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">Package</span>
                  <p className="mt-0.5 font-medium text-foreground truncate">
                    {selectedEnquiry.packageInterest || "Custom"}
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-secondary/30 p-2">
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">Budget</span>
                  <p className="mt-0.5 font-medium text-foreground truncate">
                    {selectedEnquiry.budget || "Flexible"}
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-secondary/30 p-2">
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">Timeline</span>
                  <p className="mt-0.5 font-medium text-foreground truncate">
                    {selectedEnquiry.timeline || "ASAP"}
                  </p>
                </div>
              </div>

              {/* Message Block */}
              <div className="rounded-lg border border-border bg-card p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Inquiry Message
                </span>
                <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* Status Toggles */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[11px] text-muted-foreground">Status:</span>
                <div className="flex items-center gap-1">
                  {(["new", "read", "replied", "archived"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateEnquiryStatus(selectedEnquiry.id, st)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase transition-colors ${
                        selectedEnquiry.status === st
                          ? "bg-foreground text-background font-semibold"
                          : "border border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(selectedEnquiry.email, "modal-email", "Email address")
                }
                className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-secondary"
              >
                <Copy className="size-3" />
                <span>{selectedEnquiry.email}</span>
              </button>

              <a
                href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(
                  `Prajesh Shakya — Re: Your Inquiry`
                )}`}
                className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-secondary"
              >
                <ExternalLink className="size-3" />
                <span>Email Client</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSelectedEnquiry(null)
                  onNavigate?.("email")
                }}
                className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1 text-xs font-medium text-background hover:opacity-90"
              >
                <Mail className="size-3" />
                <span>Compose in Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
