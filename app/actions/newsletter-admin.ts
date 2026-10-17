"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { blogPosts, newsletterIssues } from "@/lib/db/schema"
import { newsletterEmail } from "@/lib/email-templates"
import { addSubscriberByHand, cancelIssue, getIssue, listSubscribers, MAX_SCHEDULE_DAYS, sendIssue, sendReadiness, sendTestIssue, setSubscriberStatus, subscribersCsv, syncPendingSubscribers, type NewsletterIssue, type Outcome } from "@/lib/newsletter-issues"
import { SITE_URL } from "@/lib/site"

// A "use server" file may only export async functions (and types).
// Every action checks the admin session first.

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

const text = (max: number) => z.string().trim().max(max)
const optionalUrl = z.string().trim().max(500).refine((v) => !v || /^(https?:\/\/|\/)/i.test(v), "Links need to start with https:// or /").optional().or(z.literal(""))

const issueSchema = z.object({
  id: z.string().uuid().optional(),
  subject: text(150).min(1, "Add a subject line."),
  previewText: text(200).optional(),
  heading: text(150).optional(),
  body: text(30000).min(1, "Write something in the body."),
  imageUrl: optionalUrl,
  ctaLabel: text(60).optional(),
  ctaUrl: optionalUrl,
  noteId: z.string().uuid().nullable().optional(),
})

export type IssueInput = z.infer<typeof issueSchema>

const refresh = () => revalidatePath("/admin/newsletter")

// Saves a draft (new or existing). A newsletter that has gone out can't be edited.
export async function saveIssue(input: unknown): Promise<Outcome<{ id: string }>> {
  await requireAdmin()
  await ensureSchema()
  const parsed = issueSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the newsletter and try again." }
  const { id, ...data } = parsed.data
  const values = { subject: data.subject, previewText: data.previewText || null, heading: data.heading || null, body: data.body, imageUrl: data.imageUrl || null, ctaLabel: data.ctaLabel || null, ctaUrl: data.ctaUrl || null, noteId: data.noteId ?? null, updatedAt: new Date() }
  if (id) {
    const existing = await getIssue(id)
    if (!existing) return { ok: false, error: "That newsletter no longer exists." }
    if (existing.status !== "draft" && existing.status !== "failed" && existing.status !== "canceled") return { ok: false, error: "This newsletter has already been sent or scheduled. Cancel it first to make changes." }
    await db.update(newsletterIssues).set(values).where(eq(newsletterIssues.id, id))
    refresh()
    return { ok: true, id }
  }
  const [row] = await db.insert(newsletterIssues).values(values).returning({ id: newsletterIssues.id })
  refresh()
  return { ok: true, id: row.id }
}

export async function deleteIssue(id: string): Promise<Outcome> {
  await requireAdmin()
  const issue = await getIssue(z.string().uuid().parse(id))
  if (!issue) return { ok: true }
  if (issue.status === "scheduled" || issue.status === "queued" || issue.status === "sending") return { ok: false, error: "Cancel the scheduled send before deleting it." }
  await db.delete(newsletterIssues).where(eq(newsletterIssues.id, id))
  refresh()
  return { ok: true }
}

// A published note as a ready-to-edit draft: title, cover, excerpt and a link to read it.
export async function draftFromNote(noteId: string): Promise<Outcome<{ draft: IssueInput }>> {
  await requireAdmin()
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, z.string().uuid().parse(noteId))).limit(1)
  if (!post || !post.published) return { ok: false, error: "Only published notes can be sent as a newsletter." }
  const url = `/blog/${post.slug}`
  return {
    ok: true,
    draft: {
      subject: post.title,
      previewText: post.excerpt.slice(0, 200),
      heading: post.title,
      body: `${post.excerpt.trim()}\n\nI've just published a new note: [${post.title}](${url}). It's a few minutes' read.`,
      imageUrl: post.featuredImage && !post.featuredImage.startsWith("/placeholder") ? post.featuredImage : "",
      ctaLabel: "Read the note",
      ctaUrl: url,
      noteId: post.id,
    },
  }
}

export async function listPublishedNotes() {
  await requireAdmin()
  return db.select({ id: blogPosts.id, title: blogPosts.title, slug: blogPosts.slug, publishedAt: blogPosts.publishedAt }).from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.publishedAt))
}

// The exact HTML that would go out, with a harmless unsubscribe link, for the preview pane.
export async function previewIssue(input: unknown): Promise<Outcome<{ html: string; text: string; subject: string }>> {
  await requireAdmin()
  const parsed = issueSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the newsletter first." }
  const content = newsletterEmail(parsed.data, `${SITE_URL}/newsletter`)
  return { ok: true, ...content }
}

// Emails the saved draft to Prajesh's own address only.
export async function sendTest(id: string): Promise<Outcome> {
  await requireAdmin()
  const issue = await getIssue(z.string().uuid().parse(id))
  if (!issue) return { ok: false, error: "Save the newsletter first." }
  const result = await sendTestIssue(issue, process.env.CONTACT_NOTIFICATION_EMAIL || ADMIN_EMAIL)
  return result.ok ? { ok: true } : { ok: false, error: `The test wasn't sent: ${result.error}` }
}

const sendSchema = z.object({ id: z.string().uuid(), scheduledAt: z.string().datetime({ offset: true }).nullable().optional(), expectedRecipients: z.number().int().nonnegative() })

// Sends now or schedules. `expectedRecipients` is the number shown on the confirm step;
// if the list changed meanwhile, the send stops so the number can be checked again.
export async function sendNewsletter(input: unknown): Promise<Outcome<{ status: string; recipients: number }>> {
  await requireAdmin()
  const parsed = sendSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Check the send time and try again." }
  let scheduledAt: Date | null = null
  if (parsed.data.scheduledAt) {
    scheduledAt = new Date(parsed.data.scheduledAt)
    const minutesAhead = (scheduledAt.getTime() - Date.now()) / 60000
    if (minutesAhead < 5) return { ok: false, error: "Pick a time at least five minutes from now, or send it now." }
    if (minutesAhead > MAX_SCHEDULE_DAYS * 24 * 60) return { ok: false, error: `Resend can schedule at most ${MAX_SCHEDULE_DAYS} days ahead.` }
  }
  const readiness = await sendReadiness()
  if (!readiness.ready) return { ok: false, error: readiness.reason }
  if (readiness.recipients !== parsed.data.expectedRecipients) return { ok: false, error: `The list has changed: it's now ${readiness.recipients} people, not ${parsed.data.expectedRecipients}. Check the number and confirm again.` }
  const result = await sendIssue(parsed.data.id, scheduledAt)
  refresh()
  return result
}

export async function cancelNewsletter(id: string): Promise<Outcome> {
  await requireAdmin()
  const result = await cancelIssue(z.string().uuid().parse(id))
  refresh()
  return result
}

export async function loadIssue(id: string): Promise<NewsletterIssue | null> {
  await requireAdmin()
  return getIssue(z.string().uuid().parse(id))
}

// ── Subscribers ──────────────────────────────────────────────────────────────

const personSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  firstName: text(80).optional(),
  lastName: text(80).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Only add people who've agreed to get the newsletter." }) }),
})

export async function addSubscriberManually(input: unknown): Promise<Outcome> {
  await requireAdmin()
  const parsed = personSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the details." }
  const result = await addSubscriberByHand({ email: parsed.data.email, firstName: parsed.data.firstName || undefined, lastName: parsed.data.lastName || undefined })
  refresh()
  return result
}

export async function changeSubscriber(email: string, action: "unsubscribe" | "remove"): Promise<Outcome> {
  await requireAdmin()
  const parsed = z.object({ email: z.string().trim().toLowerCase().email(), action: z.enum(["unsubscribe", "remove"]) }).safeParse({ email, action })
  if (!parsed.success) return { ok: false, error: "That address doesn't look right." }
  const result = await setSubscriberStatus(parsed.data.email, parsed.data.action)
  refresh()
  return result
}

export async function retryPendingSubscribers(): Promise<Outcome<{ added: number; failed: number }>> {
  await requireAdmin()
  const result = await syncPendingSubscribers()
  refresh()
  return result
}

export async function exportSubscribersCsv(): Promise<Outcome<{ csv: string; count: number }>> {
  await requireAdmin()
  const list = await listSubscribers()
  if (list.resendError) return { ok: false, error: `Couldn't read the list from Resend: ${list.resendError}.` }
  return { ok: true, csv: subscribersCsv(list.rows), count: list.rows.length }
}
