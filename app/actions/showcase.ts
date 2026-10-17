"use server"

import { del } from "@vercel/blob"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { showcaseVideos } from "@/lib/db/schema"
import { getBlobDeleteOptions, isBlobUrl } from "@/lib/blob"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

const uploadedVideoSchema = z.object({
  url: z.string().url().refine(isBlobUrl),
  pathname: z.string().startsWith("portfolio/showcase/"),
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().startsWith("video/"),
  size: z.number().int().positive().max(100 * 1024 * 1024),
})

export async function listShowcaseVideos() {
  await requireAdmin()
  return db.select().from(showcaseVideos).orderBy(desc(showcaseVideos.createdAt))
}

// Runs after the browser has uploaded the video to Blob, and makes it the active showcase.
export async function addShowcaseVideo(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()
  const parsed = uploadedVideoSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "The uploaded video could not be verified. Please try again." }
  const video = parsed.data
  try {
    await db.transaction(async (tx) => {
      await tx.update(showcaseVideos).set({ isActive: false }).where(eq(showcaseVideos.isActive, true))
      await tx.insert(showcaseVideos).values({ pathname: video.pathname, url: video.url, filename: video.filename, contentType: video.contentType, sizeBytes: video.size, isActive: true })
    })
  } catch (error) {
    console.error("[showcase] Could not save uploaded video", error)
    await del(video.url, getBlobDeleteOptions()).catch(() => undefined)
    return { ok: false, error: "The video uploaded but could not be saved, so it was removed. Please try again." }
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function activateShowcaseVideo(id: number) {
  await requireAdmin()
  const saved = await db.transaction(async (tx) => {
    const target = await tx.select({ id: showcaseVideos.id }).from(showcaseVideos).where(eq(showcaseVideos.id, id)).limit(1)
    if (!target[0]) throw new Error("Showcase video not found")
    await tx.update(showcaseVideos).set({ isActive: false }).where(eq(showcaseVideos.isActive, true))
    return tx.update(showcaseVideos).set({ isActive: true }).where(eq(showcaseVideos.id, id)).returning()
  })
  revalidatePath("/", "layout")
  return saved[0]
}

export async function deleteShowcaseVideo(id: number) {
  await requireAdmin()
  const result = await db.transaction(async (tx) => {
    const row = (await tx.select().from(showcaseVideos).where(eq(showcaseVideos.id, id)).limit(1))[0]
    if (!row) return null
    await tx.delete(showcaseVideos).where(eq(showcaseVideos.id, id))
    if (row.isActive) {
      const replacement = (await tx.select({ id: showcaseVideos.id }).from(showcaseVideos).orderBy(desc(showcaseVideos.createdAt)).limit(1))[0]
      if (replacement) await tx.update(showcaseVideos).set({ isActive: true }).where(eq(showcaseVideos.id, replacement.id))
    }
    return row
  })
  if (result) await del(result.url, getBlobDeleteOptions()).catch(() => undefined)
  revalidatePath("/", "layout")
}
