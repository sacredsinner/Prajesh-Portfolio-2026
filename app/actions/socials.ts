"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth, isAdminUser } from "@/lib/auth"
import {
  getSocials,
  saveSocials,
  pushToBufferApi,
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
}): Promise<{ ok: boolean; error?: string; post?: SocialPost }> {
  await requireAdmin()

  if (!input.content.trim()) {
    return { ok: false, error: "Post content cannot be empty." }
  }
  if (!input.platforms || input.platforms.length === 0) {
    return { ok: false, error: "Select at least one social channel." }
  }

  const data = await getSocials()
  let bufferUpdateId: string | undefined

  // If buffer token is present and user requested live publish/schedule
  if (data.hasToken) {
    const res = await pushToBufferApi(input.content, ["default"], {
      now: input.publishNow,
      scheduled_at: input.scheduledFor,
      mediaUrl: input.mediaUrl,
    })
    if (res.ok && res.updateId) {
      bufferUpdateId = res.updateId
    }
  }

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
  return { ok: true, post: newPost }
}

export async function deleteSocialPost(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const data = await getSocials()
  const updatedPosts = data.posts.filter((p) => p.id !== id)
  await saveSocials({ posts: updatedPosts })
  revalidatePath("/admin/socials")
  return { ok: true }
}

export async function publishSocialPostNow(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const data = await getSocials()
  const target = data.posts.find((p) => p.id === id)
  if (!target) return { ok: false, error: "Post not found." }

  if (data.hasToken) {
    await pushToBufferApi(target.content, ["default"], { now: true, mediaUrl: target.mediaUrl })
  }

  const updatedPosts = data.posts.map((p) =>
    p.id === id ? { ...p, status: "published" as const, publishedAt: new Date().toISOString() } : p
  )
  await saveSocials({ posts: updatedPosts })
  revalidatePath("/admin/socials")
  return { ok: true }
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
