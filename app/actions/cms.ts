"use server"

import { and, desc, eq, gte } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { blogPosts, contacts, projects, testimonials } from "@/lib/db/schema"
import { EMAIL_FROM, getResend } from "@/lib/email"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) throw new Error("Unauthorized")
  return session.user
}

// Public pages are cached, so every content change refreshes the whole site.
function revalidatePublicSite() {
  revalidatePath("/", "layout")
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
const projectSchema = z.object({ slug, title: z.string().trim().min(1, "Title is required"), category: z.string().trim().min(1, "Category is required"), year: z.string().trim().min(1, "Year is required"), thumbnail: imagePath, client: optionalText, overview: optionalText, problem: optionalText, approach: optionalText, solution: optionalText, outcome: optionalText, images: z.array(imagePath).default([]), featured: z.boolean().default(false), seoTitle: optionalText, seoDescription: optionalText })
export type ProjectInput = z.input<typeof projectSchema>
const testimonialSchema = z.object({ quote: z.string().trim().min(10), clientName: z.string().trim().min(2), clientRole: optionalText, company: optionalText, avatarUrl: imagePath.nullable().optional(), featured: z.boolean().default(false), published: z.boolean().default(true), sortOrder: z.coerce.number().int().default(0) })
export type TestimonialInput = z.input<typeof testimonialSchema>
const postSchema = z.object({ slug, title: z.string().trim().min(1, "Title is required"), excerpt: z.string().trim().min(1, "Excerpt is required"), content: z.string().trim().min(1, "Content is required"), category: z.string().trim().min(1, "Category is required"), featuredImage: imagePath, author: z.string().trim().min(1, "Author is required"), tags: z.array(z.string()).default([]), published: z.boolean().default(false), publishedAt: z.coerce.date().nullable().optional(), seoTitle: optionalText, seoDescription: optionalText, seoKeywords: optionalText, featured: z.boolean().default(false) })
export type PostInput = z.input<typeof postSchema>

export async function listTestimonials() { await requireAdmin(); return db.select().from(testimonials).orderBy(desc(testimonials.sortOrder), desc(testimonials.createdAt)) }
export async function saveTestimonial(input: TestimonialInput & { id?: string }) { await requireAdmin(); const data = testimonialSchema.parse(input); const values = { ...data, updatedAt: new Date() }; const saved = input.id ? await db.update(testimonials).set(values).where(eq(testimonials.id, input.id)).returning() : await db.insert(testimonials).values(values).returning(); revalidatePublicSite(); return saved[0] }
export async function deleteTestimonial(id: string) { await requireAdmin(); await db.delete(testimonials).where(eq(testimonials.id, id)); revalidatePublicSite() }

export async function listProjects() { await requireAdmin(); return db.select().from(projects).orderBy(desc(projects.createdAt)) }
export async function saveProject(input: ProjectInput & { id?: string }) {
  await requireAdmin()
  const data = projectSchema.parse({
    ...input,
    thumbnail: toImageUrl(input.thumbnail),
    images: (input.images ?? []).map(toImageUrl).filter(Boolean),
  })
  const values = { ...data, updatedAt: new Date() }
  const saved = input.id
    ? await db.update(projects).set(values).where(eq(projects.id, input.id)).returning()
    : await db.insert(projects).values(values).returning()
  revalidatePublicSite()
  return saved[0]
}
export async function deleteProject(id: string) { await requireAdmin(); await db.delete(projects).where(eq(projects.id, id)); revalidatePublicSite() }

export async function listPosts() { await requireAdmin(); return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)) }
export async function savePost(input: PostInput & { id?: string }) { await requireAdmin(); const data = postSchema.parse({ ...input, featuredImage: toImageUrl(input.featuredImage) || "/placeholder.jpg" }); const values = { ...data, publishedAt: data.published ? data.publishedAt ?? new Date() : null, updatedAt: new Date() }; const saved = input.id ? await db.update(blogPosts).set(values).where(eq(blogPosts.id, input.id)).returning() : await db.insert(blogPosts).values(values).returning(); revalidatePublicSite(); return saved[0] }
export async function deletePost(id: string) { await requireAdmin(); await db.delete(blogPosts).where(eq(blogPosts.id, id)); revalidatePublicSite() }

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120, "Please shorten your name to 120 characters."),
  email: z.string().trim().email("Please enter a valid email address.").max(200, "Please use a shorter email address."),
  company: z.string().trim().max(160, "Please shorten the company name to 160 characters.").optional(),
  message: z.string().trim().min(10, "Please tell me a little more (at least 10 characters).").max(5000, "Please keep your message under 5,000 characters."),
  website: z.string().trim().max(200).optional(),
})
export type ContactInput = z.input<typeof contactSchema>
export type ContactResult = { ok: true } | { ok: false; error: string }

async function notifyNewEnquiry(data: { name: string; email: string; company?: string; message: string }) {
  const resend = getResend()
  if (!resend) return
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: process.env.CONTACT_NOTIFICATION_EMAIL ?? ADMIN_EMAIL,
    replyTo: data.email,
    subject: `New enquiry from ${data.name}${data.company ? ` (${data.company})` : ""}`,
    text: [`Name: ${data.name}`, `Email: ${data.email}`, data.company ? `Company: ${data.company}` : null, "", data.message, "", "Reply to this email to answer them, or manage it in /admin."].filter((line) => line !== null).join("\n"),
  })
  if (error) console.error("[contact] Notification email failed", error)
}

export async function submitContact(input: ContactInput): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }
  const data = parsed.data
  if (data.website) return { ok: true }
  try {
    const recent = await db.select({ id: contacts.id }).from(contacts).where(and(eq(contacts.email, data.email), gte(contacts.createdAt, new Date(Date.now() - 60_000)))).limit(1)
    if (recent.length) return { ok: true }
    await db.insert(contacts).values({ name: data.name, email: data.email, company: data.company, message: data.message })
  } catch (error) {
    console.error("[contact] Could not save enquiry", error)
    return { ok: false, error: `Sorry, the message couldn't be sent right now. Please email me at ${ADMIN_EMAIL}.` }
  }
  // Send the notification after responding, so a slow or failed email never blocks the visitor.
  after(() => notifyNewEnquiry(data).catch((error) => console.error("[contact] Notification email failed", error)))
  revalidatePath("/admin")
  return { ok: true }
}
export async function listContacts() { await requireAdmin(); return db.select().from(contacts).orderBy(desc(contacts.createdAt)) }
export async function updateContact(id: string, status: string, notes: string) { await requireAdmin(); await db.update(contacts).set({ status: z.enum(["new", "read", "replied", "archived"]).parse(status), notes: notes.trim(), updatedAt: new Date() }).where(eq(contacts.id, id)); revalidatePath("/admin") }
export async function deleteContact(id: string) { await requireAdmin(); await db.delete(contacts).where(eq(contacts.id, id)); revalidatePath("/admin") }
