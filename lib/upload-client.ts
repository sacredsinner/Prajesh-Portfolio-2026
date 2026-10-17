"use client"

import { upload } from "@vercel/blob/client"

// Files go straight from the browser to Vercel Blob. Sending them through a
// Server Action or route hits Vercel's 4.5 MB request limit, which is why
// videos and larger images used to fail.

export type UploadFolder = "portfolio" | "clients" | "portfolio/showcase"

export type UploadedFile = { url: string; pathname: string; filename: string; contentType: string; size: number }

const MB = 1024 * 1024
const RESIZABLE = ["image/jpeg", "image/png", "image/webp"]
const MAX_EDGE = 2400

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
}

// Large photos are scaled to 2400 px on the long edge and re-encoded, so a
// 6 MB phone photo becomes a few hundred KB before it is stored and served.
async function shrinkImage(file: File): Promise<File> {
  if (!RESIZABLE.includes(file.type) || typeof createImageBitmap !== "function") return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= 1.5 * MB) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext("2d")
    if (!context) return file
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    let blob = await canvasToBlob(canvas, "image/webp", 0.86)
    // Browsers that cannot encode WebP hand back a PNG; JPEG sources fall back to JPEG.
    if (blob?.type !== "image/webp" && file.type === "image/jpeg") blob = await canvasToBlob(canvas, "image/jpeg", 0.86)
    if (!blob || blob.size >= file.size) return file
    const extension = blob.type === "image/webp" ? "webp" : blob.type === "image/jpeg" ? "jpg" : "png"
    return new File([blob], `${file.name.replace(/\.[^/.]+$/, "")}.${extension}`, { type: blob.type })
  } catch {
    return file
  }
}

export async function uploadToBlob(file: File, folder: UploadFolder, onProgress?: (percentage: number) => void): Promise<UploadedFile> {
  const isVideo = folder === "portfolio/showcase"
  if (isVideo ? !file.type.startsWith("video/") : !file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not ${isVideo ? "a video" : "an image"}.`)
  }
  const prepared = isVideo ? file : await shrinkImage(file)
  const limit = isVideo ? 100 : 8
  if (prepared.size > limit * MB) throw new Error(`${file.name} is larger than ${limit}MB.`)

  const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "upload"
  const blob = await upload(`${folder}/${Date.now()}-${safeName}`, prepared, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    contentType: prepared.type,
    multipart: prepared.size > 25 * MB,
    onUploadProgress: onProgress ? ({ percentage }) => onProgress(percentage) : undefined,
  })
  return { url: blob.url, pathname: blob.pathname, filename: file.name, contentType: prepared.type, size: prepared.size }
}
