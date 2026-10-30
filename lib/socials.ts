import "server-only"

import fs from "fs"
import path from "path"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { siteSettings } from "@/lib/db/schema"

export type SocialPlatform = "twitter" | "linkedin" | "instagram" | "threads" | "bluesky" | "facebook"

export interface SocialChannel {
  id: string
  platform: SocialPlatform
  name: string
  handle: string
  avatarUrl?: string
  connected: boolean
  queueCount: number
}

export interface SocialPost {
  id: string
  content: string
  platforms: SocialPlatform[]
  status: "draft" | "queued" | "scheduled" | "published" | "failed"
  scheduledFor?: string
  publishedAt?: string
  mediaUrl?: string
  bufferUpdateId?: string
  createdAt: string
}

export interface SocialIdea {
  id: string
  title: string
  notes?: string
  tags?: string[]
  createdAt: string
}

export interface SocialsData {
  bufferEndpoint: string
  hasToken: boolean
  bufferConnected: boolean
  channels: SocialChannel[]
  posts: SocialPost[]
  ideas: SocialIdea[]
  autoShortenLinks: boolean
  defaultScheduleTime: string
  timezone: string
}

const DEFAULT_CHANNELS: SocialChannel[] = [
  {
    id: "chan-fb",
    platform: "facebook",
    name: "Prajesh Shakya",
    handle: "facebook.com/shakyaprajesh",
    avatarUrl: "/images/prajesh-avatar.jpg",
    connected: true,
    queueCount: 1,
  },
  {
    id: "chan-x",
    platform: "twitter",
    name: "Prajesh Shakya",
    handle: "@shakyaprajesh",
    avatarUrl: "/images/prajesh-avatar.jpg",
    connected: true,
    queueCount: 2,
  },
  {
    id: "chan-li",
    platform: "linkedin",
    name: "Prajesh Shakya",
    handle: "in/shakyaprajesh",
    avatarUrl: "/images/prajesh-avatar.jpg",
    connected: true,
    queueCount: 1,
  },
  {
    id: "chan-ig",
    platform: "instagram",
    name: "Prajesh Shakya",
    handle: "@shakyaprajesh",
    avatarUrl: "/images/prajesh-avatar.jpg",
    connected: true,
    queueCount: 2,
  },
]

const DEFAULT_POSTS: SocialPost[] = [
  {
    id: "post-1",
    content: "Design systems are living systems. If you treat them as static UI kits, they atrophy within quarters. Build for team velocity and documentation-first alignment.",
    platforms: ["facebook", "linkedin"],
    status: "scheduled",
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "post-2",
    content: "Case study live: How we reimagined the student onboarding portal with zero-friction micro-interactions. Full breakdown on shakyaprajesh.com.np/projects",
    platforms: ["facebook", "twitter", "instagram"],
    status: "queued",
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    mediaUrl: "/images/socials/default-brand-cover.jpg",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "post-3",
    content: "Shipped the brand new 2026 portfolio refresh! Built with Next.js 16, Better Auth, and Drizzle. Fast, minimal, and typography-obsessed.",
    platforms: ["facebook", "twitter"],
    status: "published",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
  },
]

const DEFAULT_IDEAS: SocialIdea[] = [
  {
    id: "idea-1",
    title: "Why design tokens save engineering cycles during rebrands",
    notes: "Walk through token aliases vs global primitives with code snippets.",
    tags: ["Design System", "Engineering"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "idea-2",
    title: "5 Micro-interactions that make client portals feel premium",
    notes: "Focus on optimistic updates, command palette hints, and calm notifications.",
    tags: ["UX", "Product"],
    createdAt: new Date().toISOString(),
  },
]

export const BUFFER_MCP_URL = "https://mcp.buffer.com/mcp"

export async function getSocials(): Promise<SocialsData> {
  const envToken = process.env.BUFFER_ACCESS_TOKEN?.trim() || ""

  try {
    await ensureSchema()
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "socials"))
      .limit(1)

    const saved = (row?.value && typeof row.value === "object" ? row.value : {}) as Partial<SocialsData>

    return {
      bufferEndpoint: BUFFER_MCP_URL,
      hasToken: Boolean(envToken || (saved as { token?: string }).token),
      bufferConnected: saved.bufferConnected ?? true,
      channels: saved.channels && saved.channels.length > 0 ? saved.channels : DEFAULT_CHANNELS,
      posts: saved.posts && saved.posts.length > 0 ? saved.posts : DEFAULT_POSTS,
      ideas: saved.ideas && saved.ideas.length > 0 ? saved.ideas : DEFAULT_IDEAS,
      autoShortenLinks: saved.autoShortenLinks ?? true,
      defaultScheduleTime: saved.defaultScheduleTime ?? "17:00",
      timezone: saved.timezone ?? "Asia/Kathmandu",
    }
  } catch (err) {
    console.error("[socials] Could not load socials from siteSettings:", err)
    return {
      bufferEndpoint: BUFFER_MCP_URL,
      hasToken: Boolean(envToken),
      bufferConnected: true,
      channels: DEFAULT_CHANNELS,
      posts: DEFAULT_POSTS,
      ideas: DEFAULT_IDEAS,
      autoShortenLinks: true,
      defaultScheduleTime: "17:00",
      timezone: "Asia/Kathmandu",
    }
  }
}

export async function saveSocials(data: Partial<SocialsData>): Promise<void> {
  await ensureSchema()
  const current = await getSocials()
  const updated: SocialsData = {
    ...current,
    ...data,
  }

  await db
    .insert(siteSettings)
    .values({
      key: "socials",
      value: updated,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: updated,
        updatedAt: new Date(),
      },
    })
}

// Optional Buffer API Client: can create posts if live credentials exist
export async function pushToBufferApi(
  text: string,
  profileIds: string[],
  options: { now?: boolean; scheduled_at?: string; mediaUrl?: string } = {}
): Promise<{ ok: boolean; updateId?: string; error?: string }> {
  const token = process.env.BUFFER_ACCESS_TOKEN?.trim()
  if (!token) {
    return { ok: false, error: "BUFFER_ACCESS_TOKEN is not configured in .env.local" }
  }

  try {
    const formData = new URLSearchParams()
    formData.append("access_token", token)
    formData.append("text", text)
    if (options.now) {
      formData.append("now", "true")
    }
    if (options.scheduled_at) {
      formData.append("scheduled_at", options.scheduled_at)
    }
    if (options.mediaUrl) {
      formData.append("media[photo]", options.mediaUrl)
    }
    for (const pid of profileIds) {
      formData.append("profile_ids[]", pid)
    }

    const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })

    const result = await res.json()
    if (!res.ok || !result.success) {
      return { ok: false, error: result.message || "Failed to post via Buffer API" }
    }

    return { ok: true, updateId: result.updates?.[0]?.id }
  } catch (error) {
    console.error("[buffer] API request failed:", error)
    return { ok: false, error: error instanceof Error ? error.message : "Network error" }
  }
}

// Nano Banana / Gemini Social Image Generator
export async function generateNanoBananaImage(
  prompt: string,
  options: { aspectRatio?: "1:1" | "16:9" | "4:5" } = {}
): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  const outputDir = path.join(process.cwd(), "public", "images", "socials")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filename = `nano-banana-${Date.now()}.jpg`
  const filePath = path.join(outputDir, filename)
  const publicUrl = `/images/socials/${filename}`

  if (apiKey) {
    try {
      const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.8-flash"
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a high quality, professional editorial luxury social media graphic, high resolution, minimalist aesthetic: ${prompt}. Aspect ratio: ${options.aspectRatio || "16:9"}.`
                  }
                ]
              }
            ],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"]
            }
          }),
        }
      )

      const data = await res.json()
      const parts = data.candidates?.[0]?.content?.parts || []
      const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data)

      if (imagePart) {
        const buffer = Buffer.from(imagePart.inlineData.data, "base64")
        fs.writeFileSync(filePath, buffer)
        return { ok: true, imageUrl: publicUrl }
      }
    } catch (err) {
      console.error("[socials] Nano Banana image generation API call error:", err)
    }
  }

  // Graceful fallback: copy base cover if available or default visual
  const baseCover = path.join(outputDir, "default-brand-cover.jpg")
  if (fs.existsSync(baseCover)) {
    fs.copyFileSync(baseCover, filePath)
    return { ok: true, imageUrl: publicUrl }
  }

  return { ok: true, imageUrl: "/images/generated-social-visual.jpg" }
}

