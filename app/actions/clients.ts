"use server"

import { del } from "@vercel/blob"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { clients } from "@/lib/db/schema"
import { getBlobDeleteOptions, isBlobUrl } from "@/lib/blob"
import { makeSlug } from "@/lib/utils"

type Client = typeof clients.$inferSelect
type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function requireAdmin() { const session = await auth.api.getSession({ headers: await headers() }); if (!isAdminUser(session?.user)) throw new Error("Unauthorized") }

function revalidatePublicSite() {
  revalidatePath("/", "layout")
}

const blobUrl = z.string().url().refine(isBlobUrl, "Logos must be uploaded to Blob storage")
const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Keep the name under 120 characters"),
  slug: z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens in the slug"),
  logoUrl: z.string().url(),
  logoPathname: z.string().min(1),
  websiteUrl: z.string().trim().url("Use a full website address, starting with https://").optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  isPublished: z.boolean(),
  sortOrder: z.coerce.number().int(),
})
export type ClientInput = z.infer<typeof clientSchema>

const uploadedLogosSchema = z.array(z.object({ name: z.string().trim().min(1).max(120), logoUrl: blobUrl, logoPathname: z.string().startsWith("clients/") })).min(1).max(50)

function uniqueSlug(name: string, taken: Set<string>) {
  const root = makeSlug(name) || "client"
  let candidate = root
  for (let suffix = 2; taken.has(candidate); suffix++) candidate = `${root}-${suffix}`
  taken.add(candidate)
  return candidate
}

export async function listClients() { await requireAdmin(); return db.select().from(clients).orderBy(clients.sortOrder, desc(clients.createdAt)) }

// Runs after the browser has uploaded the logo files to Blob.
export async function addClients(input: unknown): Promise<Result<Client[]>> {
  await requireAdmin()
  const parsed = uploadedLogosSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Some uploaded logos could not be verified. Please try again." }
  try {
    const existing = await db.select({ slug: clients.slug, sortOrder: clients.sortOrder }).from(clients)
    const taken = new Set(existing.map((row) => row.slug))
    let order = existing.reduce((highest, row) => Math.max(highest, row.sortOrder), 0)
    const rows = await db.insert(clients).values(parsed.data.map((item) => ({
      name: item.name,
      slug: uniqueSlug(item.name, taken),
      logoUrl: item.logoUrl,
      logoPathname: item.logoPathname,
      isPublished: true,
      sortOrder: ++order,
    }))).returning()
    revalidatePublicSite()
    return { ok: true, data: rows }
  } catch (error) {
    console.error("[clients] Could not save uploaded logos", error)
    await del(parsed.data.map((item) => item.logoUrl), getBlobDeleteOptions()).catch(() => undefined)
    return { ok: false, error: "Could not save these clients, so the uploaded logos were removed. Please try again." }
  }
}

// Removes logos that were uploaded but never saved (e.g. when one file in a batch fails).
export async function discardUploadedLogos(urls: unknown) {
  await requireAdmin()
  const parsed = z.array(blobUrl).max(50).safeParse(urls)
  if (parsed.success && parsed.data.length > 0) await del(parsed.data, getBlobDeleteOptions()).catch(() => undefined)
}

export async function saveClient(input: ClientInput & { id?: number }): Promise<Result<Client>> {
  await requireAdmin()
  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the client details." }
  const data = parsed.data
  const values = { ...data, websiteUrl: data.websiteUrl || null, description: data.description || null }
  try {
    const clash = (await db.select({ id: clients.id }).from(clients).where(eq(clients.slug, data.slug)).limit(1))[0]
    if (clash && clash.id !== input.id) return { ok: false, error: "Another client already uses that slug." }
    const saved = input.id ? await db.update(clients).set(values).where(eq(clients.id, input.id)).returning() : await db.insert(clients).values(values).returning()
    if (!saved[0]) return { ok: false, error: "That client no longer exists." }
    revalidatePublicSite()
    return { ok: true, data: saved[0] }
  } catch (error) {
    console.error("[clients] Could not save client", error)
    return { ok: false, error: "Could not save the client. Please try again." }
  }
}

export async function deleteClient(id: number) {
  await requireAdmin()
  const row = (await db.select({ logoUrl: clients.logoUrl }).from(clients).where(eq(clients.id, id)).limit(1))[0]
  if (!row) return
  await db.delete(clients).where(eq(clients.id, id))
  await del(row.logoUrl, getBlobDeleteOptions()).catch(() => undefined)
  revalidatePublicSite()
}
