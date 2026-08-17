"use server"

import { del, put } from "@vercel/blob"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { showcaseVideos } from "@/lib/db/schema"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
}

export async function listShowcaseVideos() {
  await requireAdmin()
  return db.select().from(showcaseVideos).orderBy(desc(showcaseVideos.createdAt))
}

export async function getActiveShowcaseVideo() {
  const rows = await db.select().from(showcaseVideos).where(eq(showcaseVideos.isActive, true)).limit(1)
  return rows[0] ?? null
}

export async function uploadShowcaseVideo(formData: FormData) {
  await requireAdmin()
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) throw new Error("A video file is required")
  if (!file.type.startsWith("video/")) throw new Error("Only video files are supported")
  if (file.size > 100 * 1024 * 1024) throw new Error("Video must be under 100MB")
  const blob = await put(`portfolio/showcase/${Date.now()}-${file.name}`, file, { access: "public", addRandomSuffix: true })
  const saved = await db.insert(showcaseVideos).values({ pathname: blob.pathname, url: blob.url, filename: file.name, contentType: file.type, sizeBytes: file.size }).returning()
  revalidatePath("/")
  revalidatePath("/admin")
  return saved[0]
}

export async function activateShowcaseVideo(id: number) {
  await requireAdmin()
  await db.update(showcaseVideos).set({ isActive: false }).where(eq(showcaseVideos.isActive, true))
  const saved = await db.update(showcaseVideos).set({ isActive: true }).where(eq(showcaseVideos.id, id)).returning()
  revalidatePath("/")
  revalidatePath("/admin")
  return saved[0]
}

export async function deleteShowcaseVideo(id: number) {
  await requireAdmin()
  const rows = await db.select().from(showcaseVideos).where(eq(showcaseVideos.id, id)).limit(1)
  if (rows[0]) {
    await del(rows[0].url)
    await db.delete(showcaseVideos).where(eq(showcaseVideos.id, id))
  }
  revalidatePath("/")
  revalidatePath("/admin")
}
