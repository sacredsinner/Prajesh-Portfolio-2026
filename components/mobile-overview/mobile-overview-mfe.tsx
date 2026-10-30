"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Overview } from "@/lib/overview"
import { useMicroFrontendBridge } from "@/lib/mfe-bridge"
import { BrandMark } from "@/components/brand-mark"
import { MobileLeadDrawer, type MobileLeadItem } from "@/components/mobile-overview/mobile-lead-drawer"
import { MobileDeviceWrapper } from "@/components/mobile-overview/mobile-device-wrapper"
import { syncNotionNotesAction, updateContact } from "@/app/actions/cms"
import { formatDate } from "@/lib/invoices"
import { toast } from "sonner"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  Eye,
  Layers,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  RefreshCw,
  Search,
  Share2,
  Sliders,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react"

export type MobileTab = "pulse" | "leads" | "finance" | "boards" | "studio"

interface MobileOverviewMfeProps {
  data: Overview
  isAdmin?: boolean
  userEmail?: string | null
  isDemo?: boolean
}

export function MobileOverviewMfe({ data, isAdmin = false, userEmail, isDemo = false }: MobileOverviewMfeProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<MobileTab>("pulse")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearch, setShowSearch] = React.useState(false)
  const [isSyncingNotion, setIsSyncingNotion] = React.useState(false)
  const [selectedLead, setSelectedLead] = React.useState<MobileLeadItem | null>(null)
  const [leadList, setLeadList] = React.useState(data.enquiries.recent)
  const [selectedMonthBar, setSelectedMonthBar] = React.useState<{ month: string; label: string; amount: number; count: number } | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Sync state if server data refreshes
  React.useEffect(() => {
    setLeadList(data.enquiries.recent)
  }, [data.enquiries.recent])

  // Micro Frontend bridge communication with host shell
  const { isEmbedded, emitAction, emitNavigation } = useMicroFrontendBridge({
    name: "studio-overview-mobile",
    version: "2026.1.0",
    route: "/overview",
    onRefresh: () => router.refresh(),
    onSetTab: (tab) => {
      if (["pulse", "leads", "finance", "boards", "studio"].includes(tab)) {
        setActiveTab(tab as MobileTab)
      }
    },
  })

  const switchTab = (tab: MobileTab) => {
    setActiveTab(tab)
    emitNavigation(tab)
  }

  // Studio live Kathmandu clock
  const [kathmanduTime, setKathmanduTime] = React.useState<string>("")
  React.useEffect(() => {
    const updateTime = () => {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date())
      setKathmanduTime(formatted)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Clipboard copy helper
  const copyToClipboard = (text: string, id: string, label = "Link") => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(`${label} copied to clipboard`)
    emitAction("clipboard_copy", { id, label })
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle Notion sync
  const handleSyncNotion = async () => {
    if (isSyncingNotion) return
    setIsSyncingNotion(true)
    const toastId = toast.loading("Syncing notes from Notion...")
    try {
      const result = await syncNotionNotesAction()
      if (result.ok) {
        toast.success(`Notion synced: ${result.added} added, ${result.updated} updated (${result.total} total)`, { id: toastId })
        emitAction("notion_synced", { added: result.added, updated: result.updated, total: result.total })
        router.refresh()
      } else {
        toast.error(result.errors?.[0] || "Could not sync Notion notes", { id: toastId })
      }
    } catch (err: any) {
      toast.error(`Sync error: ${err.message || "Unknown error"}`, { id: toastId })
    } finally {
      setIsSyncingNotion(false)
    }
  }

  // Handle Lead status update
  const handleUpdateLeadStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setLeadList((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)))
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null))
    }

    try {
      await updateContact(id, newStatus)
      emitAction("lead_status_updated", { id, newStatus })
      router.refresh()
    } catch (err) {
      console.warn("Could not persist contact status to database:", err)
    }
  }

  // Search filtering
  const query = searchQuery.trim().toLowerCase()
  const filteredLeads = leadList.filter((c) => {
    if (!query) return true
    return (
      c.name.toLowerCase().includes(query) ||
      (c.company ?? "").toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.message.toLowerCase().includes(query) ||
      (c.packageInterest ?? "").toLowerCase().includes(query)
    )
  })

  const filteredInvoices = data.money.unpaidList.filter((d) => {
    if (!query) return true
    return (
      d.number.toLowerCase().includes(query) ||
      d.clientName.toLowerCase().includes(query) ||
      (d.clientCompany ?? "").toLowerCase().includes(query) ||
      d.total.toLowerCase().includes(query)
    )
  })

  const filteredMoodboards = data.moodboards.recent.filter((b) => {
    if (!query) return true
    return b.title.toLowerCase().includes(query) || (b.clientName ?? "").toLowerCase().includes(query)
  })

  // Urgent operational tasks
  const urgentTasks = [
    ...(data.money.overdueCount > 0
      ? [
          {
            id: "overdue-inv",
            title: `${data.money.overdueCount} Overdue Invoice${data.money.overdueCount > 1 ? "s" : ""}`,
            subtitle: `Total: ${data.money.overdueAmounts.join(", ")}`,
            severity: "critical" as const,
            actionLabel: "View Invoices",
            onClick: () => switchTab("finance"),
          },
        ]
      : []),
    ...(data.enquiries.newCount > 0
      ? [
          {
            id: "new-leads",
            title: `${data.enquiries.newCount} New Client Inquir${data.enquiries.newCount > 1 ? "ies" : "y"}`,
            subtitle: "Awaiting studio response & intake review",
            severity: "warning" as const,
            actionLabel: "Open Inbox",
            onClick: () => switchTab("leads"),
          },
        ]
      : []),
    ...(data.moodboards.changesRequested > 0
      ? [
          {
            id: "moodboard-changes",
            title: `${data.moodboards.changesRequested} Moodboard Feedback`,
            subtitle: "Client requested revisions on visual direction",
            severity: "info" as const,
            actionLabel: "Review Boards",
            onClick: () => switchTab("boards"),
          },
        ]
      : []),
  ]

  const maxRevenue = Math.max(...data.money.monthlyRevenue.map((m) => m.amount), 1000)

  return (
    <MobileDeviceWrapper isEmbedded={isEmbedded}>
      <div className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
        {/* Sticky Mobile Top Header */}
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-6 w-6 text-foreground" />
            <div className="flex flex-col">
              <span className="font-serif text-sm font-semibold tracking-tight leading-none text-foreground">
                Prajesh Shakya
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5 flex items-center gap-1">
                Overview · MFE
                {isDemo && <span className="text-amber-500 font-semibold">[Demo]</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Kathmandu Studio Clock Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 border border-border/60 text-[11px] font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{kathmanduTime || "Kathmandu"}</span>
            </div>

            {/* Notion Sync Button */}
            <button
              onClick={handleSyncNotion}
              disabled={isSyncingNotion}
              className="p-1.5 rounded-full hover:bg-secondary border border-border/40 text-muted-foreground hover:text-foreground transition-all active:scale-95"
              title="Sync Notion Notes"
              aria-label="Sync Notion"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncingNotion ? "animate-spin text-foreground" : ""}`} />
            </button>

            {/* Search Toggle Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1.5 rounded-full border transition-all active:scale-95 ${
                showSearch
                  ? "bg-foreground text-background border-foreground"
                  : "hover:bg-secondary border-border/40 text-muted-foreground hover:text-foreground"
              }`}
              title="Search Overview"
              aria-label="Toggle Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Collapsible Mobile Search Bar */}
        {showSearch && (
          <div className="px-4 py-2.5 bg-secondary/40 border-b border-border animate-in slide-in-from-top-2 duration-150">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, invoices, moodboards..."
                className="w-full h-9 pl-9 pr-8 rounded-full bg-background border border-border text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Scrollable Content Area */}
        <main className="flex-1 px-4 py-4 pb-28 space-y-5">
          {/* TAB 1: PULSE (STUDIO OVERVIEW) */}
          {activeTab === "pulse" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* Urgent Action Banner */}
              {urgentTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      Attention Required ({urgentTasks.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {urgentTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          task.severity === "critical"
                            ? "bg-red-500/5 border-red-500/30 text-red-950 dark:text-red-200"
                            : task.severity === "warning"
                            ? "bg-amber-500/5 border-amber-500/30 text-amber-950 dark:text-amber-200"
                            : "bg-blue-500/5 border-blue-500/30 text-blue-950 dark:text-blue-200"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <h4 className="font-serif text-sm font-semibold tracking-tight text-foreground">{task.title}</h4>
                          <p className="text-[11px] text-muted-foreground">{task.subtitle}</p>
                        </div>
                        <button
                          onClick={task.onClick}
                          className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-medium tracking-wide flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
                        >
                          {task.actionLabel}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bento KPI Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Revenue YTD Card */}
                <div
                  onClick={() => switchTab("finance")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border hover:border-foreground/40 cursor-pointer transition-all active:scale-[0.98] space-y-1"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-[10px] uppercase tracking-wider">Collected 2026</span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    {data.money.paidThisYear[0] || "$0"}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {data.money.totalPaidCount} settled invoices
                  </p>
                </div>

                {/* Outstanding Invoices Card */}
                <div
                  onClick={() => switchTab("finance")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border hover:border-foreground/40 cursor-pointer transition-all active:scale-[0.98] space-y-1"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-[10px] uppercase tracking-wider">Outstanding</span>
                    <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    {data.money.outstanding[0] || "$0"}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    {data.money.overdueCount > 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {data.money.overdueCount} overdue
                      </span>
                    ) : (
                      <span>All within due date</span>
                    )}
                  </p>
                </div>

                {/* Active Leads Card */}
                <div
                  onClick={() => switchTab("leads")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border hover:border-foreground/40 cursor-pointer transition-all active:scale-[0.98] space-y-1"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-[10px] uppercase tracking-wider">New Inquiries</span>
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <div className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    {data.enquiries.newCount}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {data.enquiries.monthCount} this month
                  </p>
                </div>

                {/* Client Moodboards Card */}
                <div
                  onClick={() => switchTab("boards")}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border hover:border-foreground/40 cursor-pointer transition-all active:scale-[0.98] space-y-1"
                >
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-mono text-[10px] uppercase tracking-wider">Moodboards</span>
                    <Layers className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                  <div className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    {data.moodboards.totalCount}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {data.moodboards.changesRequested > 0 ? (
                      <span className="text-amber-500 font-semibold">
                        {data.moodboards.changesRequested} need review
                      </span>
                    ) : (
                      <span>{data.moodboards.awaiting} shared</span>
                    )}
                  </p>
                </div>
              </div>

              {/* 6-Month Cashflow Sparkline */}
              <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    6-Month Cashflow Trajectory
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-foreground">
                    {selectedMonthBar
                      ? `${selectedMonthBar.label}: $${selectedMonthBar.amount.toLocaleString()}`
                      : "Tap bar to inspect"}
                  </span>
                </div>

                <div className="h-24 flex items-end justify-between gap-2 pt-2 px-1">
                  {data.money.monthlyRevenue.map((bucket) => {
                    const heightPct = Math.max(Math.round((bucket.amount / maxRevenue) * 100), 12)
                    const isSelected = selectedMonthBar?.month === bucket.month
                    return (
                      <div
                        key={bucket.month}
                        onClick={() => setSelectedMonthBar(bucket)}
                        className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                      >
                        <div className="w-full h-16 flex items-end justify-center">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[28px] rounded-t transition-all ${
                              isSelected
                                ? "bg-foreground shadow-sm"
                                : "bg-foreground/25 group-hover:bg-foreground/50"
                            }`}
                          />
                        </div>
                        <span
                          className={`font-mono text-[9px] uppercase transition-colors ${
                            isSelected ? "font-bold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {bucket.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Studio Recent Activity Stream */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Live Activity Stream
                  </span>
                  <button
                    onClick={() => switchTab("leads")}
                    className="font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    View all <ChevronRight className="h-2.5 w-2.5" />
                  </button>
                </div>

                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-background">
                  {/* Latest Enquiry */}
                  {data.enquiries.recent[0] && (
                    <div
                      onClick={() => {
                        setSelectedLead(data.enquiries.recent[0])
                        emitAction("open_lead_drawer", { id: data.enquiries.recent[0].id })
                      }}
                      className="p-3 hover:bg-secondary/40 cursor-pointer flex items-center justify-between gap-3 transition-colors active:bg-secondary/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {data.enquiries.recent[0].name}
                            {data.enquiries.recent[0].company && (
                              <span className="text-muted-foreground font-normal">
                                {" "}
                                · {data.enquiries.recent[0].company}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {data.enquiries.recent[0].packageInterest || "Design inquiry"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  )}

                  {/* Latest Moodboard Comment */}
                  {data.moodboards.recentComments[0] && (
                    <div
                      onClick={() => switchTab("boards")}
                      className="p-3 hover:bg-secondary/40 cursor-pointer flex items-center justify-between gap-3 transition-colors active:bg-secondary/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {data.moodboards.recentComments[0].author} commented
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate italic">
                            &quot;{data.moodboards.recentComments[0].body}&quot;
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  )}

                  {/* Latest Settled Invoice */}
                  {data.money.recentTransactions[0] && (
                    <div
                      onClick={() => switchTab("finance")}
                      className="p-3 hover:bg-secondary/40 cursor-pointer flex items-center justify-between gap-3 transition-colors active:bg-secondary/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            Paid: {data.money.recentTransactions[0].clientName}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground truncate">
                            {data.money.recentTransactions[0].currency}{" "}
                            {Number(data.money.recentTransactions[0].total).toLocaleString()} ·{" "}
                            {data.money.recentTransactions[0].number}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Studio Fast Launcher */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/moodboard-designer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border hover:bg-secondary transition-all active:scale-95"
                >
                  <Palette className="h-4 w-4 text-foreground" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-foreground">Moodboard Studio</p>
                    <p className="text-[10px] text-muted-foreground">Create canvas</p>
                  </div>
                </Link>

                <Link
                  href="/admin/socials"
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 border border-border hover:bg-secondary transition-all active:scale-95"
                >
                  <Share2 className="h-4 w-4 text-foreground" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-foreground">Socials Media</p>
                    <p className="text-[10px] text-muted-foreground">Publish & sync</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS (INQUIRIES & CLIENT CRM) */}
          {activeTab === "leads" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">Client Inquiries</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {filteredLeads.length} leads in studio pipeline
                  </p>
                </div>
                <button
                  onClick={() => router.refresh()}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-2.5">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl p-6">
                    <p className="text-xs text-muted-foreground">No inquiries matching filter.</p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const isNew = lead.status === "new"
                    return (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead)
                          emitAction("open_lead_drawer", { id: lead.id })
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${
                          isNew
                            ? "bg-secondary/40 border-foreground/30 shadow-xs"
                            : "bg-background border-border hover:bg-secondary/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm font-semibold tracking-tight text-foreground">
                                {lead.name}
                              </span>
                              {isNew && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                                  New
                                </span>
                              )}
                            </div>
                            {lead.company && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" /> {lead.company}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                            {lead.createdAt
                              ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
                                  new Date(lead.createdAt)
                                )
                              : ""}
                          </span>
                        </div>

                        {/* Package & Budget Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {lead.packageInterest && (
                            <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-foreground border border-border/50">
                              {lead.packageInterest}
                            </span>
                          )}
                          {lead.budget && (
                            <span className="px-2 py-0.5 rounded-md bg-secondary/60 text-[10px] font-mono text-muted-foreground border border-border/30">
                              {lead.budget}
                            </span>
                          )}
                        </div>

                        {/* Message Preview */}
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {lead.message}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCE (INVOICES & REVENUE) */}
          {activeTab === "finance" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">Financial Ledger</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {data.money.unpaidList.length} open documents
                  </p>
                </div>
                <Link
                  href="/admin/invoices"
                  className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  Manage <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Financial Snapshot Summary */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Outstanding Unpaid
                  </span>
                  <span className="font-serif text-xl font-semibold text-foreground mt-0.5 block">
                    {data.money.outstanding[0] || "$0"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Settled YTD
                  </span>
                  <span className="font-serif text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {data.money.paidThisYear[0] || "$0"}
                  </span>
                </div>
              </div>

              {/* Unpaid / Active Invoices */}
              <div className="space-y-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block">
                  Active Invoice Documents
                </span>

                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">No active invoices pending payment.</p>
                  </div>
                ) : (
                  filteredInvoices.map((inv) => {
                    const clientUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${inv.publicToken}`
                    return (
                      <div
                        key={inv.id}
                        className={`p-3.5 rounded-xl border space-y-3 transition-all ${
                          inv.overdue
                            ? "bg-red-500/5 border-red-500/30"
                            : "bg-background border-border hover:bg-secondary/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-foreground">{inv.number}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                                  inv.overdue
                                    ? "bg-red-500/15 text-red-600 dark:text-red-400 font-semibold"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {inv.overdue ? "Overdue" : inv.status}
                              </span>
                            </div>
                            <h4 className="font-serif text-sm font-medium text-foreground mt-1">{inv.clientName}</h4>
                            {inv.clientCompany && (
                              <p className="text-[11px] text-muted-foreground">{inv.clientCompany}</p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="font-serif text-base font-semibold text-foreground block">
                              {inv.currency} {Number(inv.total).toLocaleString()}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              Due {formatDate(inv.dueDate)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Mobile Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                          <button
                            onClick={() => copyToClipboard(clientUrl, inv.id, "Client invoice link")}
                            className="flex-1 flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono transition-colors active:scale-95"
                          >
                            {copiedId === inv.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy Link
                          </button>
                          <Link
                            href={`/i/${inv.publicToken}`}
                            target="_blank"
                            className="flex items-center justify-center gap-1 h-8 px-3 rounded-lg border border-border hover:bg-secondary text-foreground text-xs font-medium transition-colors active:scale-95"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Link>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: BOARDS (CLIENT MOODBOARDS) */}
          {activeTab === "boards" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">Moodboards & Reviews</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {data.moodboards.totalCount} client design directions
                  </p>
                </div>
                <Link
                  href="/moodboard-designer"
                  className="px-2.5 py-1 rounded-full bg-foreground text-background text-xs font-medium flex items-center gap-1"
                >
                  <Palette className="h-3 w-3" /> New
                </Link>
              </div>

              {/* Moodboards List */}
              <div className="space-y-2.5">
                {filteredMoodboards.map((board) => {
                  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/m/${board.shareToken}`
                  const hasChanges = board.status === "changes"
                  const isApproved = board.status === "approved"
                  return (
                    <div
                      key={board.id}
                      className={`p-3.5 rounded-xl border space-y-3 transition-all ${
                        hasChanges
                          ? "bg-amber-500/5 border-amber-500/30"
                          : isApproved
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : "bg-background border-border hover:bg-secondary/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-semibold text-foreground tracking-tight">
                              {board.title}
                            </span>
                          </div>
                          {board.clientName && (
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> For {board.clientName}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider shrink-0 ${
                            hasChanges
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                              : isApproved
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {board.status}
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                        <button
                          onClick={() => copyToClipboard(shareUrl, board.id, "Moodboard share link")}
                          className="flex-1 flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono transition-colors active:scale-95"
                        >
                          {copiedId === board.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          Share Link
                        </button>
                        <Link
                          href={`/m/${board.shareToken}`}
                          target="_blank"
                          className="flex items-center justify-center gap-1 h-8 px-3 rounded-lg border border-border hover:bg-secondary text-foreground text-xs font-medium transition-colors active:scale-95"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Client Comments Snippet */}
              {data.moodboards.recentComments.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block">
                    Recent Client Feedback
                  </span>
                  <div className="space-y-2">
                    {data.moodboards.recentComments.map((cmt) => (
                      <div key={cmt.id} className="p-3 rounded-xl bg-secondary/30 border border-border text-xs space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground font-mono text-[10px]">
                          <span>{cmt.author}</span>
                          <span>{cmt.boardTitle}</span>
                        </div>
                        <p className="text-foreground italic leading-relaxed">&quot;{cmt.body}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STUDIO (TOOLS & MFE LAUNCHER) */}
          {activeTab === "studio" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">Studio Launchpad</h3>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Administrative tools & micro frontend controls
                </p>
              </div>

              {/* Primary Studio Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleSyncNotion}
                  disabled={isSyncingNotion}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-secondary/40 border border-border hover:bg-secondary text-foreground text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-foreground text-background flex items-center justify-center">
                      <RefreshCw className={`h-4 w-4 ${isSyncingNotion ? "animate-spin" : ""}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Sync Notion Notes</p>
                      <p className="text-[10px] text-muted-foreground">Pull latest editorial essays</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                <Link
                  href="/moodboard-designer"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-secondary/40 border border-border hover:bg-secondary text-foreground text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Palette className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Moodboard Designer</p>
                      <p className="text-[10px] text-muted-foreground">Craft visual client presentations</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/admin/socials"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-secondary/40 border border-border hover:bg-secondary text-foreground text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Share2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Socials Media Manager</p>
                      <p className="text-[10px] text-muted-foreground">Buffer GraphQL & live feeds</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Link
                  href="/admin/invoices"
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-secondary/40 border border-border hover:bg-secondary text-foreground text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Invoice & Quote Engine</p>
                      <p className="text-[10px] text-muted-foreground">Issue documents & track payouts</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>

              {/* Vercel Micro Frontend Spec Card */}
              <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Vercel Micro Frontend Spec
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Route</span>
                    <span className="text-foreground">/overview</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target</span>
                    <span className="text-foreground">Mobile (Multi-Zone / Standalone)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PostMessage Bridge</span>
                    <span className="text-emerald-500">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Container</span>
                    <span className="text-foreground">{isEmbedded ? "Iframe / Host Shell" : "Native Mobile Web"}</span>
                  </div>
                </div>
              </div>

              {/* Portfolio Link Quick Copy */}
              <button
                onClick={() => copyToClipboard("https://shakyaprajesh.com.np", "portfolio-link", "Portfolio URL")}
                className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-border hover:bg-secondary text-xs font-mono text-muted-foreground hover:text-foreground transition-all active:scale-95"
              >
                {copiedId === "portfolio-link" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy Portfolio Link (shakyaprajesh.com.np)
              </button>
            </div>
          )}
        </main>

        {/* Sticky Mobile Bottom Navigation Bar */}
        <nav
          role="navigation"
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-colors"
        >
          <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
            {/* 1. Pulse */}
            <button
              onClick={() => switchTab("pulse")}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                activeTab === "pulse"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-5 w-5" />
              <span className="text-[10px] font-mono tracking-tight mt-1">Pulse</span>
            </button>

            {/* 2. Leads */}
            <button
              onClick={() => switchTab("leads")}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                activeTab === "leads"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {data.enquiries.newCount > 0 && (
                <span className="absolute top-1 right-3 h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-black text-[9px] font-mono font-bold flex items-center justify-center">
                  {data.enquiries.newCount}
                </span>
              )}
              <Users className="h-5 w-5" />
              <span className="text-[10px] font-mono tracking-tight mt-1">Leads</span>
            </button>

            {/* 3. Finance */}
            <button
              onClick={() => switchTab("finance")}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                activeTab === "finance"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {data.money.overdueCount > 0 && (
                <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
              <CreditCard className="h-5 w-5" />
              <span className="text-[10px] font-mono tracking-tight mt-1">Finance</span>
            </button>

            {/* 4. Boards */}
            <button
              onClick={() => switchTab("boards")}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                activeTab === "boards"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {data.moodboards.changesRequested > 0 && (
                <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-amber-500" />
              )}
              <Layers className="h-5 w-5" />
              <span className="text-[10px] font-mono tracking-tight mt-1">Boards</span>
            </button>

            {/* 5. Studio */}
            <button
              onClick={() => switchTab("studio")}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                activeTab === "studio"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-5 w-5" />
              <span className="text-[10px] font-mono tracking-tight mt-1">Studio</span>
            </button>
          </div>
        </nav>

        {/* Mobile Lead Bottom Sheet / Drawer */}
        <MobileLeadDrawer
          lead={selectedLead}
          open={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleUpdateLeadStatus}
        />
      </div>
    </MobileDeviceWrapper>
  )
}
