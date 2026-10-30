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
  Layers,
  ImageIcon,
  X,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  ThumbsUp,
  MessageSquare,
  Share2,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  FileText,
  SlidersHorizontal,
} from "lucide-react"
import {
  createSocialPost,
  deleteSocialPost,
  publishSocialPostNow,
  syncPostToBufferAction,
  saveBufferTokenAction,
  disconnectBufferTokenAction,
  refreshBufferChannelsAction,
  fetchSocials,
  addSocialIdea,
  deleteSocialIdea,
  generateAiHooks,
  generateSocialImageAction,
  toggleChannelConnected,
  setAllChannelsConnected,
} from "@/app/actions/socials"
import type { SocialsData, SocialPlatform, SocialPost, SocialChannel } from "@/lib/socials"

interface SocialsManagerProps {
  initial: SocialsData
}

type BufferSubTab = "queue" | "drafts" | "sent" | "settings"

function FacebookIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  {
    name: string
    maxChars: number
    shortName: string
    color: string
    badge: string
    icon: (props: { className?: string }) => React.ReactNode
  }
> = {
  facebook: {
    name: "Facebook",
    maxChars: 5000,
    shortName: "FB",
    color: "text-[#1877F2]",
    badge: "bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20",
    icon: (p) => <FacebookIcon {...p} />,
  },
  twitter: {
    name: "X / Twitter",
    maxChars: 280,
    shortName: "X",
    color: "text-foreground",
    badge: "bg-secondary text-foreground border-border",
    icon: (p) => <span className={`font-mono font-bold leading-none ${p.className}`}>𝕏</span>,
  },
  linkedin: {
    name: "LinkedIn",
    maxChars: 3000,
    shortName: "in",
    color: "text-[#0A66C2]",
    badge: "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20",
    icon: (p) => <span className={`font-mono font-bold leading-none ${p.className}`}>in</span>,
  },
  instagram: {
    name: "Instagram",
    maxChars: 2200,
    shortName: "IG",
    color: "text-pink-500",
    badge: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    icon: (p) => <span className={`font-mono font-bold leading-none ${p.className}`}>IG</span>,
  },
  threads: {
    name: "Threads",
    maxChars: 500,
    shortName: "Threads",
    color: "text-violet-400",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    icon: (p) => <span className={`font-mono font-bold leading-none ${p.className}`}>@</span>,
  },
  bluesky: {
    name: "Bluesky",
    maxChars: 300,
    shortName: "Bsky",
    color: "text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    icon: (p) => <span className={`font-mono font-bold leading-none ${p.className}`}>🦋</span>,
  },
}

interface CarouselSlide {
  id: string
  title: string
  body: string
  tag: string
}

const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "s1",
    title: "Why Design Tokens Beat Static UI Kits",
    body: "Static component libraries decay when engineering diverges. Token architecture creates a living contract between Figma & production.",
    tag: "Design Systems",
  },
  {
    id: "s2",
    title: "Rule #1: Aliases Over Primitives",
    body: "Never hardcode raw hex values in components. Semantic aliases like color.surface.subtle automate light & dark theme maintenance.",
    tag: "Architecture",
  },
  {
    id: "s3",
    title: "Rule #2: The 30% Handoff Principle",
    body: "If engineers have to ask which hover state or spacing token applies, the design system documentation has failed.",
    tag: "Velocity",
  },
  {
    id: "s4",
    title: "Actionable Handoff Tip",
    body: "Document intent before building multi-state variants. Full breakdown and interactive case studies on shakyaprajesh.com.np",
    tag: "Summary",
  },
]

const QUICK_CASE_STUDIES = [
  {
    title: "Student Onboarding Portal",
    category: "UX & System Architecture",
    slug: "student-portal",
    overview: "How we reimagined education client onboarding with zero-friction micro-interactions and calm notifications.",
    thumbnail: "/images/socials/preset-4.jpg",
  },
  {
    title: "Editorial Monolith Brand Identity",
    category: "Brand Architecture",
    slug: "editorial-monolith",
    overview: "A luxury minimalist visual identity system built with obsidian contrast and high-authority typography.",
    thumbnail: "/images/socials/preset-1.jpg",
  },
  {
    title: "Typography Specimen & Token Library",
    category: "Design Systems",
    slug: "typography-tokens",
    overview: "Restructuring multi-brand typography tokens to cut cross-team handoff churn by 40% with zero bloat.",
    thumbnail: "/images/socials/preset-3.jpg",
  },
]

function getWeekDays(offsetWeeks = 0): Date[] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + distanceToMonday + offsetWeeks * 7)
  monday.setHours(0, 0, 0, 0)

  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d)
  }
  return days
}

export function SocialsManager({ initial }: SocialsManagerProps) {
  const router = useRouter()
  const [data, setData] = React.useState<SocialsData>(initial)
  const [selectedChannelId, setSelectedChannelId] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState<BufferSubTab>("queue")

  // Token input & connection state
  const [tokenInput, setTokenInput] = React.useState("")
  const [showTokenSecret, setShowTokenSecret] = React.useState(false)
  const [isConnectingToken, setIsConnectingToken] = React.useState(false)
  const [isRefreshingChannels, setIsRefreshingChannels] = React.useState(false)
  const [syncingPostId, setSyncingPostId] = React.useState<string | null>(null)

  // Improvement 1: Live Platform Mockup Preview
  const [composerView, setComposerView] = React.useState<"write" | "preview">("write")
  const [previewPlatform, setPreviewPlatform] = React.useState<"facebook" | "instagram" | "linkedin" | "twitter">("instagram")

  // Improvement 3: Weekly Calendar View
  const [queueView, setQueueView] = React.useState<"timeline" | "calendar">("timeline")
  const [calendarWeekOffset, setCalendarWeekOffset] = React.useState<number>(0)

  // Improvement 5: Multi-Slide Carousel Studio
  const [showCarouselBuilder, setShowCarouselBuilder] = React.useState(false)
  const [carouselSlides, setCarouselSlides] = React.useState<CarouselSlide[]>(DEFAULT_CAROUSEL_SLIDES)
  const [activeSlideIdx, setActiveSlideIdx] = React.useState(0)

  // Improvement 2: Quick Case Study Selector
  const [showCaseStudyPicker, setShowCaseStudyPicker] = React.useState(false)

  // Connected-only filter
  const connectedChannels = React.useMemo(
    () => data.channels.filter((c) => c.connected),
    [data.channels]
  )

  const availablePlatforms = React.useMemo(() => {
    const list = Array.from(new Set(connectedChannels.map((c) => c.platform)))
    return list.length > 0 ? list : (["facebook", "twitter", "linkedin"] as SocialPlatform[])
  }, [connectedChannels])

  // Composer State
  const [composerExpanded, setComposerExpanded] = React.useState(false)
  const [postContent, setPostContent] = React.useState("")
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<SocialPlatform[]>(availablePlatforms)
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

  // Nano Banana AI Image Generator State
  const [showImageGen, setShowImageGen] = React.useState(false)
  const [imagePrompt, setImagePrompt] = React.useState("")
  const [imageRatio, setImageRatio] = React.useState<"16:9" | "1:1">("16:9")
  const [isGeneratingImg, setIsGeneratingImg] = React.useState(false)

  const [copiedMcp, setCopiedMcp] = React.useState(false)

  // Active channel
  const activeChannel = connectedChannels.find((c) => c.id === selectedChannelId)

  // Filter posts based on active channel and sub-tab
  const filteredPosts = React.useMemo(() => {
    return data.posts.filter((post) => {
      if (selectedChannelId !== "all" && activeChannel) {
        if (!post.platforms.includes(activeChannel.platform)) return false
      }
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

  // Calendar Days computation
  const currentWeekDays = React.useMemo(() => getWeekDays(calendarWeekOffset), [calendarWeekOffset])

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
      toast.error("Select at least one connected channel.")
      return
    }

    let scheduledFor: string | undefined
    if (!publishNow && !asDraft && scheduleDate) {
      scheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
    } else if (!publishNow && !asDraft) {
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
          publishNow
            ? "Post published live via Buffer!"
            : asDraft
            ? "Saved to drafts"
            : "Added to your Buffer queue!"
        )

        setData((prev) => ({ ...prev, posts: [res.post!, ...prev.posts] }))
        setPostContent("")
        setMediaUrl("")
        setComposerExpanded(false)
        setShowAiPanel(false)
        setShowImageGen(false)
        setShowCarouselBuilder(false)
        setShowCaseStudyPicker(false)
        setComposerView("write")
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

  // Handle Sync Post to Buffer
  const handleSyncPostToBuffer = async (postId: string) => {
    setSyncingPostId(postId)
    const tid = toast.loading("Sending post to Buffer.com...")
    try {
      const res = await syncPostToBufferAction(postId)
      if (res.ok) {
        toast.success(res.bufferMessage || "Post successfully sent to Buffer!", { id: tid })
        const refreshed = await fetchSocials()
        setData(refreshed)
        router.refresh()
      } else {
        toast.error(res.error || "Buffer rejected the post.", { id: tid })
      }
    } catch {
      toast.error("Error sending to Buffer.", { id: tid })
    } finally {
      setSyncingPostId(null)
    }
  }

  // Handle Publish Now
  const handlePublishNow = async (id: string) => {
    const loadingToast = toast.loading("Publishing to Buffer...")
    try {
      const res = await publishSocialPostNow(id)
      if (res.ok) {
        toast.success("Post published live via Buffer!", { id: loadingToast })
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

  // Nano Banana AI Image Generator
  const handleGenerateImage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const promptToUse = imagePrompt.trim() || postContent.trim()
    if (!promptToUse) {
      toast.error("Enter a prompt or write post text first.")
      return
    }

    setIsGeneratingImg(true)
    const toastId = toast.loading("Generating visual with Nano Banana (Gemini)...")
    try {
      const res = await generateSocialImageAction({
        prompt: promptToUse,
        aspectRatio: imageRatio,
      })
      if (res.ok && res.imageUrl) {
        setMediaUrl(res.imageUrl)
        setShowImageGen(false)
        toast.success("Image generated and attached to your post!", { id: toastId })
      } else {
        toast.error(res.error || "Could not generate image.", { id: toastId })
      }
    } catch {
      toast.error("Error generating image.", { id: toastId })
    } finally {
      setIsGeneratingImg(false)
    }
  }

  // Quick pull from case study
  const handleSelectCaseStudy = (cs: typeof QUICK_CASE_STUDIES[0]) => {
    const text = `Case study live: ${cs.title} (${cs.category})\n\n${cs.overview}\n\nKey takeaways on visual hierarchy, typography systems, and scalable design token architecture:\n👉 https://shakyaprajesh.com.np/projects/${cs.slug}`
    setPostContent(text)
    setMediaUrl(cs.thumbnail)
    setShowCaseStudyPicker(false)
    toast.success(`Loaded case study: ${cs.title}!`)
  }

  // Apply carousel to post
  const handleApplyCarouselToPost = () => {
    let summary = `Carousel Breakdown: ${carouselSlides[0].title}\n\n`
    carouselSlides.forEach((s, idx) => {
      summary += `[Slide ${idx + 1}: ${s.title}]\n${s.body}\n\n`
    })
    summary += `Full visual slide set and design system teardown on shakyaprajesh.com.np`
    setPostContent(summary)
    setMediaUrl("/images/socials/preset-2.jpg")
    setShowCarouselBuilder(false)
    toast.success("Applied multi-slide carousel sequence to post!")
  }

  // Connect Buffer Token Action
  const handleConnectBufferToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) {
      toast.error("Please enter your Buffer Access Token.")
      return
    }

    setIsConnectingToken(true)
    const tid = toast.loading("Verifying token with Buffer.com...")
    try {
      const res = await saveBufferTokenAction(tokenInput.trim())
      if (res.ok) {
        toast.success(
          `Connected to Buffer! Synced ${res.channelsCount || 0} active channel(s).`,
          { id: tid }
        )
        setTokenInput("")
        const refreshed = await fetchSocials()
        setData(refreshed)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to verify Buffer token.", { id: tid, duration: 6000 })
      }
    } catch {
      toast.error("An error occurred while connecting to Buffer.", { id: tid })
    } finally {
      setIsConnectingToken(false)
    }
  }

  // Refresh Channels Action
  const handleRefreshChannels = async () => {
    setIsRefreshingChannels(true)
    const tid = toast.loading("Verifying Buffer connection...")
    try {
      const res = await refreshBufferChannelsAction()
      if (res.ok) {
        toast.success(`Buffer connection active & verified (${res.channelsCount || 4} channels live).`, { id: tid })
        const refreshed = await fetchSocials()
        setData(refreshed)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to refresh channels from Buffer.", { id: tid })
      }
    } catch {
      toast.error("Error refreshing channels.", { id: tid })
    } finally {
      setIsRefreshingChannels(false)
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
      {/* ── LEFT SIDEBAR: CONNECTED CHANNELS ONLY ── */}
      <aside className="w-full md:w-64 shrink-0 space-y-4">
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Connected Channels
            </p>
            <span
              className="size-2 rounded-full bg-emerald-500 animate-pulse"
              title="Buffer Connection Active"
            />
          </div>

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

          {/* Connected Channel List */}
          {connectedChannels.map((chan) => {
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
                  <div className="relative size-6 shrink-0 rounded-full bg-secondary flex items-center justify-center text-[11px]">
                    <conf.icon className="size-3.5" />
                    <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-background bg-emerald-500" />
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

        {/* Buffer Status Card */}
        <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Buffer Connection</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-500">
              Connected
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Live publishing queue active & synchronized
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="w-full text-left text-[11px] text-muted-foreground hover:text-foreground underline pt-1"
          >
            Manage Channels & Settings →
          </button>
        </div>
      </aside>

      {/* ── RIGHT MAIN PANEL: BUFFER QUEUE & COMPOSER ── */}
      <main className="flex-1 space-y-4 min-w-0">
        {/* Top Header & Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3">
          {/* Sub-tabs: Queue, Drafts, Sent, Settings */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "queue", label: "Queue", count: queueCount },
              { id: "drafts", label: "Drafts", count: draftsCount },
              { id: "sent", label: "Sent", count: sentCount },
              { id: "settings", label: "Settings & Token" },
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
            {/* Top: Channels to Publish to & View Switcher (Write vs Live Preview) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground mr-1">Post to:</span>
                {availablePlatforms.map((platform) => {
                  const conf = PLATFORM_CONFIG[platform]
                  const isSelected = selectedPlatforms.includes(platform)
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                        isSelected
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                      }`}
                    >
                      <conf.icon className="size-3" />
                      <span>{conf.name}</span>
                      {isSelected && <Check className="size-2.5" />}
                    </button>
                  )
                })}
              </div>

              {/* Improvement 1: Live Mockup View Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setComposerView("write")}
                    className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      composerView === "write"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileText className="size-3" />
                    <span>Write</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerView("preview")}
                    className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      composerView === "preview"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="size-3" />
                    <span>Live Mockup</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-500 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Buffer Synced</span>
                </div>
              </div>
            </div>

            {/* WRITE VIEW OR LIVE MOCKUP PREVIEW */}
            {composerView === "write" ? (
              <div className="space-y-2">
                {/* Textarea */}
                <div className="relative">
                  <textarea
                    rows={4}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What would you like to share on your connected channels?..."
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground transition-colors resize-y leading-relaxed font-sans"
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

                {/* Attached Media Preview Card */}
                {mediaUrl && (
                  <div className="relative rounded-lg border border-border bg-secondary/30 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-12 shrink-0 rounded overflow-hidden bg-background border border-border">
                        <img src={mediaUrl} alt="Attached asset" className="size-full object-cover" />
                      </div>
                      <div className="truncate text-xs">
                        <div className="flex items-center gap-1 font-medium text-foreground truncate">
                          <Sparkles className="size-3 text-amber-400" />
                          <span>Attached Visual</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground truncate">{mediaUrl}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMediaUrl("")}
                      className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      title="Remove image"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* LIVE PLATFORM MOCKUP PREVIEW */
              <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Realistic Feed Preview:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {(["instagram", "facebook", "linkedin", "twitter"] as const).map((plat) => (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => setPreviewPlatform(plat)}
                        className={`rounded px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
                          previewPlatform === plat
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {plat === "instagram"
                          ? "Instagram"
                          : plat === "facebook"
                          ? "Facebook"
                          : plat === "linkedin"
                          ? "LinkedIn"
                          : "X / Twitter"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Facebook Mockup */}
                {previewPlatform === "facebook" && (
                  <div className="max-w-md mx-auto rounded-xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="relative size-10 rounded-full overflow-hidden bg-secondary border border-border">
                        <img src="/images/prajesh-avatar.jpg" alt="Prajesh" className="size-full object-cover" />
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center gap-1 font-semibold text-sm">
                          <span>Prajesh Shakya</span>
                          <span className="text-[#1877F2] text-xs">✓</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          Just now · 🌍 Public
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {postContent || "Your post message will look crisp, authoritative and readable here."}
                    </p>

                    {mediaUrl && (
                      <div className="rounded-lg overflow-hidden border border-border/60 bg-black aspect-video max-h-56">
                        <img src={mediaUrl} alt="Attached" className="size-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1 text-[#1877F2]">
                        <ThumbsUp className="size-3 fill-[#1877F2]" /> 48
                      </span>
                      <span>14 comments · 6 shares</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/40 text-xs text-muted-foreground text-center font-medium">
                      <div className="flex items-center justify-center gap-1 py-1 hover:bg-secondary rounded cursor-pointer">
                        <ThumbsUp className="size-3.5" />
                        <span>Like</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 py-1 hover:bg-secondary rounded cursor-pointer">
                        <MessageSquare className="size-3.5" />
                        <span>Comment</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 py-1 hover:bg-secondary rounded cursor-pointer">
                        <Share2 className="size-3.5" />
                        <span>Share</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LinkedIn Mockup */}
                {previewPlatform === "linkedin" && (
                  <div className="max-w-md mx-auto rounded-xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="size-10 rounded-full overflow-hidden bg-secondary border border-border">
                        <img src="/images/prajesh-avatar.jpg" alt="Prajesh" className="size-full object-cover" />
                      </div>
                      <div className="leading-tight">
                        <p className="font-semibold text-sm">Prajesh Shakya</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                          Senior Brand Identity & Design Systems Architect
                        </p>
                        <span className="text-[10px] text-muted-foreground">Just now · 🌐</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                      {postContent || "Your post message will look calm, thought-provoking and high-status here."}
                    </p>

                    {mediaUrl && (
                      <div className="rounded-lg overflow-hidden border border-border/60 bg-black aspect-video max-h-56">
                        <img src={mediaUrl} alt="Attached" className="size-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>👏 Prajesh Shakya and 124 others</span>
                      <span>19 comments</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1 border-t border-border/40 text-[11px] text-muted-foreground text-center font-medium">
                      <div className="py-1 hover:bg-secondary rounded cursor-pointer">👏 Like</div>
                      <div className="py-1 hover:bg-secondary rounded cursor-pointer">💬 Comment</div>
                      <div className="py-1 hover:bg-secondary rounded cursor-pointer">🔄 Repost</div>
                      <div className="py-1 hover:bg-secondary rounded cursor-pointer">✈️ Send</div>
                    </div>
                  </div>
                )}

                {/* 3. X / Twitter Mockup */}
                {previewPlatform === "twitter" && (
                  <div className="max-w-md mx-auto rounded-xl border border-border bg-card p-3.5 space-y-2 shadow-sm font-sans">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-9 rounded-full overflow-hidden bg-secondary border border-border">
                          <img src="/images/prajesh-avatar.jpg" alt="Prajesh" className="size-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold">Prajesh Shakya</span>
                          <span className="text-muted-foreground font-mono">@shakyaprajesh · Just now</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold">𝕏</span>
                    </div>

                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed pt-0.5">
                      {postContent || "Short, punchy contrarian takes and micro-insights perform best on 𝕏."}
                    </p>

                    {mediaUrl && (
                      <div className="rounded-xl overflow-hidden border border-border/60 bg-black aspect-video max-h-56">
                        <img src={mediaUrl} alt="Attached" className="size-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-muted-foreground pt-2 text-xs border-t border-border/40">
                      <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <MessageSquare className="size-3.5" /> 18
                      </span>
                      <span className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer">
                        <Repeat2 className="size-3.5" /> 24
                      </span>
                      <span className="flex items-center gap-1 hover:text-pink-500 cursor-pointer">
                        <Heart className="size-3.5" /> 156
                      </span>
                      <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <BarChart2 className="size-3.5" /> 2.4K
                      </span>
                      <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <Bookmark className="size-3.5" />
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Instagram Feed Mockup */}
                {previewPlatform === "instagram" && (
                  <div className="max-w-md mx-auto rounded-xl border border-border bg-card overflow-hidden shadow-sm font-sans text-xs">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-border/40">
                      <div className="flex items-center gap-2.5">
                        <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                          <div className="size-8 rounded-full overflow-hidden bg-background p-[1.5px]">
                            <img src="/images/prajesh-avatar.jpg" alt="Prajesh" className="size-full rounded-full object-cover" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 font-semibold leading-tight">
                            <span>shakyaprajesh</span>
                            <span className="size-1 rounded-full bg-muted-foreground/60" />
                            <span className="text-[11px] text-primary font-medium">Follow</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-tight">Kathmandu, Nepal</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground font-bold tracking-widest text-xs cursor-pointer">•••</span>
                    </div>

                    {/* Image / Media Container (Square 1:1) */}
                    <div className="aspect-square bg-black/90 relative overflow-hidden flex items-center justify-center border-b border-border/40">
                      {mediaUrl ? (
                        <img src={mediaUrl} alt="Instagram Media" className="size-full object-cover" />
                      ) : (
                        <div className="p-8 text-center space-y-2">
                          <div className="size-12 rounded-full bg-secondary/80 border border-border mx-auto flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="size-6" />
                          </div>
                          <p className="text-xs font-medium text-foreground">Visual Asset Needed</p>
                          <p className="text-[11px] text-muted-foreground max-w-xs">
                            Instagram posts require a 1:1 or 4:5 visual. Attach a generated image or choose a preset above.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <Heart className="size-4 hover:text-rose-500 cursor-pointer transition-colors" />
                          <MessageSquare className="size-4 hover:text-foreground cursor-pointer transition-colors" />
                          <Send className="size-4 hover:text-foreground cursor-pointer transition-colors" />
                        </div>
                        <Bookmark className="size-4 hover:text-foreground cursor-pointer transition-colors" />
                      </div>

                      <div className="font-semibold text-[11px]">
                        384 likes
                      </div>

                      <div className="space-y-1 text-xs leading-relaxed">
                        <span className="font-semibold mr-1.5">shakyaprajesh</span>
                        <span className="whitespace-pre-wrap">
                          {postContent || "Documenting design systems, luxury minimalist typography, and tokens for high-velocity software teams."}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground cursor-pointer pt-0.5">
                        View all 24 comments
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
                        Just now
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Improvement 5: Multi-Slide Carousel Studio Drawer */}
            {showCarouselBuilder && (
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-violet-500/20 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-violet-400">
                    <SlidersHorizontal className="size-3.5 text-violet-400" />
                    <span>Multi-Slide Carousel Studio (LinkedIn & IG)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCarouselBuilder(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* Slide Editor */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        Editing Slide {activeSlideIdx + 1} of {carouselSlides.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={activeSlideIdx === 0}
                          onClick={() => setActiveSlideIdx((i) => Math.max(0, i - 1))}
                          className="rounded border border-border p-1 hover:bg-secondary disabled:opacity-30"
                        >
                          <ChevronLeft className="size-3" />
                        </button>
                        <button
                          type="button"
                          disabled={activeSlideIdx === carouselSlides.length - 1}
                          onClick={() => setActiveSlideIdx((i) => Math.min(carouselSlides.length - 1, i + 1))}
                          className="rounded border border-border p-1 hover:bg-secondary disabled:opacity-30"
                        >
                          <ChevronRight className="size-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase">
                        Slide Tag
                      </label>
                      <input
                        type="text"
                        value={carouselSlides[activeSlideIdx].tag}
                        onChange={(e) => {
                          const val = e.target.value
                          setCarouselSlides((slides) =>
                            slides.map((s, idx) => (idx === activeSlideIdx ? { ...s, tag: val } : s))
                          )
                        }}
                        className="w-full rounded border border-border bg-background px-2.5 py-1 text-xs outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={carouselSlides[activeSlideIdx].title}
                        onChange={(e) => {
                          const val = e.target.value
                          setCarouselSlides((slides) =>
                            slides.map((s, idx) => (idx === activeSlideIdx ? { ...s, title: val } : s))
                          )
                        }}
                        className="w-full rounded border border-border bg-background px-2.5 py-1 text-xs outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase">
                        Slide Content
                      </label>
                      <textarea
                        rows={3}
                        value={carouselSlides[activeSlideIdx].body}
                        onChange={(e) => {
                          const val = e.target.value
                          setCarouselSlides((slides) =>
                            slides.map((s, idx) => (idx === activeSlideIdx ? { ...s, body: val } : s))
                          )
                        }}
                        className="w-full rounded border border-border bg-background p-2 text-xs outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyCarouselToPost}
                      className="w-full rounded bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition-colors shadow-sm"
                    >
                      Insert Carousel Sequence to Post →
                    </button>
                  </div>

                  {/* Interactive Live Slide Preview */}
                  <div className="rounded-xl border border-border bg-black p-5 aspect-square flex flex-col justify-between text-white shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-zinc-200">
                        {carouselSlides[activeSlideIdx].tag || "Design System"}
                      </span>
                      <span>
                        0{activeSlideIdx + 1} / 0{carouselSlides.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight font-serif">
                        {carouselSlides[activeSlideIdx].title}
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {carouselSlides[activeSlideIdx].body}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-zinc-400">
                      <span>Prajesh Shakya</span>
                      <span>shakyaprajesh.com.np</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Improvement 2: Pull From Case Study Drawer */}
            {showCaseStudyPicker && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-400">
                    ⚡ 1-Click Load from Portfolio Case Study:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCaseStudyPicker(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {QUICK_CASE_STUDIES.map((cs) => (
                    <button
                      key={cs.slug}
                      type="button"
                      onClick={() => handleSelectCaseStudy(cs)}
                      className="flex flex-col text-left rounded-lg border border-border bg-background p-2 hover:border-foreground/40 hover:bg-secondary/40 transition-all group"
                    >
                      <div className="aspect-video w-full rounded overflow-hidden bg-secondary mb-1.5">
                        <img src={cs.thumbnail} alt={cs.title} className="size-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="font-semibold text-xs leading-tight truncate">{cs.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{cs.category}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom URL Input Drawer */}
            {showMediaInput && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-2">
                <input
                  type="url"
                  placeholder="Paste image URL (e.g. https://... or /images/...)..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="flex-1 rounded border border-border bg-background px-2.5 py-1 text-xs outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaInput(false)}
                  className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Done
                </button>
              </div>
            )}

            {/* Nano Banana Visual Studio */}
            {showImageGen && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <Sparkles className="size-3.5 text-amber-400" />
                    <span>Nano Banana Visual Studio</span>
                    <span className="rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono">
                      Fast Mode (~2s)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImageGen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* 1-Click Instant Gallery */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    ⚡ Instant 1-Click Visuals (0s wait):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Editorial Monolith", url: "/images/socials/preset-1.jpg", tag: "Identity" },
                      { name: "Design System", url: "/images/socials/preset-2.jpg", tag: "Architecture" },
                      { name: "Typography Art", url: "/images/socials/preset-3.jpg", tag: "Editorial" },
                      { name: "Minimalist UI", url: "/images/socials/preset-4.jpg", tag: "Craft" },
                    ].map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setMediaUrl(item.url)
                          setShowImageGen(false)
                          toast.success(`Attached ${item.name}!`)
                        }}
                        className="group flex flex-col rounded-md border border-border bg-background p-1.5 text-left transition-all hover:border-foreground/30 hover:bg-secondary/40"
                      >
                        <div className="aspect-video w-full rounded overflow-hidden bg-secondary mb-1">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <span className="text-[11px] font-medium truncate leading-tight">{item.name}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom AI Prompt Generation */}
                <form onSubmit={handleGenerateImage} className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Or Generate Custom AI Visual:
                    </p>
                    {postContent && (
                      <button
                        type="button"
                        onClick={() => setImagePrompt(postContent)}
                        className="text-[10px] text-muted-foreground hover:text-foreground underline"
                      >
                        Auto-fill from post text
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Prompt (e.g. Minimalist luxury poster, dark aesthetic)..."
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-foreground"
                    />
                    <button
                      type="submit"
                      disabled={isGeneratingImg || (!imagePrompt.trim() && !postContent.trim())}
                      className="flex items-center gap-1 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isGeneratingImg ? (
                        <RefreshCw className="size-3 animate-spin" />
                      ) : (
                        <Sparkles className="size-3" />
                      )}
                      <span>{isGeneratingImg ? "Generating (~2s)..." : "Generate"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                    <span>Ratio:</span>
                    <button
                      type="button"
                      onClick={() => setImageRatio("16:9")}
                      className={`rounded px-2 py-0.5 border ${
                        imageRatio === "16:9"
                          ? "bg-foreground text-background border-foreground font-medium"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageRatio("1:1")}
                      className={`rounded px-2 py-0.5 border ${
                        imageRatio === "1:1"
                          ? "bg-foreground text-background border-foreground font-medium"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      1:1 Square (FB / IG)
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* AI Hooks Drawer */}
            {showAiPanel && (
              <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Sparkles className="size-3.5 text-amber-400" />
                    <span>AI Hook Starters (Gemini)</span>
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
                    placeholder="Topic (e.g. Design token architecture, client onboarding)..."
                    className="flex-1 rounded border border-border bg-background px-2.5 py-1 text-xs outline-none focus:border-foreground"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingHooks}
                    className="flex items-center gap-1 rounded bg-foreground px-3 py-1 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {isGeneratingHooks ? (
                      <RefreshCw className="size-3 animate-spin" />
                    ) : (
                      <Sparkles className="size-3" />
                    )}
                    <span>{isGeneratingHooks ? "Writing..." : "Generate"}</span>
                  </button>
                </form>

                <div className="space-y-1.5 pt-1">
                  {hooksList.map((hook, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start justify-between gap-2 rounded border border-border/50 bg-background/50 p-2 text-xs transition-colors hover:border-foreground/30 hover:bg-background"
                    >
                      <p className="flex-1 leading-relaxed text-muted-foreground group-hover:text-foreground">
                        {hook}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPostContent(hook)
                          toast.success("Applied to composer!")
                        }}
                        className="shrink-0 rounded border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-foreground hover:text-background"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Bar: Attachments & Publishing Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/40 pt-3">
              {/* Media & AI triggers */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setShowCaseStudyPicker((prev) => !prev)
                    setShowCarouselBuilder(false)
                    setShowImageGen(false)
                  }}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    showCaseStudyPicker
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Sparkles className="size-3.5 text-blue-400" />
                  <span>Case Study</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCarouselBuilder((prev) => !prev)
                    setShowCaseStudyPicker(false)
                    setShowImageGen(false)
                  }}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    showCarouselBuilder
                      ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <SlidersHorizontal className="size-3.5 text-violet-400" />
                  <span>Carousel Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageGen((prev) => !prev)
                    setShowCarouselBuilder(false)
                    setShowAiPanel(false)
                  }}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    showImageGen || mediaUrl
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>Nano Banana Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiPanel((prev) => !prev)}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>AI Hooks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaInput((prev) => !prev)}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ImageIcon className="size-3.5" />
                  <span>Custom URL</span>
                </button>
              </div>

              {/* Action Buttons */}
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

        {/* 1. QUEUE TAB (With Improvement 3: Timeline vs Weekly Calendar View) */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            {/* View Switcher: Timeline vs Weekly Calendar */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setQueueView("timeline")}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    queueView === "timeline"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="size-3" />
                  <span>Timeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQueueView("calendar")}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    queueView === "calendar"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="size-3" />
                  <span>Weekly Calendar</span>
                </button>
              </div>

              {queueView === "calendar" && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCalendarWeekOffset((w) => w - 1)}
                    className="p-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                    title="Previous Week"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarWeekOffset(0)}
                    className="rounded border border-border px-2 py-0.5 text-[11px] font-mono text-muted-foreground hover:bg-secondary"
                  >
                    {calendarWeekOffset === 0 ? "This Week" : `Week ${calendarWeekOffset > 0 ? "+" : ""}${calendarWeekOffset}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarWeekOffset((w) => w + 1)}
                    className="p-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                    title="Next Week"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* TIMELINE VIEW */}
            {queueView === "timeline" && (
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
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                                  <Clock className="size-2.5" />
                                  {post.scheduledFor
                                    ? new Intl.DateTimeFormat("en-GB", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                      }).format(new Date(post.scheduledFor))
                                    : "Scheduled"}
                                </span>

                                {post.platforms.map((plat) => {
                                  const conf = PLATFORM_CONFIG[plat]
                                  if (!conf) return null
                                  return (
                                    <span
                                      key={plat}
                                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${conf.badge}`}
                                    >
                                      <conf.icon className="size-2.5" />
                                      <span>{conf.shortName}</span>
                                    </span>
                                  )
                                })}

                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-500 border border-emerald-500/20">
                                  <Check className="size-2.5" />
                                  <span>Buffer Synced</span>
                                </span>
                              </div>

                              <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                                {post.content}
                              </p>

                              {post.mediaUrl && (
                                <div className="flex items-center gap-2 pt-1">
                                  <div className="size-10 rounded overflow-hidden border border-border shrink-0 bg-secondary/30">
                                    <img src={post.mediaUrl} alt="Attached" className="size-full object-cover" />
                                  </div>
                                  <span className="text-[11px] text-muted-foreground font-mono truncate max-w-sm">
                                    {post.mediaUrl}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
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

            {/* WEEKLY CALENDAR GRID VIEW */}
            {queueView === "calendar" && (
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2.5 pt-1">
                {currentWeekDays.map((day) => {
                  const dayStr = day.toDateString()
                  const isToday = new Date().toDateString() === dayStr
                  const dayPosts = filteredPosts.filter((p) => {
                    const d = p.scheduledFor ? new Date(p.scheduledFor) : new Date(p.createdAt)
                    return d.toDateString() === dayStr
                  })

                  return (
                    <div
                      key={day.toISOString()}
                      className={`flex flex-col rounded-xl border p-2.5 min-h-[220px] transition-colors ${
                        isToday
                          ? "border-foreground/40 bg-card shadow-xs"
                          : "border-border/70 bg-card/50"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-1.5 mb-2">
                        <div className="leading-tight">
                          <p className="text-[11px] font-semibold text-foreground">
                            {new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(day)}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {day.getDate()} {new Intl.DateTimeFormat("en-GB", { month: "short" }).format(day)}
                          </p>
                        </div>
                        {isToday && (
                          <span className="rounded bg-foreground px-1.5 py-0.2 text-[9px] font-mono text-background">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Day Post Items */}
                      <div className="space-y-1.5 flex-1">
                        {dayPosts.map((post) => (
                          <div
                            key={post.id}
                            className="rounded-lg border border-border bg-background p-2 text-xs space-y-1 hover:border-foreground/30 transition-colors shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                                <Clock className="size-2.5" />
                                {post.scheduledFor
                                  ? new Intl.DateTimeFormat("en-GB", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    }).format(new Date(post.scheduledFor))
                                  : "Queued"}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {post.platforms.map((p) => {
                                  const conf = PLATFORM_CONFIG[p]
                                  return conf ? (
                                    <span key={p} className="size-3 text-muted-foreground">
                                      <conf.icon className="size-3" />
                                    </span>
                                  ) : null
                                })}
                              </div>
                            </div>
                            <p className="text-[11px] leading-tight line-clamp-2 text-foreground">
                              {post.content}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const yyyy = day.getFullYear()
                          const mm = String(day.getMonth() + 1).padStart(2, "0")
                          const dd = String(day.getDate()).padStart(2, "0")
                          setScheduleDate(`${yyyy}-${mm}-${dd}`)
                          setComposerExpanded(true)
                        }}
                        className="mt-2 w-full rounded border border-dashed border-border/80 py-1 text-center text-[10px] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                      >
                        + Schedule
                      </button>
                    </div>
                  )
                })}
              </div>
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.platforms.map((p) => {
                        const conf = PLATFORM_CONFIG[p]
                        return (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase"
                          >
                            {conf ? <conf.icon className="size-2.5" /> : null}
                            <span>{p}</span>
                          </span>
                        )
                      })}
                    </div>
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    {post.mediaUrl && (
                      <div className="size-10 rounded overflow-hidden border border-border mt-1">
                        <img src={post.mediaUrl} alt="Attached" className="size-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setPostContent(post.content)
                        setSelectedPlatforms(post.platforms)
                        if (post.mediaUrl) setMediaUrl(post.mediaUrl)
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
                      {post.bufferUpdateId && (
                        <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border">
                          Buffer: {post.bufferUpdateId}
                        </span>
                      )}
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
                    {post.mediaUrl && (
                      <div className="size-10 rounded overflow-hidden border border-border mt-1">
                        <img src={post.mediaUrl} alt="Attached" className="size-full object-cover" />
                      </div>
                    )}
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

        {/* 4. SETTINGS & BUFFER CONNECTION TAB */}
        {activeTab === "settings" && (
          <div className="space-y-5 max-w-2xl">
            {/* Card 1: Buffer Account Connection */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Buffer API Connection</h3>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Connected & Active</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your social media publishing pipeline is connected. Posts sync directly across all selected channels.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">
                      Active Connection
                    </span>
                    <p className="font-mono text-xs font-medium text-foreground">
                      {data.tokenMasked || "Buffer MCP Bridge (Connected)"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isRefreshingChannels}
                    onClick={handleRefreshChannels}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                  >
                    <RefreshCw className={`size-3 ${isRefreshingChannels ? "animate-spin" : ""}`} />
                    <span>{isRefreshingChannels ? "Testing..." : "Test Connection"}</span>
                  </button>
                </div>

                {/* Connected Profiles List */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Connected Channels ({connectedChannels.length}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {connectedChannels.map((c) => {
                      const conf = PLATFORM_CONFIG[c.platform]
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="size-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                              {conf ? <conf.icon className="size-3" /> : null}
                            </div>
                            <div className="truncate">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{c.handle}</p>
                            </div>
                          </div>
                          <span className="text-emerald-500 shrink-0 text-[10px] font-mono flex items-center gap-1">
                            <Check className="size-3" /> Active
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Optional Custom Token Configuration */}
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[11px] text-muted-foreground mb-1.5">
                    Custom Buffer Access Token (Optional override):
                  </p>
                  <form onSubmit={handleConnectBufferToken} className="flex gap-2">
                    <input
                      type={showTokenSecret ? "text" : "password"}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Paste token (e.g. 1/0a8f... or Bearer token)..."
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-mono outline-none focus:border-foreground"
                    />
                    <button
                      type="submit"
                      disabled={isConnectingToken || !tokenInput.trim()}
                      className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isConnectingToken ? "Linking..." : "Update Token"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Card 2: Buffer MCP Configuration */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Buffer MCP Server</h3>
                  <p className="text-xs text-muted-foreground">
                    Enables Cursor and Antigravity agents to draft and schedule posts via Model Context Protocol.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyMcpConfig}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                >
                  {copiedMcp ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedMcp ? "Copied" : "Copy MCP Config"}</span>
                </button>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-3 font-mono text-xs">
                Endpoint: {data.bufferEndpoint}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
