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
  ArrowUpRight,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Heart,
  Layers,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  User,
  X,
  AlertCircle,
  TrendingUp,
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

type FeedCategory = "all" | "enquiries" | "financials" | "moodboards" | "projects"
type InsightView = "cashflow" | "packages" | "categories"

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

  // Interactive Local States
  const [insightView, setInsightView] = React.useState<InsightView>("cashflow")
  const [feedTab, setFeedTab] = React.useState<FeedCategory>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [isSyncingNotion, setIsSyncingNotion] = React.useState(false)

  // Enquiry detail modal state & optimistic status
  const [selectedEnquiry, setSelectedEnquiry] = React.useState<(typeof enquiries.recent)[0] | null>(null)
  const [enquiryList, setEnquiryList] = React.useState(enquiries.recent)

  React.useEffect(() => {
    setEnquiryList(enquiries.recent)
  }, [enquiries.recent])

  // Studio live time in Kathmandu
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
        second: "2-digit",
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
          `Notion notes synced: ${result.added} added, ${result.updated} updated (${result.total} total)`,
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

  // Priority Attention Items
  const attentionItems = [
    enquiries.newCount > 0 && {
      id: "new-enquiries",
      urgency: "high",
      label: `${enquiries.newCount} new enquir${enquiries.newCount === 1 ? "y" : "ies"} awaiting response`,
      detail: "Prospective clients seeking brand and digital design direction.",
      actionLabel: "Reply to leads",
      action: () => (onOpenContacts ? onOpenContacts() : onNavigate?.("contacts")),
    },
    money.overdueCount > 0 && {
      id: "overdue-invoices",
      urgency: "urgent",
      label: `${money.overdueCount} overdue invoice${money.overdueCount === 1 ? "" : "s"} (${money.overdueAmounts.join(" · ")})`,
      detail: "Invoices past their payment due date.",
      actionLabel: "Manage invoices",
      href: "/admin/invoices",
    },
    money.quotesAccepted > 0 && {
      id: "accepted-quotes",
      urgency: "medium",
      label: `${money.quotesAccepted} accepted quote${money.quotesAccepted === 1 ? "" : "s"} ready to bill`,
      detail: "Client approved scope and terms. Generate invoices to begin.",
      actionLabel: "Create invoice",
      href: "/admin/invoices",
    },
    moodboards.changesRequested > 0 && {
      id: "moodboard-changes",
      urgency: "medium",
      label: `${moodboards.changesRequested} moodboard${moodboards.changesRequested === 1 ? "" : "s"} with change requests`,
      detail: "Client requested revisions on visual direction.",
      actionLabel: "Review comments",
      href: "/admin/moodboards",
    },
    content.drafts > 0 && {
      id: "unpublished-drafts",
      urgency: "low",
      label: `${content.drafts} unpublished note${content.drafts === 1 ? "" : "s"} in content pipeline`,
      detail: "Draft writings ready for editorial polish and publishing.",
      actionLabel: "View notes",
      action: () => onNavigate?.("posts"),
    },
  ].filter(Boolean) as {
    id: string
    urgency: "urgent" | "high" | "medium" | "low"
    label: string
    detail: string
    actionLabel: string
    href?: string
    action?: () => void
  }[]

  // Filtered Activity Stream
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

  // Chart max calculation for Monthly Cashflow
  const maxRevenue = Math.max(...money.monthlyRevenue.map((m) => m.amount), 1000)

  return (
    <div className="grid gap-8">
      {/* ── 1. STUDIO COMMAND STRIP & REALTIME STATUS ── */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-medium text-foreground">Studio Active</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
            <Clock className="size-3.5" />
            <span>Kathmandu {studioTime || "Loading…"}</span>
          </div>

          <span className="hidden text-border sm:inline">|</span>

          <span className="text-muted-foreground font-mono">
            Neon DB Connected · Resend Active
          </span>
        </div>

        {/* 1-Click Interactive Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus className="size-3.5" />
            <span>New Project</span>
          </Link>

          <Link
            href="/admin/invoices"
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <FileText className="size-3.5" />
            <span>New Invoice</span>
          </Link>

          <Link
            href="/admin/moodboards"
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Layers className="size-3.5" />
            <span>Moodboards</span>
          </Link>

          <button
            type="button"
            onClick={() => onNavigate?.("email")}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Mail className="size-3.5" />
            <span>Compose</span>
          </button>

          <button
            type="button"
            onClick={handleSyncNotion}
            disabled={isSyncingNotion}
            title="Synchronize published & draft notes from Notion"
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isSyncingNotion ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync Notion</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open live website in new tab"
            className="flex items-center gap-1 rounded-full border border-border bg-background p-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* ── 2. HIGH-IMPACT INTERACTIVE KPI TILES ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* KPI 1: New Inquiries */}
        <button
          type="button"
          onClick={() => (onOpenContacts ? onOpenContacts() : onNavigate?.("contacts"))}
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-foreground/40 hover:bg-secondary/20"
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              New Enquiries
            </span>
            {enquiries.newCount > 0 ? (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Action req.
              </span>
            ) : (
              <User className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
          <div className="mt-4">
            <p className="font-serif text-3xl font-normal sm:text-4xl text-foreground">
              {enquiries.newCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {enquiries.monthCount} in last 30 days
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-foreground opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <span>Manage pipeline</span>
            <ChevronRight className="size-3" />
          </div>
        </button>

        {/* KPI 2: Outstanding Cashflow */}
        <Link
          href="/admin/invoices"
          className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all hover:bg-secondary/20 ${
            money.overdueCount > 0
              ? "border-destructive/60 bg-destructive/5 hover:border-destructive"
              : "border-border bg-card hover:border-foreground/40"
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Outstanding
            </span>
            {money.overdueCount > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                <AlertCircle className="size-3" />
                {money.overdueCount} overdue
              </span>
            ) : (
              <DollarSign className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
          <div className="mt-4">
            <p className="truncate font-serif text-2xl font-normal sm:text-3xl text-foreground">
              {money.outstanding.join(" · ") || "—"}
            </p>
            <p className={`mt-1 text-xs ${money.overdueCount > 0 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              {money.overdueCount > 0
                ? `${money.overdueAmounts.join(" · ")} overdue`
                : `${money.quotesOpen} quote${money.quotesOpen === 1 ? "" : "s"} open`}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-foreground opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <span>View receivables</span>
            <ChevronRight className="size-3" />
          </div>
        </Link>

        {/* KPI 3: Paid This Year */}
        <Link
          href="/admin/invoices"
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/40 hover:bg-secondary/20"
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Paid in 2026
            </span>
            <TrendingUp className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="mt-4">
            <p className="truncate font-serif text-2xl font-normal sm:text-3xl text-foreground">
              {money.paidThisYear.join(" · ") || "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {money.totalPaidCount} invoice{money.totalPaidCount === 1 ? "" : "s"} closed
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-foreground opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <span>Financial log</span>
            <ChevronRight className="size-3" />
          </div>
        </Link>

        {/* KPI 4: Studio Creative Output */}
        <button
          type="button"
          onClick={() => onNavigate?.("projects")}
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-foreground/40 hover:bg-secondary/20"
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Live Projects
            </span>
            <Briefcase className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-3xl font-normal sm:text-4xl text-foreground">
                {content.publishedProjects}
              </p>
              <span className="text-xs text-muted-foreground font-mono">
                / {content.projects} total
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {content.draftProjects} draft · {content.notes} notes live
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-foreground opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <span>Portfolio editor</span>
            <ChevronRight className="size-3" />
          </div>
        </button>

        {/* KPI 5: Audience & Subscribers */}
        <Link
          href="/admin/newsletter"
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/40 hover:bg-secondary/20"
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Audience Reach
            </span>
            <Sparkles className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="mt-4">
            <p className="font-serif text-3xl font-normal sm:text-4xl text-foreground">
              {audience.newsletter !== null ? audience.newsletter : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {audience.newsletter !== null
                ? `Subscribers · ${audience.leads ?? 0} leads`
                : "Configure Resend key"}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-foreground opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            <span>Broadcasts & leads</span>
            <ChevronRight className="size-3" />
          </div>
        </Link>
      </section>

      {/* ── 3. INTERACTIVE STUDIO PIPELINE FLOW ── */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Studio Workflow Pipeline
            </h3>
            <p className="text-sm font-medium text-foreground">
              Active journey from client inquiry to payment settlement
            </p>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            4 Studio Stages
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stage 1: Inbound Inquiries */}
          <button
            type="button"
            onClick={() => (onOpenContacts ? onOpenContacts() : onNavigate?.("contacts"))}
            className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-3.5 text-left transition-all hover:border-foreground hover:bg-secondary/40"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] font-mono font-medium text-muted-foreground">
                  1
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Inquiries
                </span>
              </div>
              <p className="mt-2 font-serif text-xl font-normal text-foreground">
                {pipeline.newLeads} <span className="text-xs font-sans text-muted-foreground">new</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {enquiries.totalCount} lifetime contacts
              </p>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </button>

          {/* Stage 2: Proposals & Quotes */}
          <Link
            href="/admin/invoices"
            className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-3.5 transition-all hover:border-foreground hover:bg-secondary/40"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] font-mono font-medium text-muted-foreground">
                  2
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Proposals
                </span>
              </div>
              <p className="mt-2 font-serif text-xl font-normal text-foreground">
                {pipeline.quotesPending}{" "}
                <span className="text-xs font-sans text-muted-foreground">open</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {money.quotesAccepted} accepted awaiting invoice
              </p>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </Link>

          {/* Stage 3: Creative Collaboration */}
          <Link
            href="/admin/moodboards"
            className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-3.5 transition-all hover:border-foreground hover:bg-secondary/40"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] font-mono font-medium text-muted-foreground">
                  3
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Moodboards
                </span>
              </div>
              <p className="mt-2 font-serif text-xl font-normal text-foreground">
                {pipeline.activeCollaborations}{" "}
                <span className="text-xs font-sans text-muted-foreground">shared</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {moodboards.changesRequested} changes requested
              </p>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </Link>

          {/* Stage 4: Invoicing & Cashflow */}
          <Link
            href="/admin/invoices"
            className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-3.5 transition-all hover:border-foreground hover:bg-secondary/40"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] font-mono font-medium text-muted-foreground">
                  4
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Invoicing
                </span>
              </div>
              <p className="mt-2 font-serif text-xl font-normal text-foreground">
                {pipeline.unpaidInvoices}{" "}
                <span className="text-xs font-sans text-muted-foreground">unpaid</span>
              </p>
              <p className="text-[11px] text-destructive">
                {pipeline.overdueInvoices > 0 ? `${pipeline.overdueInvoices} overdue` : "All on schedule"}
              </p>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      {/* ── 4. NEEDS ATTENTION ACTION BANNER ── */}
      {attentionItems.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-amber-500" />
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Needs Immediate Attention ({attentionItems.length})
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Priority triage</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-background p-4 transition-colors hover:border-foreground/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                        item.urgency === "urgent"
                          ? "bg-destructive/15 text-destructive font-semibold"
                          : item.urgency === "high"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-foreground">
                    {item.label}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={item.action}
                      className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowUpRight className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. INTERACTIVE STUDIO INSIGHTS & CHARTS ── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart Card (2 Cols) */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Studio Velocity & Distribution
              </h3>
              <p className="text-sm font-medium text-foreground">
                {insightView === "cashflow"
                  ? "Monthly Realized Revenue (Past 6 Months)"
                  : insightView === "packages"
                    ? "Service & Package Inquiries Distribution"
                    : "Portfolio Work Discipline Breakdown"}
              </p>
            </div>

            {/* Interactive View Switcher Tabs */}
            <div className="flex items-center rounded-full border border-border bg-background p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setInsightView("cashflow")}
                className={`rounded-full px-3 py-1 transition-colors ${
                  insightView === "cashflow"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cashflow
              </button>
              <button
                type="button"
                onClick={() => setInsightView("packages")}
                className={`rounded-full px-3 py-1 transition-colors ${
                  insightView === "packages"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Packages
              </button>
              <button
                type="button"
                onClick={() => setInsightView("categories")}
                className={`rounded-full px-3 py-1 transition-colors ${
                  insightView === "categories"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Categories
              </button>
            </div>
          </div>

          {/* VIEW 1: MONTHLY CASHFLOW BAR CHART */}
          {insightView === "cashflow" && (
            <div className="mt-6">
              <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2 border-b border-border">
                {money.monthlyRevenue.map((item) => {
                  const heightPercent = Math.max(
                    Math.round((item.amount / maxRevenue) * 100),
                    item.amount > 0 ? 8 : 2
                  )
                  return (
                    <div
                      key={item.month}
                      className="group relative flex flex-1 flex-col items-center h-full justify-end"
                    >
                      {/* Tooltip on Hover */}
                      <div className="pointer-events-none absolute -top-10 z-20 hidden rounded-md border border-border bg-popover px-2.5 py-1 text-[11px] font-mono shadow-md group-hover:flex flex-col items-center whitespace-nowrap">
                        <span className="font-semibold text-foreground">
                          {formatMoney(item.amount, "USD")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {item.count} invoice{item.count === 1 ? "" : "s"}
                        </span>
                      </div>

                      {/* Bar Visual */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[48px] rounded-t-md transition-all group-hover:opacity-90 ${
                          item.amount > 0
                            ? "bg-foreground"
                            : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                        }`}
                      />

                      {/* Month Label */}
                      <span className="mt-2 text-xs font-mono text-muted-foreground group-hover:text-foreground">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                <span>Hover over monthly bars to inspect exact collection amounts</span>
                <Link
                  href="/admin/invoices"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  View full ledger →
                </Link>
              </div>
            </div>
          )}

          {/* VIEW 2: SERVICE & PACKAGE DEMAND */}
          {insightView === "packages" && (
            <div className="mt-6 space-y-4">
              {packageDemands.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No package preferences recorded in enquiries yet.
                </p>
              ) : (
                packageDemands.map((pkg) => {
                  const maxCount = Math.max(...packageDemands.map((p) => p.count), 1)
                  const percent = Math.round((pkg.count / maxCount) * 100)
                  return (
                    <div key={pkg.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{pkg.name}</span>
                        <span className="font-mono text-muted-foreground">
                          {pkg.count} lead{pkg.count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-foreground transition-all duration-500"
                        />
                      </div>
                    </div>
                  )
                })
              )}
              <div className="pt-2 text-xs text-muted-foreground">
                Inquiries grouped by selected package option on the public contact form.
              </div>
            </div>
          )}

          {/* VIEW 3: CATEGORY PORTFOLIO MIX */}
          {insightView === "categories" && (
            <div className="mt-6 space-y-4">
              {categoryDistribution.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No projects categorized yet.
                </p>
              ) : (
                categoryDistribution.map((cat) => {
                  const maxCount = Math.max(...categoryDistribution.map((c) => c.count), 1)
                  const percent = Math.round((cat.count / maxCount) * 100)
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{cat.name}</span>
                        <span className="font-mono text-muted-foreground">
                          {cat.count} project{cat.count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-foreground transition-all duration-500"
                        />
                      </div>
                    </div>
                  )
                })
              )}
              <div className="pt-2 text-xs text-muted-foreground">
                Live and archived portfolio pieces grouped by discipline.
              </div>
            </div>
          )}
        </div>

        {/* Quick Review / Side Stats Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Studio Health & Sync
            </h3>
            <p className="text-sm font-medium text-foreground">
              Connected Services & Repository
            </p>

            <div className="mt-5 space-y-3 divide-y divide-border/60">
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-muted-foreground">Portfolio CMS</span>
                <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  Healthy ({content.projects} items)
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-muted-foreground">Notion Sync</span>
                <button
                  type="button"
                  onClick={handleSyncNotion}
                  disabled={isSyncingNotion}
                  className="text-xs font-mono underline underline-offset-4 hover:text-foreground"
                >
                  {isSyncingNotion ? "Syncing…" : "Sync now"}
                </button>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-muted-foreground">Newsletter Engine</span>
                <span className="text-xs font-mono text-foreground">
                  {audience.newsletter !== null ? "Resend Connected" : "Key Needed"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-muted-foreground">Active Moodboards</span>
                <span className="text-xs font-mono text-foreground">
                  {moodboards.recent.length} active boards
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-muted-foreground">Quotes Conversion</span>
                <span className="text-xs font-mono text-foreground">
                  {money.quotesAccepted} of {money.quotesOpen + money.quotesAccepted} accepted
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border/80 bg-background/50 p-3.5">
            <p className="text-xs font-semibold text-foreground">Need quick client outreach?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Broadcast notes or studio announcements directly to verified leads.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.("email")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              <Mail className="size-3.5" />
              <span>Open Studio Mailer</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. UNIFIED INTERACTIVE OPERATIONS & ACTIVITY HUB ── */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Operations Hub
            </h3>
            <p className="text-sm font-medium text-foreground">
              Real-time activity across leads, client reviews, and finances
            </p>
          </div>

          {/* Interactive Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter activities…"
              className="w-full rounded-full border border-border bg-background py-1.5 pl-8 pr-7 text-xs outline-none focus:border-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Feed Category Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFeedTab("all")}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
              feedTab === "all"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            All Activity
          </button>

          <button
            type="button"
            onClick={() => setFeedTab("enquiries")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
              feedTab === "enquiries"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <span>Enquiries</span>
            {enquiries.newCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                {enquiries.newCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFeedTab("financials")}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
              feedTab === "financials"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Financials & Invoices
          </button>

          <button
            type="button"
            onClick={() => setFeedTab("moodboards")}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
              feedTab === "moodboards"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Moodboard Reviews
          </button>

          <button
            type="button"
            onClick={() => setFeedTab("projects")}
            className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
              feedTab === "projects"
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Recent Projects
          </button>
        </div>

        {/* FEED CONTENT CONTAINER */}
        <div className="mt-4">
          {/* TAB 1: ALL OR ENQUIRIES */}
          {(feedTab === "all" || feedTab === "enquiries") && (
            <div className="mb-6">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Prospective Client Enquiries ({filteredEnquiries.length})
                </span>
                <button
                  type="button"
                  onClick={() => (onOpenContacts ? onOpenContacts() : onNavigate?.("contacts"))}
                  className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  View in Contacts CRM →
                </button>
              </div>

              <div className="divide-y divide-border/60">
                {filteredEnquiries.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">No matching enquiries.</p>
                ) : (
                  filteredEnquiries.map((c) => (
                    <div
                      key={c.id}
                      className="group flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-secondary/20 rounded-lg px-2 -mx-2"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(c)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              c.status === "new"
                                ? "bg-emerald-500"
                                : c.status === "replied"
                                  ? "bg-blue-500"
                                  : "bg-muted-foreground/40"
                            }`}
                          />
                          <p className="text-sm font-medium text-foreground truncate">
                            {c.name}
                            {c.company ? ` · ${c.company}` : ""}
                          </p>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground uppercase">
                            {c.status}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {[c.packageInterest, c.budget, c.timeline].filter(Boolean).join(" · ") ||
                            c.email}
                        </p>
                        {c.message && (
                          <p className="mt-1 line-clamp-1 text-xs text-foreground/80 italic">
                            &ldquo;{c.message}&rdquo;
                          </p>
                        )}
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(c.email, c.id, "Email address")}
                          title="Copy email to clipboard"
                          className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          {copiedId === c.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span className="hidden sm:inline">Copy</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(c)}
                          className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background transition-opacity hover:opacity-90"
                        >
                          Review & Reply
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS & INVOICES */}
          {(feedTab === "all" || feedTab === "financials") && (
            <div className="mb-6">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Invoices & Outstanding Receivables ({filteredInvoices.length})
                </span>
                <Link
                  href="/admin/invoices"
                  className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  Manage Invoices & Quotes →
                </Link>
              </div>

              <div className="divide-y divide-border/60">
                {filteredInvoices.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">
                    No matching invoices or outstanding balances.
                  </p>
                ) : (
                  filteredInvoices.map((d) => (
                    <div
                      key={d.id}
                      className="group flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-secondary/20 rounded-lg px-2 -mx-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${
                              d.overdue
                                ? "bg-destructive/15 text-destructive font-semibold"
                                : d.status === "paid"
                                  ? "bg-emerald-500/15 text-emerald-600 font-semibold"
                                  : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {d.overdue ? "Overdue" : d.status}
                          </span>
                          <p className="text-sm font-medium text-foreground truncate">
                            {d.number} · {d.clientName}
                          </p>
                        </div>
                        <p
                          className={`mt-1 text-xs ${d.overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                        >
                          {d.dueDate
                            ? `${d.overdue ? "Overdue since" : "Due"} ${formatDate(d.dueDate)}`
                            : "Due on receipt"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-serif text-lg font-normal text-foreground">
                          {isCurrency(d.currency)
                            ? formatMoney(Number(d.total), d.currency)
                            : `${d.currency} ${d.total}`}
                        </span>

                        {d.publicToken && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const url = `${window.location.origin}/i/${d.publicToken}`
                                copyToClipboard(url, d.id, "Public invoice link")
                              }}
                              title="Copy invoice link to send to client"
                              className="rounded-md border border-border bg-background p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              {copiedId === d.id ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>

                            <Link
                              href={`/i/${d.publicToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open client invoice view"
                              className="rounded-md border border-border bg-background p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            >
                              <ExternalLink className="size-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MOODBOARD REVIEWS */}
          {(feedTab === "all" || feedTab === "moodboards") && (
            <div className="mb-6">
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Active Client Moodboards & Feedback ({filteredMoodboards.length})
                </span>
                <Link
                  href="/admin/moodboards"
                  className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  All Moodboards →
                </Link>
              </div>

              <div className="divide-y divide-border/60">
                {moodboards.recentComments.length > 0 && (
                  <div className="py-2">
                    <p className="text-[11px] font-mono text-muted-foreground mb-1">
                      Latest Client Comments:
                    </p>
                    <div className="space-y-2">
                      {moodboards.recentComments.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg border border-border/60 bg-background/60 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">
                              {c.author} · {c.boardTitle}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {c.kind === "approval"
                                ? "Approved"
                                : c.kind === "changes"
                                  ? "Changes requested"
                                  : "Comment"}
                            </span>
                          </div>
                          <p className="mt-1 text-muted-foreground italic">&ldquo;{c.body}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredMoodboards.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">No moodboards found.</p>
                ) : (
                  filteredMoodboards.map((b) => (
                    <div
                      key={b.id}
                      className="group flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-secondary/20 rounded-lg px-2 -mx-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${
                              b.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-600 font-semibold"
                                : b.status === "changes"
                                  ? "bg-amber-500/15 text-amber-600 font-semibold"
                                  : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {b.status}
                          </span>
                          <p className="text-sm font-medium text-foreground truncate">
                            {b.title}
                            {b.clientName ? ` · ${b.clientName}` : ""}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {b.shared ? "Shared with client" : "Internal draft"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {b.shareToken && (
                          <button
                            type="button"
                            onClick={() => {
                              const url = `${window.location.origin}/m/${b.shareToken}`
                              copyToClipboard(url, b.id, "Moodboard share link")
                            }}
                            title="Copy client share link"
                            className="rounded-md border border-border bg-background p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            {copiedId === b.id ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        )}

                        <Link
                          href={`/admin/moodboards/${b.id}`}
                          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                          Open Editor
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RECENT PROJECTS */}
          {(feedTab === "all" || feedTab === "projects") && (
            <div>
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Recent Portfolio Pieces ({filteredProjects.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate?.("projects")}
                  className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  Manage All Projects →
                </button>
              </div>

              <div className="divide-y divide-border/60">
                {filteredProjects.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">No recent projects.</p>
                ) : (
                  filteredProjects.map((p) => (
                    <div
                      key={p.id}
                      className="group flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-secondary/20 rounded-lg px-2 -mx-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {p.thumbnail && (
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="size-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {p.title}
                            </p>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                              {p.category}
                            </span>
                            {p.featured && (
                              <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {p.year} · {p.status || "published"}
                            {p.client ? ` · ${p.client}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {p.analytics && (
                          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground font-mono">
                            <span className="flex items-center gap-1">
                              <Eye className="size-3" />
                              {p.analytics.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="size-3" />
                              {p.analytics.appreciations || 0}
                            </span>
                          </div>
                        )}

                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-border bg-background p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="View live case study"
                        >
                          <ExternalLink className="size-3" />
                        </Link>

                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background transition-opacity hover:opacity-90"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. INTERACTIVE ENQUIRY DETAIL MODAL / DRAWER ── */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Client Enquiry Details
                </span>
                <h3 className="mt-1 font-serif text-2xl text-foreground">
                  {selectedEnquiry.name}
                </h3>
                {selectedEnquiry.company && (
                  <p className="text-xs text-muted-foreground">{selectedEnquiry.company}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4 text-xs">
              {/* Metadata Pills */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/80 bg-secondary/30 p-2.5">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Package
                  </span>
                  <p className="mt-0.5 font-medium text-foreground truncate">
                    {selectedEnquiry.packageInterest || "Custom inquiry"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/80 bg-secondary/30 p-2.5">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Budget
                  </span>
                  <p className="mt-0.5 font-medium text-foreground truncate">
                    {selectedEnquiry.budget || "Not specified"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/80 bg-secondary/30 p-2.5">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Timeline
                  </span>
                  <p className="mt-0.5 font-medium text-foreground truncate">
                    {selectedEnquiry.timeline || "Flexible"}
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Client Message
                </span>
                <p className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* Quick Status Control */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-mono text-muted-foreground">Status:</span>
                <div className="flex items-center gap-1.5">
                  {(["new", "read", "replied", "archived"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateEnquiryStatus(selectedEnquiry.id, st)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-mono uppercase transition-colors ${
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
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(selectedEnquiry.email, "modal-email", "Email address")
                }
                className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                <Copy className="size-3.5" />
                <span>{selectedEnquiry.email}</span>
              </button>

              <a
                href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(
                  `Prajesh Shakya — Re: Your Inquiry`
                )}`}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                <ExternalLink className="size-3.5" />
                <span>Email Client App</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSelectedEnquiry(null)
                  onNavigate?.("email")
                }}
                className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
              >
                <Mail className="size-3.5" />
                <span>Compose in Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
