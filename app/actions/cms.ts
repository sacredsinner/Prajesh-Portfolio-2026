"use server"

import { put } from "@vercel/blob"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { blogPosts, contacts, projects, testimonials } from "@/lib/db/schema"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

const slug = z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
const optionalText = z.string().trim().nullable().optional()
const imagePath = z.string().trim().min(1, "Upload an image").refine((value) => value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://"), "Use a valid image URL")
const projectSchema = z.object({ slug, title: z.string().trim().min(1, "Title is required"), category: z.string().trim().min(1, "Category is required"), year: z.string().trim().min(1, "Year is required"), thumbnail: imagePath, client: optionalText, overview: optionalText, problem: optionalText, approach: optionalText, solution: optionalText, outcome: optionalText, images: z.array(imagePath).default([]), featured: z.boolean().default(false), seoTitle: optionalText, seoDescription: optionalText })
export type ProjectInput = z.input<typeof projectSchema>
const testimonialSchema = z.object({ quote: z.string().trim().min(10), clientName: z.string().trim().min(2), clientRole: optionalText, company: optionalText, avatarUrl: imagePath.nullable().optional(), featured: z.boolean().default(false), published: z.boolean().default(true), sortOrder: z.coerce.number().int().default(0) })
export type TestimonialInput = z.input<typeof testimonialSchema>
const postSchema = z.object({ slug, title: z.string().trim().min(1, "Title is required"), excerpt: z.string().trim().min(1, "Excerpt is required"), content: z.string().trim().min(1, "Content is required"), category: z.string().trim().min(1, "Category is required"), featuredImage: imagePath, author: z.string().trim().min(1, "Author is required"), tags: z.array(z.string()).default([]), published: z.boolean().default(false), publishedAt: z.coerce.date().nullable().optional(), seoTitle: optionalText, seoDescription: optionalText, seoKeywords: optionalText, featured: z.boolean().default(false) })
export type PostInput = z.input<typeof postSchema>

export async function listTestimonials() { await requireAdmin(); return db.select().from(testimonials).orderBy(desc(testimonials.sortOrder), desc(testimonials.createdAt)) }
export async function saveTestimonial(input: TestimonialInput & { id?: string }) { await requireAdmin(); const data = testimonialSchema.parse(input); const values = { ...data, updatedAt: new Date() }; const saved = input.id ? await db.update(testimonials).set(values).where(eq(testimonials.id, input.id)).returning() : await db.insert(testimonials).values(values).returning(); revalidatePath("/"); revalidatePath("/admin"); return saved[0] }
export async function deleteTestimonial(id: string) { await requireAdmin(); await db.delete(testimonials).where(eq(testimonials.id, id)); revalidatePath("/"); revalidatePath("/admin") }

export async function listProjects() { await requireAdmin(); return db.select().from(projects).orderBy(desc(projects.createdAt)) }
export async function saveProject(input: ProjectInput & { id?: string }) {
  await requireAdmin()
  const data = projectSchema.parse({
    ...input,
    thumbnail: input.thumbnail.trim(),
    images: (input.images ?? []).map((image) => image.trim()).filter(Boolean),
  })
  const values = { ...data, updatedAt: new Date() }
  const saved = input.id
    ? await db.update(projects).set(values).where(eq(projects.id, input.id)).returning()
    : await db.insert(projects).values(values).returning()
  revalidatePath("/")
  revalidatePath("/projects")
  revalidatePath(`/projects/${data.slug}`)
  revalidatePath("/admin")
  return saved[0]
}
export async function deleteProject(id: string) { await requireAdmin(); await db.delete(projects).where(eq(projects.id, id)); revalidatePath("/projects"); revalidatePath("/admin") }
export async function getProjectBySlug(value: string) { return (await db.select().from(projects).where(eq(projects.slug, value))).at(0) ?? null }

export async function listPosts() { await requireAdmin(); return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)) }
export async function savePost(input: PostInput & { id?: string }) { await requireAdmin(); const data = postSchema.parse(input); const values = { ...data, publishedAt: data.published ? data.publishedAt ?? new Date() : null, updatedAt: new Date() }; const saved = input.id ? await db.update(blogPosts).set(values).where(eq(blogPosts.id, input.id)).returning() : await db.insert(blogPosts).values(values).returning(); revalidatePath("/blog"); revalidatePath(`/blog/${data.slug}`); revalidatePath("/admin"); return saved[0] }
export async function deletePost(id: string) { await requireAdmin(); await db.delete(blogPosts).where(eq(blogPosts.id, id)); revalidatePath("/blog"); revalidatePath("/admin") }
export async function getPostBySlug(value: string) { return (await db.select().from(blogPosts).where(eq(blogPosts.slug, value))).at(0) ?? null }

const contactSchema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(200), company: z.string().trim().max(160).optional(), message: z.string().trim().min(10).max(5000) })
export async function submitContact(input: z.input<typeof contactSchema>) { const data = contactSchema.parse(input); await db.insert(contacts).values(data); revalidatePath("/admin"); return { ok: true } }
export async function listContacts() { await requireAdmin(); return db.select().from(contacts).orderBy(desc(contacts.createdAt)) }
export async function updateContact(id: string, status: string, notes: string) { await requireAdmin(); await db.update(contacts).set({ status: z.enum(["new", "read", "replied", "archived"]).parse(status), notes: notes.trim(), updatedAt: new Date() }).where(eq(contacts.id, id)); revalidatePath("/admin") }
export async function deleteContact(id: string) { await requireAdmin(); await db.delete(contacts).where(eq(contacts.id, id)); revalidatePath("/admin") }

export async function uploadAsset(formData: FormData) { await requireAdmin(); const file = formData.get("file"); if (!(file instanceof File) || file.size === 0) throw new Error("A file is required"); if (!file.type.startsWith("image/")) throw new Error("Only image files are supported"); if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8MB"); const blob = await put(`portfolio/${Date.now()}-${file.name}`, file, { access: "public", addRandomSuffix: true }); return blob.url }

export async function getAdminData() { await requireAdmin(); const [projectRows, postRows, contactRows] = await Promise.all([listProjects(), listPosts(), listContacts()]); return { projectRows, postRows, contactRows } }

export type ContactInput = z.input<typeof contactSchema>
