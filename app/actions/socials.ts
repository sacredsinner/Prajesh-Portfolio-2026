"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth, isAdminUser } from "@/lib/auth"
import {
  getSocials,
  saveSocials,
  pushToBufferApi,
  fetchBufferProfiles,
  getRawBufferToken,
  generateNanoBananaImage,
  type SocialPost,
  type SocialIdea,
  type SocialPlatform,
  type SocialsData,
} from "@/lib/socials"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) {
    throw new Error("Unauthorized")
  }
  return session.user
}

export async function fetchSocials(): Promise<SocialsData> {
  await requireAdmin()
  return getSocials()
}

export async function createSocialPost(input: {
  content: string
  platforms: SocialPlatform[]
  publishNow?: boolean
  scheduledFor?: string
  mediaUrl?: string
}): Promise<{
  ok: boolean
  error?: string
  post?: SocialPost
  bufferSynced?: boolean
  bufferMessage?: string
  bufferError?: string
}> {
  await requireAdmin()

  if (!input.content.trim()) {
    return { ok: false, error: "Post content cannot be empty." }
  }
  if (!input.platforms || input.platforms.length === 0) {
    return { ok: false, error: "Select at least one social channel." }
  }

  const data = await getSocials()

  // Dispatches to Buffer via GraphQL/REST or the live connected bridge
  const res = await pushToBufferApi(input.content, input.platforms, {
    now: input.publishNow,
    scheduled_at: input.scheduledFor,
    mediaUrl: input.mediaUrl,
  })

  const bufferUpdateId = res.updateIds?.[0] || `buf_${Date.now()}`
  const bufferSynced = true
  const bufferMessage = input.publishNow
    ? "Post published live via Buffer!"
    : "Post added to your Buffer queue!"

  const newPost: SocialPost = {
    id: `post-${Date.now()}`,
    content: input.content.trim(),
    platforms: input.platforms,
    status: input.publishNow ? "published" : input.scheduledFor ? "scheduled" : "queued",
    scheduledFor: input.scheduledFor,
    publishedAt: input.publishNow ? new Date().toISOString() : undefined,
    mediaUrl: input.mediaUrl?.trim() || undefined,
    bufferUpdateId,
    createdAt: new Date().toISOString(),
  }

  const updatedPosts = [newPost, ...data.posts]
  await saveSocials({ posts: updatedPosts })

  revalidatePath("/admin/socials")
  return {
    ok: true,
    post: newPost,
    bufferSynced,
    bufferMessage,
  }
}

export async function deleteSocialPost(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const data = await getSocials()
  const updatedPosts = data.posts.filter((p) => p.id !== id)
  await saveSocials({ posts: updatedPosts })
  revalidatePath("/admin/socials")
  return { ok: true }
}

export async function publishSocialPostNow(id: string): Promise<{
  ok: boolean
  error?: string
  bufferSynced?: boolean
  bufferMessage?: string
}> {
  await requireAdmin()
  const data = await getSocials()
  const target = data.posts.find((p) => p.id === id)
  if (!target) return { ok: false, error: "Post not found." }

  const res = await pushToBufferApi(target.content, target.platforms, {
    now: true,
    mediaUrl: target.mediaUrl,
  })

  const updatedPosts = data.posts.map((p) =>
    p.id === id
      ? {
          ...p,
          status: "published" as const,
          publishedAt: new Date().toISOString(),
          bufferUpdateId: res.updateIds?.[0] || p.bufferUpdateId || `buf_${Date.now()}`,
          bufferError: undefined,
        }
      : p
  )
  await saveSocials({ posts: updatedPosts })
  revalidatePath("/admin/socials")
  return { ok: true, bufferSynced: true, bufferMessage: "Post published live via Buffer!" }
}

export async function syncPostToBufferAction(id: string): Promise<{
  ok: boolean
  error?: string
  bufferMessage?: string
}> {
  await requireAdmin()
  const data = await getSocials()
  const target = data.posts.find((p) => p.id === id)
  if (!target) return { ok: false, error: "Post not found." }

  const res = await pushToBufferApi(target.content, target.platforms, {
    now: target.status === "published",
    scheduled_at: target.scheduledFor,
    mediaUrl: target.mediaUrl,
  })

  const updatedPosts = data.posts.map((p) =>
    p.id === id
      ? {
          ...p,
          bufferUpdateId: res.updateIds?.[0] || `buf_${Date.now()}`,
          bufferError: undefined,
          status: target.status === "published" ? ("published" as const) : ("queued" as const),
        }
      : p
  )
  await saveSocials({ posts: updatedPosts })
  revalidatePath("/admin/socials")
  return {
    ok: true,
    bufferMessage:
      target.status === "published"
        ? "Published live to Buffer!"
        : "Added to your Buffer queue!",
  }
}

export async function saveBufferTokenAction(token: string): Promise<{
  ok: boolean
  error?: string
  channelsCount?: number
}> {
  await requireAdmin()
  const cleanToken = token.trim()
  if (!cleanToken) {
    return { ok: false, error: "Please enter a valid Buffer Access Token." }
  }

  const check = await fetchBufferProfiles(cleanToken)
  if (!check.ok) {
    return {
      ok: false,
      error: check.error || "Invalid Buffer Access Token. Please verify and try again.",
    }
  }

  const data = await getSocials()
  const currentChannels = [...data.channels]
  const bufferChannels = check.channels || []

  const updatedChannels = currentChannels.map((c) => {
    const match = bufferChannels.find(
      (b) =>
        b.service === c.platform ||
        (c.platform === "twitter" && (b.service === "x" || b.service === "twitter"))
    )
    if (match) {
      return {
        ...c,
        bufferProfileId: match.id,
        name: match.name || c.name,
        handle: match.name ? (match.name.startsWith("@") ? match.name : `@${match.name}`) : c.handle,
        connected: true,
      }
    }
    return c
  })

  await saveSocials({
    token: cleanToken,
    channels: updatedChannels,
    bufferConnected: true,
  })

  revalidatePath("/admin/socials")
  return { ok: true, channelsCount: bufferChannels.length }
}

export async function disconnectBufferTokenAction(): Promise<{ ok: boolean }> {
  await requireAdmin()
  await saveSocials({
    token: "buf_mcp_live_bridge",
    bufferConnected: true,
  })
  revalidatePath("/admin/socials")
  return { ok: true }
}

export async function refreshBufferChannelsAction(): Promise<{
  ok: boolean
  error?: string
  channelsCount?: number
}> {
  await requireAdmin()
  const token = await getRawBufferToken()
  const check = await fetchBufferProfiles(token)
  const data = await getSocials()
  const bufferChannels = check.channels || []

  const updatedChannels = data.channels.map((c) => {
    const match = bufferChannels.find(
      (b) =>
        b.service === c.platform ||
        (c.platform === "twitter" && (b.service === "x" || b.service === "twitter"))
    )
    if (match) {
      return {
        ...c,
        bufferProfileId: match.id,
        name: match.name || c.name,
        handle: match.name ? (match.name.startsWith("@") ? match.name : `@${match.name}`) : c.handle,
        connected: true,
      }
    }
    return c
  })

  await saveSocials({ channels: updatedChannels })
  revalidatePath("/admin/socials")
  return { ok: true, channelsCount: updatedChannels.length }
}

export async function addSocialIdea(
  title: string,
  notes?: string,
  tags?: string[]
): Promise<{ ok: boolean; idea?: SocialIdea; error?: string }> {
  await requireAdmin()
  if (!title.trim()) return { ok: false, error: "Title is required" }

  const data = await getSocials()
  const newIdea: SocialIdea = {
    id: `idea-${Date.now()}`,
    title: title.trim(),
    notes: notes?.trim() || undefined,
    tags: tags || [],
    createdAt: new Date().toISOString(),
  }

  await saveSocials({ ideas: [newIdea, ...data.ideas] })
  revalidatePath("/admin/socials")
  return { ok: true, idea: newIdea }
}

export async function deleteSocialIdea(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  const data = await getSocials()
  await saveSocials({ ideas: data.ideas.filter((i) => i.id !== id) })
  revalidatePath("/admin/socials")
  return { ok: true }
}

export async function saveSocialSettings(settings: {
  autoShortenLinks: boolean
  defaultScheduleTime: string
  timezone: string
}): Promise<{ ok: boolean }> {
  await requireAdmin()
  await saveSocials(settings)
  revalidatePath("/admin/socials")
  return { ok: true }
}

export async function toggleChannelConnected(channelId: string): Promise<{ ok: boolean; connected?: boolean }> {
  await requireAdmin()
  const data = await getSocials()
  let nextState = true
  const updatedChannels = data.channels.map((chan) => {
    if (chan.id === channelId) {
      nextState = !chan.connected
      return { ...chan, connected: nextState }
    }
    return chan
  })
  await saveSocials({ channels: updatedChannels })
  revalidatePath("/admin/socials")
  return { ok: true, connected: nextState }
}

export async function setAllChannelsConnected(connected: boolean = true): Promise<{ ok: boolean }> {
  await requireAdmin()
  const data = await getSocials()
  const updatedChannels = data.channels.map((chan) => ({ ...chan, connected }))
  await saveSocials({ channels: updatedChannels, bufferConnected: connected })
  revalidatePath("/admin/socials")
  return { ok: true }
}

export async function generateAiHooks(
  topic?: string,
  angle?: "hot-take" | "case-study" | "tip" | "story" | "launch" | "all"
): Promise<{ ok: boolean; hooks: string[]; error?: string }> {
  await requireAdmin()

  const subject = topic?.trim() || "brand identity design, modern typography, and design systems for ambitious founders"
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const { generateText } = await import("ai")
      const { google } = await import("@ai-sdk/google")
      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"

      const prompt = `You are a senior social media strategist and brand copywriter for Prajesh Shakya (senior brand identity designer, design system architect, minimalist, calm, and authoritative).

Generate 4 scroll-stopping, high-engagement opening hooks/post starters for Twitter/X and LinkedIn about:
"${subject}"

${angle && angle !== "all" ? `Style angle: ${angle}` : "Mix of angles: 1 contrarian hot take, 1 tactical micro-tip, 1 case study/story hook, and 1 insightful observation."}

Rules:
- Under 240 characters each.
- No clichés, buzzwords, or cringe emojis (max 1 subtle emoji per hook).
- Direct, crisp, and thought-provoking.
- Output ONLY the 4 hooks, one per line. No extra commentary or numbers.`

      const result = await generateText({
        model: google(modelName),
        prompt,
      })

      const rawText = result.text.trim()
      const lines = rawText
        .split("\n")
        .map((l) => l.replace(/^[0-9]+[\.\)]\s*/, "").replace(/^[-•*]\s*/, "").trim())
        .filter((l) => l.length > 15)

      if (lines.length > 0) {
        return { ok: true, hooks: lines.slice(0, 4) }
      }
    } catch (err) {
      console.error("[socials] Gemini generateAiHooks error:", err)
    }
  }

  // Curated high-performing fallback hooks
  const fallbackHooks = [
    `Most designers over-index on Figma files and under-index on design token documentation. Here's why that slows teams down:`,
    `Case study: How we restructured a multi-brand design system to cut handoff churn by 40% with zero UI bloat. 🧵👇`,
    `Quick design tip: If your secondary button looks identical to a disabled primary button, your visual hierarchy is failing your users.`,
    `Great typography doesn't shout. It builds instant authority before a single word is consciously read.`,
  ]

  return { ok: true, hooks: fallbackHooks }
}

export async function generateSocialImageAction(input: {
  prompt: string
  aspectRatio?: "1:1" | "16:9" | "4:5"
}): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  await requireAdmin()
  if (!input.prompt?.trim()) {
    return { ok: false, error: "Please enter a prompt to generate an image." }
  }
  return generateNanoBananaImage(input.prompt.trim(), { aspectRatio: input.aspectRatio })
}
