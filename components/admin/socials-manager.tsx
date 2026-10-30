"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Send,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Radio,
  Layers,
  Settings2,
  ArrowUpRight,
  ImageIcon,
  X,
  Share2,
} from "lucide-react"
import {
  createSocialPost,
  deleteSocialPost,
  publishSocialPostNow,
  addSocialIdea,
  deleteSocialIdea,
  generateAiHooks,
  toggleChannelConnected,
  setAllChannelsConnected,
} from "@/app/actions/socials"
import type { SocialsData, SocialPlatform, SocialPost, SocialChannel } from "@/lib/socials"

interface SocialsManagerProps {
  initial: SocialsData
}

type BufferSubTab = "queue" | "drafts" | "sent" | "settings"

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { name: string; maxChars: number; shortName: string; color: string; badge: string }
> = {
  twitter: { name: "X / Twitter", maxChars: 280, shortName: "X", color: "text-sky-400", badge: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  linkedin: { name: "LinkedIn", maxChars: 3000, shortName: "in", color: "text-blue-500", badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  instagram: { name: "Instagram", maxChars: 2200, shortName: "IG", color: "text-pink-500", badge: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  threads: { name: "Threads", maxChars: 500, shortName: "Threads", color: "text-violet-400", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  bluesky: { name: "Bluesky", maxChars: 300, shortName: "Bsky", color: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  facebook: { name: "Facebook", maxChars: 5000, shortName: "FB", color: "text-blue-600", badge: "bg-blue-600/10 text-blue-600 border-blue-600/20" },
}

export function SocialsManager({ initial }: SocialsManagerProps) {
  const router = useRouter()
  const [data, setData] = React.useState<SocialsData>(initial)
  const [selectedChannelId, setSelectedChannelId] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState<BufferSubTab>("queue")

  // Composer State
  const [composerExpanded, setComposerExpanded] = React.useState(false)
  const [postContent, setPostContent] = React.useState("")
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<SocialPlatform[]>(["twitter", "linkedin"])
  const [mediaUrl, setMediaUrl] = React.useState("")
  const [showMediaInput, setShowMediaInput] = React.useState(false)
  const [scheduleDate, setScheduleDate] = React.useState("")
  const [scheduleTime, setScheduleTime] = React.useState(initial.defaultScheduleTime || "17:00")
  const [submitting, setSubmitting] = React.useState(false)

  // AI Hooks Assistant in Composer
  const [showAiPanel, setShowAiPanel] = React.useState(false)
  const [aiTopic, setAiTopic] = React.useState("")
  const [aiAngle, setAiAngle] = React.useState<"all" | "hot-take" | "case-study" | "tip" | "launch">("all")
  const [isGeneratingHooks, setIsGeneratingHooks] = React.useState(false)
  const [hooksList, setHooksList] = React.useState<string[]>([
    "Most designers over-index on Figma files and under-index on design token documentation. Here's why that slows teams down:",
    "Case Study breakdown: How we cut bounce rate by 40% with micro-interactions 🧵👇",
    "Quick design tip: If your secondary buttons look like disabled primary buttons, your visual hierarchy is lying.",
    "New portfolio refresh shipped! Built with Next.js 16 and typography-driven layout principles.",
  ])

  const [copiedMcp, setCopiedMcp] = React.useState(false)

  // Filter posts based on active channel and sub-tab
  const activeChannel = data.channels.find((c) => c.id === selectedChannelId)

  const filteredPosts = React.useMemo(() => {
    return data.posts.filter((post) => {
      // Channel filtering
      if (selectedChannelId !== "all" && activeChannel) {
        if (!post.platforms.includes(activeChannel.platform)) return false
      }
      // Sub-tab filtering
      if (activeTab === "queue") return post.status === "scheduled" || post.status === "queued"
      if (activeTab === "drafts") return post.status === "draft"
      if (activeTab === "sent") return post.status === "published"
      return true
    })
  }, [data.posts, selectedChannelId, activeChannel, activeTab])

  // Group queue posts by date
  const groupedQueue = React.useMemo(() => {
    const groups: { label: string; posts: SocialPost[] }[] = []
    const now = new Date()
    const todayStr = now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()

    filteredPosts.forEach((post) => {
      const d = post.scheduledFor ? new Date(post.scheduledFor) : new Date(post.createdAt)
      let label = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(d)
      if (d.toDateString() === todayStr) label = "Today"
      else if (d.toDateString() === tomorrowStr) label = "Tomorrow"

      const existing = groups.find((g) => g.label === label)
      if (existing) {
        existing.posts.push(post)
      } else {
        groups.push({ label, posts: [post] })
      }
    })
    return groups
  }, [filteredPosts])

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    )
  }

  // Handle Post Creation
  const handleCreatePost = async (publishNow = false, asDraft = false) => {
    if (!postContent.trim()) {
      toast.error("Please enter a message.")
      return
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one channel.")
      return
    }

    let scheduledFor: string | undefined
    if (!publishNow && !asDraft && scheduleDate) {
      scheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
    } else if (!publishNow && !asDraft) {
      // Default to next slot tomorrow 5pm
      const nextSlot = new Date()
      nextSlot.setDate(nextSlot.getDate() + 1)
      nextSlot.setHours(17, 0, 0, 0)
      scheduledFor = nextSlot.toISOString()
    }

    setSubmitting(true)
    try {
      const res = await createSocialPost({
        content: postContent,
        platforms: selectedPlatforms,
        publishNow,
        scheduledFor,
        mediaUrl: mediaUrl.trim() || undefined,
      })

      if (res.ok && res.post) {
        toast.success(
          publishNow ? "Post published via Buffer!" : asDraft ? "Saved to drafts" : "Added to Buffer queue!"
        )
        setData((prev) => ({ ...prev, posts: [res.post!, ...prev.posts] }))
        setPostContent("")
        setMediaUrl("")
        setComposerExpanded(false)
        setShowAiPanel(false)
        if (publishNow) setActiveTab("sent")
        else if (asDraft) setActiveTab("drafts")
        else setActiveTab("queue")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to create post.")
      }
    } catch {
      toast.error("Error creating post.")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Publish Now
  const handlePublishNow = async (id: string) => {
    const loadingToast = toast.loading("Publishing to Buffer...")
    try {
      const res = await publishSocialPostNow(id)
      if (res.ok) {
        toast.success("Post published!", { id: loadingToast })
        setData((prev) => ({
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === id ? { ...p, status: "published", publishedAt: new Date().toISOString() } : p
          ),
        }))
        router.refresh()
      } else {
        toast.error(res.error || "Could not publish post", { id: loadingToast })
      }
    } catch {
      toast.error("Error publishing post", { id: loadingToast })
    }
  }

  // Handle Delete Post
  const handleDeletePost = async (id: string) => {
    try {
      const res = await deleteSocialPost(id)
      if (res.ok) {
        toast.success("Post removed.")
        setData((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== id) }))
        router.refresh()
      }
    } catch {
      toast.error("Error deleting post")
    }
  }

  // AI Hooks Generator
  const handleGenerateHooks = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsGeneratingHooks(true)
    const toastId = toast.loading("Gemini is generating hooks...")
    try {
      const res = await generateAiHooks(aiTopic, aiAngle)
      if (res.ok && res.hooks && res.hooks.length > 0) {
        setHooksList(res.hooks)
        toast.success(`Generated ${res.hooks.length} hooks!`, { id: toastId })
      } else {
        toast.error(res.error || "Could not generate hooks.", { id: toastId })
      }
    } catch {
      toast.error("Error generating hooks.", { id: toastId })
    } finally {
      setIsGeneratingHooks(false)
    }
  }

  const copyMcpConfig = () => {
    const code = JSON.stringify(
      {
        mcpServers: {
          buffer: {
            url: data.bufferEndpoint,
          },
        },
      },
      null,
      2
    )
    navigator.clipboard.writeText(code)
    setCopiedMcp(true)
    toast.success("Buffer MCP configuration copied!")
    setTimeout(() => setCopiedMcp(false), 2000)
  }

  const queueCount = data.posts.filter((p) => p.status === "scheduled" || p.status === "queued").length
  const draftsCount = data.posts.filter((p) => p.status === "draft").length
  const sentCount = data.posts.filter((p) => p.status === "published").length

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[700px]">
      {/* ── LEFT SIDEBAR: BUFFER CHANNELS ── */}
      <aside className="w-full md:w-64 shrink-0 space-y-4">
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <p className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Channels
          </p>

          {/* All Channels Option */}
          <button
            type="button"
            onClick={() => setSelectedChannelId("all")}
            className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
              selectedChannelId === "all"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-secondary/80 text-[10px] font-bold">
                *
              </div>
              <span>All Channels</span>
            </div>
            <span className="text-[11px] opacity-70">{queueCount}</span>
          </button>

          {/* Individual Channel List */}
          {data.channels.map((chan) => {
            const conf = PLATFORM_CONFIG[chan.platform]
            const isSelected = selectedChannelId === chan.id
            const count = data.posts.filter(
              (p) =>
                p.platforms.includes(chan.platform) &&
                (p.status === "scheduled" || p.status === "queued")
            ).length

            return (
              <button
                key={chan.id}
                type="button"
                onClick={() => setSelectedChannelId(chan.id)}
                className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative size-6 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[10px] font-mono">
                    {conf.shortName}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-background ${
                        chan.connected ? "bg-emerald-500" : "bg-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="truncate text-left leading-tight">
                    <p className="truncate">{chan.name}</p>
                    <p className="text-[10px] opacity-60 font-mono truncate">{chan.handle}</p>
                  </div>
                </div>
                {count > 0 && <span className="text-[11px] opacity-70">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Buffer MCP Mini Footer Card */}
        <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Buffer MCP</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Connected via <code className="text-foreground">mcp.buffer.com</code>
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="w-full text-left text-[11px] text-muted-foreground hover:text-foreground underline pt-1"
          >
            Manage MCP & API Settings →
          </button>
        </div>
      </aside>

      {/* ── RIGHT MAIN PANEL: BUFFER QUEUE & COMPOSER ── */}
      <main className="flex-1 space-y-4 min-w-0">
        {/* Top Header & Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3">
          {/* Sub-tabs: Queue, Drafts, Sent */}
          <div className="flex items-center gap-1.5">
            {[
              { id: "queue", label: "Queue", count: queueCount },
              { id: "drafts", label: "Drafts", count: draftsCount },
              { id: "sent", label: "Sent", count: sentCount },
              { id: "settings", label: "Settings & MCP" },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as BufferSubTab)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive ? "bg-background/20 text-background" : "bg-secondary text-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* "+ Create Post" Button */}
          <button
            type="button"
            onClick={() => setComposerExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>{composerExpanded ? "Close Composer" : "Create Post"}</span>
          </button>
        </div>

        {/* ── BUFFER COMPOSER (Expandable Box) ── */}
        {composerExpanded && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3.5 transition-all shadow-sm">
            {/* Top: Channels to Publish to */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground mr-1">Post to:</span>
              {(Object.keys(PLATFORM_CONFIG) as SocialPlatform[]).map((platform) => {
                const conf = PLATFORM_CONFIG[platform]
                const isSelected = selectedPlatforms.includes(platform)
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="size-2.5" />}
                    <span>{conf.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What would you like to share?..."
                className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground transition-colors resize-y leading-relaxed"
              />

              {/* Character Limit Indicator */}
              <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-muted-foreground pt-1">
                {selectedPlatforms.map((p) => {
                  const max = PLATFORM_CONFIG[p].maxChars
                  const len = postContent.length
                  return (
                    <span key={p} className={len > max ? "text-destructive font-bold" : ""}>
                      {p}: {len}/{max}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Media Attachment (Optional) */}
            {showMediaInput && (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste image or preview URL..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl("")
                    setShowMediaInput(false)
                  }}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* AI Hooks Drawer / Dropdown */}
            {showAiPanel && (
              <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Sparkles className="size-3.5 text-amber-400" />
                    <span>AI Hook Ideas (Gemini)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiPanel(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleGenerateHooks} className="flex gap-2">
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="Enter topic (e.g. Design token ROI)..."
                    className="flex-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs outline-none focus:border-foreground"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingHooks}
                    className="flex items-center gap-1 rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {isGeneratingHooks ? (
                      <RefreshCw className="size-3 animate-spin" />
                    ) : (
                      <Sparkles className="size-3" />
                    )}
                    <span>Generate</span>
                  </button>
                </form>

                <div className="grid gap-1.5 max-h-48 overflow-y-auto pt-1">
                  {hooksList.map((hook, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPostContent(hook)
                        toast.success("Hook applied to post!")
                      }}
                      className="text-left rounded border border-border/60 bg-background/60 p-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                      &ldquo;{hook}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Composer Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaInput((prev) => !prev)}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ImageIcon className="size-3.5" />
                  <span>Attach Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiPanel((prev) => !prev)}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>AI Hooks</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCreatePost(false, true)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCreatePost(false, false)}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-secondary hover:text-foreground transition-colors"
                >
                  Add to Queue
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleCreatePost(true, false)}
                  className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors shadow-sm"
                >
                  Share Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT ── */}

        {/* 1. QUEUE TAB (Buffer Style Timeline) */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            {groupedQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Layers className="size-8 text-muted-foreground/40 mb-2" />
                <h3 className="text-sm font-medium">Your queue is empty</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Click &ldquo;Create Post&rdquo; to add updates to your Buffer schedule slots.
                </p>
                <button
                  type="button"
                  onClick={() => setComposerExpanded(true)}
                  className="mt-4 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background"
                >
                  + Add a Post
                </button>
              </div>
            ) : (
              groupedQueue.map((group) => (
                <div key={group.label} className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-medium text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>{group.label}</span>
                  </div>

                  <div className="space-y-2">
                    {group.posts.map((post) => (
                      <div
                        key={post.id}
                        className="group flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Time & Channels */}
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                              <Clock className="size-2.5" />
                              {post.scheduledFor
                                ? new Intl.DateTimeFormat("en-GB", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }).format(new Date(post.scheduledFor))
                                : "Scheduled"}
                            </span>

                            {post.platforms.map((plat) => (
                              <span
                                key={plat}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${PLATFORM_CONFIG[plat].badge}`}
                              >
                                {PLATFORM_CONFIG[plat].shortName}
                              </span>
                            ))}
                          </div>

                          {/* Message Body */}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                            {post.content}
                          </p>

                          {post.mediaUrl && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <ExternalLink className="size-3" />
                              <span className="truncate max-w-sm">{post.mediaUrl}</span>
                            </div>
                          )}
                        </div>

                        {/* Hover Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handlePublishNow(post.id)}
                            className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                          >
                            <Send className="size-3" />
                            <span>Share Now</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="rounded-md border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. DRAFTS TAB */}
        {activeTab === "drafts" && (
          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No drafts saved.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {post.platforms.map((p) => (
                        <span key={p} className="text-[10px] font-mono text-muted-foreground uppercase">
                          {p}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed">{post.content}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setPostContent(post.content)
                        setSelectedPlatforms(post.platforms)
                        setComposerExpanded(true)
                      }}
                      className="rounded border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. SENT TAB */}
        {activeTab === "sent" && (
          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No sent posts yet.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
                        Published
                      </span>
                      {post.publishedAt && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          }).format(new Date(post.publishedAt))}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{post.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. SETTINGS & MCP TAB */}
        {activeTab === "settings" && (
          <div className="space-y-4 max-w-2xl">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Buffer MCP Server</h3>
                  <p className="text-xs text-muted-foreground">
                    Connects AI coding assistants directly to your social queue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyMcpConfig}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1 text-xs font-medium hover:bg-secondary"
                >
                  {copiedMcp ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedMcp ? "Copied" : "Copy Config"}</span>
                </button>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-3 font-mono text-xs">
                Endpoint: {data.bufferEndpoint}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <h3 className="text-sm font-medium">Buffer Direct API Token (Optional)</h3>
              <p className="text-xs text-muted-foreground">
                Set <code className="text-foreground">BUFFER_ACCESS_TOKEN</code> in your <code className="text-foreground">.env.local</code> if using standalone API requests.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Status: Connected via Buffer MCP
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
