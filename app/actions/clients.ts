"use server"

import { del, put } from "@vercel/blob"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { clients } from "@/lib/db/schema"
import { getBlobToken } from "@/lib/blob"

async function requireAdmin() { const session = await auth.api.getSession({ headers: await headers() }); if (!isAdminUser(session?.user)) throw new Error("Unauthorized") }
const clientSchema = z.object({ name: z.string().trim().min(1).max(120), slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), logoUrl: z.string().url(), logoPathname: z.string().min(1), websiteUrl: z.string().url().optional().or(z.literal("")), description: z.string().max(5000).optional().or(z.literal("")), isPublished: z.boolean(), sortOrder: z.coerce.number().int() })
export type ClientInput = z.infer<typeof clientSchema>
export async function listClients() { await requireAdmin(); return db.select().from(clients).orderBy(clients.sortOrder, desc(clients.createdAt)) }
export async function uploadClientLogo(formData: FormData) { await requireAdmin(); const file = formData.get("file"); if (!(file instanceof File) || !file.type.startsWith("image/")) throw new Error("An image file is required"); if (file.size > 8 * 1024 * 1024) throw new Error("Logo must be under 8MB");   const token = getBlobToken()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-") || "client-logo"
  const blob = await put(`clients/${Date.now()}-${safeName}`, file, { access: "public", addRandomSuffix: true, contentType: file.type, token })
  return { url: blob.url, pathname: blob.pathname } }
export async function bulkUploadClientLogos(formData: FormData) {
  await requireAdmin()
  const token = getBlobToken()
  const files = formData.getAll("files").filter((file): file is File => file instanceof File)
  if (!files.length) throw new Error("Select at least one image")
  if (files.length > 50) throw new Error("Upload up to 50 images at a time")
  const uploaded: string[] = []
  const rows = []
  try {
    for (const [index, file] of files.entries()) {
      if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`)
      if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} must be under 8MB`)
      const blob = await put(`clients/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`, file, { access: "public", addRandomSuffix: true, contentType: file.type, token })
      uploaded.push(blob.pathname)
      const baseName = file.name.replace(/\\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim() || "Client"
      const slug = `${baseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "client"}-${Date.now()}-${index}`
      rows.push(...await db.insert(clients).values({ name: baseName, slug, logoUrl: blob.url, logoPathname: blob.pathname, isPublished: true, sortOrder: index }).returning())
    }
  } catch (error) {
    await Promise.all(uploaded.map((pathname) => del(pathname).catch(() => undefined)))
    throw error
  }
  revalidatePath("/"); revalidatePath("/clients"); revalidatePath("/admin")
  return rows
}

export async function saveClient(input: ClientInput & { id?: number }) { await requireAdmin(); const data = clientSchema.parse(input); const values = { ...data, websiteUrl: data.websiteUrl || null, description: data.description || null }; const saved = input.id ? await db.update(clients).set(values).where(eq(clients.id, input.id)).returning() : await db.insert(clients).values(values).returning(); revalidatePath("/"); revalidatePath("/clients"); revalidatePath(`/clients/${data.slug}`); revalidatePath("/admin"); return saved[0] }
export async function deleteClient(id: number) {
  await requireAdmin()
  const row = (await db.select({ pathname: clients.logoPathname }).from(clients).where(eq(clients.id, id)).limit(1))[0]
  if (!row) return
  await db.delete(clients).where(eq(clients.id, id))
  await del(row.pathname).catch(() => undefined)
  revalidatePath("/")
  revalidatePath("/clients")
  revalidatePath("/admin")
}
