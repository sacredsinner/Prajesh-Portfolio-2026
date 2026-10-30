"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Share2,
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
  Bot,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Globe,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react"
import {
  createSocialPost,
  deleteSocialPost,
  publishSocialPostNow,
  addSocialIdea,
  deleteSocialIdea,
} from "@/app/actions/socials"
import type { SocialsData, SocialPlatform, SocialPost } from "@/lib/socials"

interface SocialsManagerProps {
  initial: SocialsData
}

type TabType = "queue" | "composer" | "channels" | "mcp" | "ideas"

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { name: string; maxChars: number; color: string; badge: string }
> = {
  twitter: { name: "X / Twitter", maxChars: 280, color: "text-sky-400", badge: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  linkedin: { name: "LinkedIn", maxChars: 3000, color: "text-blue-500", badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  threads: { name: "Threads", maxChars: 500, color: "text-violet-400", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  instagram: { name: "Instagram", maxChars: 2200, color: "text-pink-500", badge: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  bluesky: { name: "Bluesky", maxChars: 300, color: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  facebook: { name: "Facebook", maxChars: 5000, color: "text-blue-600", badge: "bg-blue-600/10 text-blue-600 border-blue-600/20" },
}

export function SocialsManager({ initial }: SocialsManagerProps) {
  const router = useRouter()
  const [data, setData] = React.useState<SocialsData>(initial)
  const [activeTab, setActiveTab] = React.useState<TabType>("queue")
  const [copiedMcp, setCopiedMcp] = React.useState(false)

  // Composer Form State
  const [postContent, setPostContent] = React.useState("")
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<SocialPlatform[]>(["twitter", "linkedin"])
  const [mediaUrl, setMediaUrl] = React.useState("")
  const [scheduleDate, setScheduleDate] = React.useState("")
  const [scheduleTime, setScheduleTime] = React.useState(initial.defaultScheduleTime || "17:00")
  const [submitting, setSubmitting] = React.useState(false)

  // Quick Ideas Form State
  const [newIdeaTitle, setNewIdeaTitle] = React.useState("")
  const [newIdeaNotes, setNewIdeaNotes] = React.useState("")
  const [addingIdea, setAddingIdea] = React.useState(false)

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    )
  }

  // Handle Post Creation
  const handleCreatePost = async (publishNow = false) => {
    if (!postContent.trim()) {
      toast.error("Please enter post content.")
      return
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one social channel.")
      return
    }

    let scheduledFor: string | undefined
    if (!publishNow && scheduleDate) {
      scheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
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
        toast.success(publishNow ? "Post published via Buffer!" : "Post added to Buffer queue!")
        setData((prev) => ({ ...prev, posts: [res.post!, ...prev.posts] }))
        setPostContent("")
        setMediaUrl("")
        setScheduleDate("")
        setActiveTab("queue")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to create post.")
      }
    } catch {
      toast.error("An error occurred while creating the post.")
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
        toast.success("Post published successfully!", { id: loadingToast })
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

  // Handle Post Deletion
  const handleDeletePost = async (id: string) => {
    try {
      const res = await deleteSocialPost(id)
      if (res.ok) {
        toast.success("Post removed.")
        setData((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== id) }))
        router.refresh()
      } else {
        toast.error(res.error || "Could not delete post")
      }
    } catch {
      toast.error("Error deleting post")
    }
  }

  // Quick Hook Prompts
  const handleInsertHook = (hook: string) => {
    setPostContent((prev) => (prev ? `${prev}\n\n${hook}` : hook))
  }

  // Handle Add Idea
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIdeaTitle.trim()) return

    setAddingIdea(true)
    try {
      const res = await addSocialIdea(newIdeaTitle, newIdeaNotes)
      if (res.ok && res.idea) {
        toast.success("Idea saved.")
        setData((prev) => ({ ...prev, ideas: [res.idea!, ...prev.ideas] }))
        setNewIdeaTitle("")
        setNewIdeaNotes("")
      }
    } finally {
      setAddingIdea(false)
    }
  }

  // Handle Delete Idea
  const handleDeleteIdea = async (id: string) => {
    const res = await deleteSocialIdea(id)
    if (res.ok) {
      toast.success("Idea deleted.")
      setData((prev) => ({ ...prev, ideas: prev.ideas.filter((i) => i.id !== id) }))
    }
  }

  const mcpConfigCode = JSON.stringify(
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

  const copyMcpConfig = () => {
    navigator.clipboard.writeText(mcpConfigCode)
    setCopiedMcp(true)
    toast.success("Buffer MCP configuration copied to clipboard!")
    setTimeout(() => setCopiedMcp(false), 2000)
  }

  const activeQueueCount = data.posts.filter((p) => p.status === "scheduled" || p.status === "queued").length
  const publishedCount = data.posts.filter((p) => p.status === "published").length

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-medium tracking-tight">Socials & Buffer Hub</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500">
              <Radio className="size-2.5 animate-pulse text-emerald-500" />
              Buffer MCP Connected
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Schedule updates, manage social channels, and prompt your AI agent directly via{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px]">
              {data.bufferEndpoint}
            </code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("composer")}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90 shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>New Post</span>
          </button>
          <a
            href="https://buffer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <span>Buffer.com</span>
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-3">
        {[
          { id: "queue", label: "Queue & Feed", icon: Layers, count: activeQueueCount },
          { id: "composer", label: "Composer", icon: Send },
          { id: "channels", label: "Connected Channels", icon: Share2, count: data.channels.length },
          { id: "mcp", label: "Buffer MCP Config", icon: Bot },
          { id: "ideas", label: "Ideas & Drafts", icon: Lightbulb, count: data.ideas.length },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
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

      {/* TAB 1: Queue & Posts Feed */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {data.posts.length} post{data.posts.length === 1 ? "" : "s"} ({activeQueueCount} scheduled, {publishedCount} published)
            </span>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <RefreshCw className="size-3" />
              <span>Refresh</span>
            </button>
          </div>

          {data.posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <Share2 className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="text-sm font-medium">No posts in your social queue</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Compose your first post or ask your AI assistant to draft one using the Buffer MCP server.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("composer")}
                className="mt-4 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background"
              >
                Create a Post
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Platform Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.platforms.map((plat) => {
                          const conf = PLATFORM_CONFIG[plat]
                          return (
                            <span
                              key={plat}
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${conf.badge}`}
                            >
                              {conf.name}
                            </span>
                          )
                        })}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            post.status === "published"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : post.status === "scheduled"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                      {/* Media Link */}
                      {post.mediaUrl && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="size-3" />
                          <span className="truncate max-w-md">Attachment: {post.mediaUrl}</span>
                        </div>
                      )}

                      {/* Schedule / Timestamp */}
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        {post.scheduledFor && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Scheduled:{" "}
                            {new Intl.DateTimeFormat("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date(post.scheduledFor))}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className="flex items-center gap-1 text-emerald-500">
                            <CheckCircle2 className="size-3" />
                            Published:{" "}
                            {new Intl.DateTimeFormat("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            }).format(new Date(post.publishedAt))}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      {post.status !== "published" && (
                        <button
                          type="button"
                          onClick={() => handlePublishNow(post.id)}
                          className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
                        >
                          <Send className="size-3" />
                          <span>Publish Now</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Post Composer */}
      {activeTab === "composer" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              {/* Select Channels */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                  Target Social Channels
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PLATFORM_CONFIG) as SocialPlatform[]).map((platform) => {
                    const conf = PLATFORM_CONFIG[platform]
                    const isSelected = selectedPlatforms.includes(platform)
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                          isSelected
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                        }`}
                      >
                        {isSelected && <Check className="size-3" />}
                        <span>{conf.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Post Message
                  </label>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    {selectedPlatforms.map((p) => {
                      const max = PLATFORM_CONFIG[p].maxChars
                      const len = postContent.length
                      const isOver = len > max
                      return (
                        <span
                          key={p}
                          className={`text-[11px] ${isOver ? "text-destructive font-bold" : "text-muted-foreground"}`}
                        >
                          {p}: {len}/{max}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's happening in design, tech, or your latest project launch?"
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground transition-colors resize-y leading-relaxed font-sans"
                />
              </div>

              {/* Media URL */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Attachment / Media Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://.../preview.png or Vercel Blob URL"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                />
              </div>

              {/* Schedule options */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/40">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Schedule Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Time ({data.timezone})
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  Queued posts sync automatically with your Buffer schedule slots.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreatePost(false)}
                    className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Clock className="size-3.5" />
                    <span>Add to Buffer Queue</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleCreatePost(true)}
                    className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 transition-colors shadow-sm"
                  >
                    <Send className="size-3.5" />
                    <span>Publish Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Hook Inspiration Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Social Hooks & Angle Starters</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Click any angle to insert into your composer draft:
              </p>
              <div className="space-y-2">
                {[
                  "Case Study breakdown: How we cut portfolio bounce rate by 40% with micro-interactions 🧵👇",
                  "Most designers over-index on Figma files and under-index on design token documentation. Here's why:",
                  "Quick design tip: If your secondary buttons look like disabled primary buttons, your visual hierarchy is lying.",
                  "New project shipped! 🚀 Built with Next.js 16 and typography-driven layout principles.",
                ].map((hook, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertHook(hook)}
                    className="w-full text-left rounded-lg border border-border/60 bg-background/50 p-2.5 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                  >
                    &ldquo;{hook}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Bot className="size-3.5 text-emerald-400" />
                <span>AI Agent Prompting</span>
              </div>
              <p>
                You can ask your AI assistant:
                <br />
                <span className="italic text-foreground">
                  &ldquo;Schedule a tweet and LinkedIn post about our new invoice generator for tomorrow at 5 PM using Buffer MCP.&rdquo;
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Connected Channels */}
      {activeTab === "channels" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Connected social accounts managed through your Buffer workspace.
            </p>
            <a
              href="https://buffer.com/channels"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Manage on Buffer.com</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.channels.map((chan) => {
              const conf = PLATFORM_CONFIG[chan.platform]
              return (
                <div
                  key={chan.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${conf.badge}`}>
                        {conf.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          chan.connected ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            chan.connected ? "bg-emerald-500" : "bg-muted-foreground"
                          }`}
                        />
                        {chan.connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">{chan.name}</h4>
                      <p className="font-mono text-xs text-muted-foreground">{chan.handle}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>In queue: {chan.queueCount}</span>
                    <a
                      href="https://buffer.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground flex items-center gap-0.5"
                    >
                      <span>Queue</span>
                      <ArrowUpRight className="size-3" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Buffer MCP & Configuration */}
      {activeTab === "mcp" && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium">Model Context Protocol (MCP) Setup</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  The official remote Buffer MCP endpoint connects your AI pair programmer (Antigravity, Cursor, Claude) directly to your queue.
                </p>
              </div>
              <button
                type="button"
                onClick={copyMcpConfig}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
              >
                {copiedMcp ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                <span>{copiedMcp ? "Copied" : "Copy Config"}</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>mcp_config.json / .cursor/mcp.json</span>
                <span>Streamable HTTP</span>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/30 p-4 font-mono text-xs text-foreground leading-relaxed">
                {mcpConfigCode}
              </pre>
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/20 p-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Configured in this workspace:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><code className="text-foreground">mcp_config.json</code> (Root)</li>
                <li><code className="text-foreground">.cursor/mcp.json</code> (Cursor IDE)</li>
                <li><code className="text-foreground">.agents/mcp_config.json</code> (Antigravity Workspace)</li>
              </ul>
            </div>
          </div>

          {/* Environment Variables Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-medium">Buffer Access Token (Optional Direct API)</h3>
            <p className="text-xs text-muted-foreground">
              If you wish to execute server-side automated publishing from Content Studio without interactive OAuth, add your Buffer Access Token in <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">.env.local</code>:
            </p>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 font-mono text-xs text-foreground">
              BUFFER_ACCESS_TOKEN=your_token_from_buffer_developers
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`inline-block size-2 rounded-full ${
                  data.hasToken ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                Status: {data.hasToken ? "Token configured in environment" : "MCP OAuth mode active"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Ideas & Hooks Drafts */}
      {activeTab === "ideas" && (
        <div className="space-y-6">
          <form onSubmit={handleAddIdea} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Capture Quick Post Idea / Hook
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                placeholder="Topic or working headline..."
                className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
              <button
                type="submit"
                disabled={addingIdea || !newIdeaTitle.trim()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
              >
                <Plus className="size-3.5" />
                <span>Save Idea</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={newIdeaNotes}
              onChange={(e) => setNewIdeaNotes(e.target.value)}
              placeholder="Key talking points, links, or bullet notes (optional)..."
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs outline-none focus:border-foreground"
            />
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            {data.ideas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 space-y-3"
              >
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium leading-snug">{idea.title}</h4>
                  {idea.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{idea.notes}</p>
                  )}
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {idea.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPostContent(`${idea.title}\n\n${idea.notes || ""}`)
                      setActiveTab("composer")
                    }}
                    className="flex items-center gap-1 font-medium text-foreground hover:underline"
                  >
                    <Send className="size-3" />
                    <span>Send to Composer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Delete idea"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
