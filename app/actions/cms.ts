"use server"

import { and, desc, eq, gte, or, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { del } from "@vercel/blob"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { blogPosts, contacts, projects, testimonials } from "@/lib/db/schema"
import { getBlobDeleteOptions, isBlobUrl } from "@/lib/blob"
import { sendEmail } from "@/lib/email"
import { enquiryAutoReplyEmail, enquiryNotificationEmail } from "@/lib/email-templates"
import { addLead } from "@/lib/resend-contacts"
import { ensureSchema } from "@/lib/db/migrate"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) throw new Error("Unauthorized")
  return session.user
}

// Targeted revalidation refreshes the affected public routes without
// indiscriminately purging unrelated static cache segments.
function revalidatePublicSite(slug?: string) {
  revalidatePath("/")
  revalidatePath("/projects")
  revalidatePath("/blog")
  revalidatePath("/sitemap.xml")
  if (slug) {
    revalidatePath(`/projects/${slug}`)
    revalidatePath(`/blog/${slug}`)
  }
}

// Saves return { ok, error } instead of throwing: in production React replaces any
// thrown message with a generic "An error occurred", so the editor could never say what was wrong.
export type SaveResult = { ok: true; id: string } | { ok: false; error: string }

const FIELD_LABELS: Record<string, string> = { featuredImage: "Featured image", clientName: "Name", clientRole: "Role", seoTitle: "SEO title", seoDescription: "SEO description", seoKeywords: "SEO keywords", sortOrder: "Order" }
function describeIssue(error: z.ZodError) {
  const issue = error.issues[0]
  if (!issue) return "Please check the form and try again."
  const field = String(issue.path[0] ?? "")
  const label = FIELD_LABELS[field] ?? (field ? field.charAt(0).toUpperCase() + field.slice(1) : "")
  return label ? `${label}: ${issue.message}` : issue.message
}
function isUniqueViolation(error: unknown) {
  const code = (error as { code?: string; cause?: { code?: string } } | null)?.code ?? (error as { cause?: { code?: string } } | null)?.cause?.code
  return code === "23505"
}

// Best-effort clean-up of uploaded files when the item that used them is deleted.
// A file still used by another project or note is kept.
async function stillUsed(url: string) {
  const inProjects = await db.select({ id: projects.id }).from(projects).where(or(eq(projects.thumbnail, url), sql`${projects.images} @> ${JSON.stringify([url])}::jsonb`)).limit(1)
  if (inProjects.length) return true
  const inPosts = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.featuredImage, url)).limit(1)
  return inPosts.length > 0
}
async function deleteBlobs(urls: (string | null | undefined)[]) {
  try {
    const candidates = [...new Set(urls.filter((url): url is string => typeof url === "string" && isBlobUrl(url)))]
    const unused: string[] = []
    for (const url of candidates) if (!(await stillUsed(url))) unused.push(url)
    if (unused.length) await del(unused, getBlobDeleteOptions())
  } catch (error) {
    console.error("[cms] Could not delete uploaded files", error)
  }
}

// Uploads now return URLs, but older editor sessions stored { url, pathname }.
function toImageUrl(value: unknown) {
  if (typeof value === "string") return value.trim()
  if (value && typeof value === "object" && "url" in value) return String((value as { url: unknown }).url).trim()
  return ""
}

const slug = z.string().trim().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
const optionalText = z.string().trim().nullable().optional()
const imagePath = z.string().trim().min(1, "Upload an image").refine((value) => value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://"), "Use a valid image URL")
const projectSchema = z.object({
  slug,
  title: z.string().trim().min(1, "Title is required"),
  subtitle: optionalText,
  status: z.enum(["draft", "published", "scheduled", "unlisted"]).default("published"),
  scheduledAt: z.union([z.coerce.date(), z.string()]).nullable().optional(),
  category: z.string().trim().min(1, "Category is required"),
  year: z.string().trim().min(1, "Year is required"),
  thumbnail: z.string().trim().default("/placeholder.jpg"),
  coverCrop: z.any().nullable().optional(),
  client: optionalText,
  role: optionalText,
  overview: optionalText,
  problem: optionalText,
  approach: optionalText,
  solution: optionalText,
  outcome: optionalText,
  images: z.array(z.string()).default([]),
  creativeFields: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  toolsUsed: z.array(z.string()).default([]),
  team: z.array(z.object({ name: z.string(), role: z.string(), url: z.string().optional() })).default([]),
  industries: z.array(z.string()).default([]),
  license: optionalText,
  copyright: optionalText,
  blocks: z.array(z.any()).default([]),
  assets: z.array(z.any()).default([]),
  analytics: z.any().optional(),
  featured: z.boolean().default(false),
  seoTitle: optionalText,
  seoDescription: optionalText,
  ogImage: optionalText,
})
export type ProjectInput = z.input<typeof projectSchema>
const testimonialSchema = z.object({ quote: z.string().trim().min(10, "Write at least 10 characters"), clientName: z.string().trim().min(2, "Enter the client's name"), clientRole: optionalText, company: optionalText, avatarUrl: imagePath.nullable().optional(), featured: z.boolean().default(false), published: z.boolean().default(true), sortOrder: z.coerce.number().int().default(0) })
export type TestimonialInput = z.input<typeof testimonialSchema>
const postSchema = z.object({ slug, title: z.string().trim().min(1, "Title is required"), excerpt: z.string().trim().min(1, "Excerpt is required"), content: z.string().trim().min(1, "Content is required"), category: z.string().trim().min(1, "Category is required"), featuredImage: imagePath, author: z.string().trim().min(1, "Author is required"), tags: z.array(z.string()).default([]), published: z.boolean().default(false), publishedAt: z.coerce.date().nullable().optional(), seoTitle: optionalText, seoDescription: optionalText, seoKeywords: optionalText, featured: z.boolean().default(false) })
export type PostInput = z.input<typeof postSchema>

export async function listTestimonials() { await requireAdmin(); return db.select().from(testimonials).orderBy(desc(testimonials.featured), testimonials.sortOrder, desc(testimonials.createdAt)) }
export async function saveTestimonial(input: TestimonialInput & { id?: string }): Promise<SaveResult> {
  await requireAdmin()
  const parsed = testimonialSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: describeIssue(parsed.error) }
  try {
    const values = { ...parsed.data, updatedAt: new Date() }
    const saved = input.id ? await db.update(testimonials).set(values).where(eq(testimonials.id, input.id)).returning() : await db.insert(testimonials).values(values).returning()
    if (!saved[0]) return { ok: false, error: "That testimonial no longer exists. Reload the page." }
    revalidatePublicSite()
    return { ok: true, id: saved[0].id }
  } catch (error) {
    console.error("[cms] Could not save testimonial", error)
    return { ok: false, error: "Could not save the testimonial. Please try again." }
  }
}
export async function deleteTestimonial(id: string) { await requireAdmin(); await db.delete(testimonials).where(eq(testimonials.id, id)); revalidatePublicSite() }

export async function listProjects() {
  await requireAdmin()
  await ensureSchema()
  return db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      subtitle: projects.subtitle,
      status: projects.status,
      category: projects.category,
      year: projects.year,
      thumbnail: projects.thumbnail,
      client: projects.client,
      overview: projects.overview,
      problem: projects.problem,
      approach: projects.approach,
      solution: projects.solution,
      outcome: projects.outcome,
      images: projects.images,
      featured: projects.featured,
      seoTitle: projects.seoTitle,
      seoDescription: projects.seoDescription,
      blocksCount: sql<number>`case when jsonb_typeof(${projects.blocks}) = 'array' then jsonb_array_length(${projects.blocks}) else 0 end`.as("blocks_count"),
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .orderBy(desc(projects.createdAt))
}

export async function getProject(id: string) {
  await requireAdmin()
  await ensureSchema()
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  return rows[0] ?? null
}

export async function saveProject(input: ProjectInput & { id?: string }): Promise<SaveResult> {
  await requireAdmin()
  await ensureSchema()
  const parsed = projectSchema.safeParse({
    ...input,
    thumbnail: toImageUrl(input.thumbnail) || "/placeholder.jpg",
    images: (input.images ?? []).map(toImageUrl).filter(Boolean),
  })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.path[0] === "thumbnail" ? "Upload a thumbnail image before saving." : describeIssue(parsed.error) }
  const data = parsed.data
  try {
    const clash = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, data.slug)).limit(1)
    if (clash[0] && clash[0].id !== input.id) return { ok: false, error: `Another project already uses the address /projects/${data.slug}. Change the slug.` }
    const values = {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      updatedAt: new Date(),
    }
    const saved = input.id
      ? await db.update(projects).set(values).where(eq(projects.id, input.id)).returning()
      : await db.insert(projects).values(values).returning()
    if (!saved[0]) return { ok: false, error: "That project no longer exists. Reload the page." }
    revalidatePublicSite()
    return { ok: true, id: saved[0].id }
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: `Another project already uses the address /projects/${data.slug}. Change the slug.` }
    console.error("[cms] Could not save project", error)
    return { ok: false, error: "Could not save the project. Please try again." }
  }
}

export async function duplicateProject(id: string): Promise<SaveResult> {
  await requireAdmin()
  await ensureSchema()
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  const source = rows[0]
  if (!source) return { ok: false, error: "Source project not found" }

  const baseSlug = `${source.slug}-copy`
  let newSlug = baseSlug
  let count = 1
  while (true) {
    const existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, newSlug)).limit(1)
    if (!existing.length) break
    count++
    newSlug = `${baseSlug}-${count}`
  }

  const { id: _, createdAt: __, updatedAt: ___, ...rest } = source
  const [cloned] = await db.insert(projects).values({
    ...rest,
    slug: newSlug,
    title: `${source.title} (Copy)`,
    status: "draft",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning()

  revalidatePublicSite()
  return { ok: true, id: cloned.id }
}

export async function updateProjectStatus(id: string, status: "draft" | "published" | "scheduled" | "unlisted", scheduledAt?: string | null): Promise<SaveResult> {
  await requireAdmin()
  await ensureSchema()
  try {
    const [saved] = await db.update(projects).set({
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      updatedAt: new Date(),
    }).where(eq(projects.id, id)).returning()
    if (!saved) return { ok: false, error: "Project not found" }
    revalidatePublicSite()
    return { ok: true, id: saved.id }
  } catch (error) {
    console.error("[cms] Could not update project status", error)
    return { ok: false, error: "Failed to update project status." }
  }
}

export async function deleteProject(id: string) { await requireAdmin(); const [removed] = await db.delete(projects).where(eq(projects.id, id)).returning(); revalidatePublicSite(); if (removed) await deleteBlobs([removed.thumbnail, ...(removed.images ?? [])]) }

export async function listPosts() { await requireAdmin(); return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)) }
export async function savePost(input: PostInput & { id?: string }): Promise<SaveResult> {
  await requireAdmin()
  const parsed = postSchema.safeParse({ ...input, featuredImage: toImageUrl(input.featuredImage) || "/placeholder.jpg" })
  if (!parsed.success) return { ok: false, error: describeIssue(parsed.error) }
  const data = parsed.data
  try {
    const clash = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, data.slug)).limit(1)
    if (clash[0] && clash[0].id !== input.id) return { ok: false, error: `Another note already uses the address /blog/${data.slug}. Change the slug.` }
    const values = { ...data, publishedAt: data.published ? data.publishedAt ?? new Date() : null, updatedAt: new Date() }
    const saved = input.id ? await db.update(blogPosts).set(values).where(eq(blogPosts.id, input.id)).returning() : await db.insert(blogPosts).values(values).returning()
    if (!saved[0]) return { ok: false, error: "That note no longer exists. Reload the page." }
    revalidatePublicSite()
    return { ok: true, id: saved[0].id }
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: `Another note already uses the address /blog/${data.slug}. Change the slug.` }
    console.error("[cms] Could not save note", error)
    return { ok: false, error: "Could not save the note. Please try again." }
  }
}
export async function deletePost(id: string) { await requireAdmin(); const [removed] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning(); revalidatePublicSite(); if (removed) await deleteBlobs([removed.featuredImage]) }

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120, "Please shorten your name to 120 characters."),
  email: z.string().trim().email("Please enter a valid email address.").max(200, "Please use a shorter email address."),
  company: z.string().trim().max(160, "Please shorten the company name to 160 characters.").optional(),
  message: z.string().trim().min(10, "Please tell me a little more (at least 10 characters).").max(5000, "Please keep your message under 5,000 characters."),
  website: z.string().trim().max(200).optional(),
  packageInterest: z.string().trim().max(60).optional(),
  budget: z.string().trim().max(60).optional(),
  timeline: z.string().trim().max(60).optional(),
})
export type ContactInput = z.input<typeof contactSchema>
export type ContactResult = { ok: true } | { ok: false; error: string }

// To Prajesh: the enquiry, with Reply going straight to the visitor.
async function notifyNewEnquiry(data: { name: string; email: string; company?: string; message: string; packageInterest?: string; budget?: string; timeline?: string }) {
  const result = await sendEmail({ to: process.env.CONTACT_NOTIFICATION_EMAIL || ADMIN_EMAIL, replyTo: data.email, ...enquiryNotificationEmail(data) })
  if (!result.ok) console.error("[contact] Notification email failed:", result.error)
}

// To the visitor: a short "got it" with a copy of their message. Capped at two a day per
// address, so the form can't be used to flood someone else's inbox.
async function sendEnquiryAutoReply(data: { name: string; email: string; message: string }) {
  const sentToday = await db.select({ id: contacts.id }).from(contacts).where(and(eq(contacts.email, data.email), gte(contacts.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))).limit(3)
  if (sentToday.length > 2) return
  const result = await sendEmail({ to: data.email, replyTo: ADMIN_EMAIL, ...enquiryAutoReplyEmail(data) })
  if (!result.ok) console.error("[contact] Auto-reply failed:", result.error)
}

export async function submitContact(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }
  const data = parsed.data
  if (data.website) return { ok: true }
  try {
    // Ignore an identical message sent twice within a minute (a double click), but keep follow-ups.
    const recent = await db.select({ id: contacts.id }).from(contacts).where(and(eq(contacts.email, data.email), eq(contacts.message, data.message), gte(contacts.createdAt, new Date(Date.now() - 60_000)))).limit(1)
    if (recent.length) return { ok: true }
    await ensureSchema()
    await db.insert(contacts).values({ name: data.name, email: data.email, company: data.company, message: data.message, packageInterest: data.packageInterest || null, budget: data.budget || null, timeline: data.timeline || null })
  } catch (error) {
    console.error("[contact] Could not save enquiry", error)
    return { ok: false, error: `Sorry, the message couldn't be sent right now. Please email me at ${ADMIN_EMAIL}.` }
  }
  // Send the emails after responding, so a slow or failed email never blocks the visitor.
  after(async () => {
    await notifyNewEnquiry(data).catch((error) => console.error("[contact] Notification email failed", error))
    await sendEnquiryAutoReply(data).catch((error) => console.error("[contact] Auto-reply failed", error))
    // Every enquiry also becomes a contact in Resend's "Leads" segment.
    const lead = await addLead({ email: data.email, name: data.name, packageInterest: data.packageInterest, budget: data.budget, timeline: data.timeline }).catch((error: unknown) => ({ ok: false as const, error: String(error) }))
    if (!lead.ok) console.error("[contact] Could not add the lead to Resend:", lead.error)
  })
  revalidatePath("/admin")
  return { ok: true }
}
export async function listContacts() { await requireAdmin(); await ensureSchema(); return db.select().from(contacts).orderBy(desc(contacts.createdAt)) }
export async function updateContact(id: string, status: string, notes: string) { await requireAdmin(); await db.update(contacts).set({ status: z.enum(["new", "read", "replied", "archived"]).parse(status), notes: notes.trim(), updatedAt: new Date() }).where(eq(contacts.id, id)); revalidatePath("/admin") }
export async function deleteContact(id: string) { await requireAdmin(); await db.delete(contacts).where(eq(contacts.id, id)); revalidatePath("/admin") }
