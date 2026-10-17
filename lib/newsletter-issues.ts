import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { newsletterIssues, newsletterSubscribers } from "@/lib/db/schema"
import { EMAIL_FROM, getResend, sendEmail, withRateLimitRetry } from "@/lib/email"
import { newsletterEmail } from "@/lib/email-templates"
import { addSubscriber, describeResendError, listSegment, NEWSLETTER_SEGMENT, newsletterSegmentId, removeSubscriber, segmentEmails, unsubscribeContact, type SegmentContact } from "@/lib/resend-contacts"
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site"

// Content studio → Newsletter. Issues live in Postgres (newsletter_issues); sending
// creates a Resend Broadcast to the "Website newsletter" segment, so Resend handles the
// per-reader unsubscribe link and the delivery stats.

export type NewsletterIssue = typeof newsletterIssues.$inferSelect
export type Subscriber = typeof newsletterSubscribers.$inferSelect
export type IssueStatus = "draft" | "sending" | "queued" | "scheduled" | "sent" | "canceled" | "failed"
export type Outcome<T = Record<never, never>> = ({ ok: true } & T) | { ok: false; error: string }

// A scheduled Broadcast can be at most 30 days out (Resend's limit); give it a margin.
export const MAX_SCHEDULE_DAYS = 29

export async function listIssues() {
  await ensureSchema()
  return db.select().from(newsletterIssues).orderBy(desc(newsletterIssues.updatedAt)).limit(200)
}

export async function getIssue(id: string) {
  await ensureSchema()
  const [row] = await db.select().from(newsletterIssues).where(eq(newsletterIssues.id, id)).limit(1)
  return row ?? null
}

// Notes that already went out (sent or on the way), so the compose screen can say so.
export async function sentNoteIds() {
  await ensureSchema()
  const rows = await db.select({ noteId: newsletterIssues.noteId }).from(newsletterIssues).where(inArray(newsletterIssues.status, ["sending", "queued", "scheduled", "sent"]))
  return rows.map((r) => r.noteId).filter((id): id is string => Boolean(id))
}

// ── Subscribers ──────────────────────────────────────────────────────────────

// People who confirmed on the site or were added by hand. `source` says which; a
// hand-added person must have agreed to get the newsletter.
export async function recordSubscriber(input: { email: string; firstName?: string | null; lastName?: string | null; source: "website" | "admin"; synced: boolean; syncError?: string | null }) {
  await ensureSchema()
  const now = new Date()
  const values = { email: input.email.trim().toLowerCase(), firstName: input.firstName ?? null, lastName: input.lastName ?? null, source: input.source, status: "subscribed", confirmedAt: now, syncedAt: input.synced ? now : null, syncError: input.synced ? null : input.syncError ?? null, updatedAt: now }
  await db
    .insert(newsletterSubscribers)
    .values(values)
    .onConflictDoUpdate({ target: newsletterSubscribers.email, set: { status: "subscribed", confirmedAt: now, syncedAt: values.syncedAt, syncError: values.syncError, updatedAt: now, ...(input.firstName ? { firstName: input.firstName, lastName: input.lastName ?? null } : {}) } })
}

export type SubscriberRow = { email: string; firstName: string | null; lastName: string | null; status: "subscribed" | "unsubscribed" | "pending"; source: "website" | "admin" | "resend"; since: Date | null; inResend: boolean; syncError: string | null }
export type SubscriberList = { rows: SubscriberRow[]; resendError: string | null; truncated: boolean; counts: { subscribed: number; unsubscribed: number; pending: number } }

// Resend's segment is the source of truth for who gets the newsletter; the local table
// adds sign-up dates, names and anyone Resend refused to take.
export async function listSubscribers(): Promise<SubscriberList> {
  await ensureSchema()
  const [local, remote] = await Promise.all([db.select().from(newsletterSubscribers), listSegment(NEWSLETTER_SEGMENT)])
  const byEmail = new Map<string, SubscriberRow>()
  const localByEmail = new Map(local.map((s) => [s.email, s]))
  if (remote.ok) {
    for (const c of remote.contacts) {
      const mine = localByEmail.get(c.email.toLowerCase())
      byEmail.set(c.email.toLowerCase(), {
        email: c.email,
        firstName: c.firstName ?? mine?.firstName ?? null,
        lastName: c.lastName ?? mine?.lastName ?? null,
        status: c.unsubscribed ? "unsubscribed" : "subscribed",
        source: mine ? (mine.source as "website" | "admin") : "resend",
        since: mine?.confirmedAt ?? new Date(c.createdAt),
        inResend: true,
        syncError: null,
      })
    }
  }
  for (const s of local) {
    if (byEmail.has(s.email) || s.status === "removed") continue
    if (s.status === "unsubscribed" && remote.ok) continue // gone from Resend: nothing to show
    byEmail.set(s.email, { email: s.email, firstName: s.firstName, lastName: s.lastName, status: remote.ok ? "pending" : s.status === "unsubscribed" ? "unsubscribed" : "subscribed", source: s.source as "website" | "admin", since: s.confirmedAt, inResend: false, syncError: remote.ok ? s.syncError ?? "Not in Resend yet." : null })
  }
  const rows = [...byEmail.values()].sort((a, b) => (b.since?.getTime() ?? 0) - (a.since?.getTime() ?? 0))
  const counts = { subscribed: rows.filter((r) => r.status === "subscribed").length, unsubscribed: rows.filter((r) => r.status === "unsubscribed").length, pending: rows.filter((r) => r.status === "pending").length }
  return { rows, resendError: remote.ok ? null : remote.error, truncated: remote.ok && remote.truncated, counts }
}

export async function addSubscriberByHand(input: { email: string; firstName?: string; lastName?: string }): Promise<Outcome> {
  const email = input.email.trim().toLowerCase()
  const added = await addSubscriber(email, input, { resubscribe: false })
  await recordSubscriber({ email, firstName: input.firstName, lastName: input.lastName, source: "admin", synced: added.ok, syncError: added.ok ? null : added.error })
  return added.ok ? { ok: true } : { ok: false, error: `Saved here, but Resend refused: ${added.error}.` }
}

// Pushes everyone who should be in the newsletter segment but isn't (e.g. refused while
// the key was send-only). Goes by what's actually in Resend, not by what was recorded.
export async function syncPendingSubscribers(): Promise<Outcome<{ added: number; failed: number }>> {
  await ensureSchema()
  const inSegment = await segmentEmails(NEWSLETTER_SEGMENT)
  if (!inSegment) return { ok: false, error: "Couldn't read the newsletter list from Resend. Check that RESEND_API_KEY has Full access." }
  const pending = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "subscribed"))
  let added = 0
  let failed = 0
  for (const s of pending) {
    if (inSegment.has(s.email)) continue
    const result = await addSubscriber(s.email, s, { resubscribe: false })
    if (result.ok) {
      added++
      await db.update(newsletterSubscribers).set({ syncedAt: new Date(), syncError: null, updatedAt: new Date() }).where(eq(newsletterSubscribers.email, s.email))
    } else {
      if (/API key/i.test(result.error)) return { ok: false, error: `Couldn't add subscribers: ${result.error}.` }
      failed++
      await db.update(newsletterSubscribers).set({ syncError: result.error, updatedAt: new Date() }).where(eq(newsletterSubscribers.email, s.email))
    }
  }
  return { ok: true, added, failed }
}

export async function setSubscriberStatus(email: string, action: "unsubscribe" | "remove"): Promise<Outcome> {
  await ensureSchema()
  const result = action === "unsubscribe" ? await unsubscribeContact(email) : await removeSubscriber(email)
  if (!result.ok && !/not set/i.test(result.error)) return { ok: false, error: `Resend refused: ${result.error}.` }
  await db
    .insert(newsletterSubscribers)
    .values({ email, status: action === "unsubscribe" ? "unsubscribed" : "removed", updatedAt: new Date() })
    .onConflictDoUpdate({ target: newsletterSubscribers.email, set: { status: action === "unsubscribe" ? "unsubscribed" : "removed", updatedAt: new Date() } })
  return { ok: true }
}

export function subscribersCsv(rows: SubscriberRow[]) {
  const cell = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`
  const lines = rows.map((r) => [r.email, r.firstName, r.lastName, r.status, r.source, r.since ? r.since.toISOString().slice(0, 10) : ""].map(cell).join(","))
  return ["email,first_name,last_name,status,source,subscribed_on", ...lines].join("\n")
}

// ── Sending ──────────────────────────────────────────────────────────────────

// Whether the key can manage contacts (needed for Broadcasts) and how many would get it.
export async function sendReadiness(): Promise<{ ready: true; recipients: number } | { ready: false; reason: string; recipients: null }> {
  if (!getResend()) return { ready: false, reason: "RESEND_API_KEY isn't set in Vercel, so nothing can be sent.", recipients: null }
  const list = await listSegment(NEWSLETTER_SEGMENT)
  if (!list.ok) return { ready: false, reason: `Sending is switched off because ${list.error}.`, recipients: null }
  return { ready: true, recipients: list.contacts.filter((c: SegmentContact) => !c.unsubscribed).length }
}

// Sends a test copy to Prajesh only (a normal email, not a Broadcast).
export async function sendTestIssue(issue: NewsletterIssue, to: string): Promise<Outcome> {
  const content = newsletterEmail(issue, `${SITE_URL}/newsletter`)
  const result = await sendEmail({ to, replyTo: CONTACT_EMAIL, ...content, subject: `[Test] ${content.subject}` })
  return result.ok ? { ok: true } : { ok: false, error: result.error }
}

// Creates the Broadcast and sends or schedules it. The issue is marked "sending" first
// (an atomic status change), so two clicks can't send it twice.
export async function sendIssue(id: string, scheduledAt: Date | null): Promise<Outcome<{ status: IssueStatus; recipients: number }>> {
  await ensureSchema()
  const resend = getResend()
  if (!resend) return { ok: false, error: "RESEND_API_KEY isn't set in Vercel." }
  const readiness = await sendReadiness()
  if (!readiness.ready) return { ok: false, error: readiness.reason }
  if (readiness.recipients === 0) return { ok: false, error: "Nobody is subscribed yet, so there's no one to send to." }
  const segment = await newsletterSegmentId()
  if (!segment) return { ok: false, error: "Couldn't find the newsletter segment in Resend." }

  const [claimed] = await db
    .update(newsletterIssues)
    .set({ status: "sending", error: null, updatedAt: new Date() })
    .where(and(eq(newsletterIssues.id, id), inArray(newsletterIssues.status, ["draft", "failed", "canceled"])))
    .returning()
  if (!claimed) return { ok: false, error: "This newsletter has already been sent or is on its way. Reload the page." }

  // The broadcast is named after the issue, so if an earlier attempt reached Resend but
  // the answer was lost, it's found here and adopted instead of being sent a second time.
  const broadcastName = `newsletter/${claimed.id}`
  const earlier = await withRateLimitRetry(() => resend.broadcasts.list({ limit: 100 }))
  const existing = earlier.error ? null : earlier.data.data.find((b) => b.name === broadcastName && b.status !== "draft")
  if (existing) {
    const status: IssueStatus = existing.scheduled_at && !existing.sent_at ? "scheduled" : existing.status === "sent" ? "sent" : "queued"
    await db.update(newsletterIssues).set({ status, broadcastId: existing.id, recipientCount: claimed.recipientCount ?? readiness.recipients, scheduledAt: existing.scheduled_at ? new Date(existing.scheduled_at) : null, sentAt: existing.sent_at ? new Date(existing.sent_at) : null, updatedAt: new Date() }).where(eq(newsletterIssues.id, id))
    return { ok: false, error: "This newsletter had already reached Resend from an earlier attempt, so it wasn't sent again. Its status has been updated." }
  }

  const content = newsletterEmail(claimed)
  const created = await withRateLimitRetry(() =>
    resend.broadcasts.create({
      name: broadcastName,
      segmentId: segment,
      from: EMAIL_FROM,
      replyTo: CONTACT_EMAIL,
      subject: content.subject,
      previewText: claimed.previewText?.trim() || undefined,
      html: content.html,
      text: content.text,
      send: true,
      ...(scheduledAt ? { scheduledAt: scheduledAt.toISOString() } : {}),
    }),
  )
  if (created.error) {
    // No status code means Resend may have accepted it without answering: say so, and the
    // name check above stops a second copy if it did.
    const unknown = !("statusCode" in created.error) || created.error.statusCode == null
    const error = unknown ? "Resend didn't answer. Check Broadcasts in Resend before sending again; a copy that did get through is picked up automatically." : describeResendError(created.error)
    await db.update(newsletterIssues).set({ status: "failed", error, updatedAt: new Date() }).where(eq(newsletterIssues.id, id))
    return { ok: false, error: unknown ? error : `Resend refused the broadcast: ${error}.` }
  }
  const status: IssueStatus = scheduledAt ? "scheduled" : "queued"
  await db
    .update(newsletterIssues)
    .set({ status, broadcastId: created.data.id, recipientCount: readiness.recipients, scheduledAt, sentAt: scheduledAt ? null : new Date(), updatedAt: new Date() })
    .where(eq(newsletterIssues.id, id))
  return { ok: true, status, recipients: readiness.recipients }
}

// Cancels a scheduled (or still-queued) Broadcast. Resend turns a scheduled one back
// into a draft, so the issue goes back to "draft" here too and can be sent again.
export async function cancelIssue(id: string): Promise<Outcome> {
  await ensureSchema()
  const issue = await getIssue(id)
  if (!issue) return { ok: false, error: "That newsletter no longer exists." }
  if (issue.status !== "scheduled" && issue.status !== "queued") return { ok: false, error: "Only a scheduled newsletter can be cancelled." }
  const resend = getResend()
  if (resend && issue.broadcastId) {
    const result = await withRateLimitRetry(() => resend.broadcasts.cancel(issue.broadcastId!))
    if (result.error) {
      // A queued broadcast Resend no longer knows about may already have gone out.
      if (issue.status === "queued" || !/not.?found/i.test(result.error.message)) return { ok: false, error: `Resend couldn't cancel it: ${describeResendError(result.error)}. Check Broadcasts in Resend.` }
    }
  }
  await db.update(newsletterIssues).set({ status: issue.status === "scheduled" ? "draft" : "canceled", scheduledAt: null, sentAt: null, updatedAt: new Date() }).where(eq(newsletterIssues.id, id))
  return { ok: true }
}

// Asks Resend for the real status of broadcasts still on the way, so History stays right.
export async function refreshIssueStatuses(issues: NewsletterIssue[]) {
  const updates = new Map<string, Partial<NewsletterIssue>>()
  // A send that died halfway (timeout, crash) would stay "sending" forever: after five
  // minutes with no broadcast id, call it failed so it can be opened and sent again.
  for (const issue of issues) {
    if (issue.status === "sending" && !issue.broadcastId && Date.now() - new Date(issue.updatedAt).getTime() > 5 * 60 * 1000) {
      updates.set(issue.id, { status: "failed", error: "The send didn't finish. Check Broadcasts in Resend, then send again if it isn't there." })
    }
  }
  const resend = getResend()
  const open = resend ? issues.filter((i) => i.broadcastId && (i.status === "queued" || i.status === "scheduled")) : []
  if (!resend || open.length === 0) {
    for (const [id, patch] of updates) await db.update(newsletterIssues).set({ ...patch, updatedAt: new Date() }).where(eq(newsletterIssues.id, id))
    return issues.map((i) => (updates.has(i.id) ? { ...i, ...updates.get(i.id)! } : i))
  }
  await Promise.all(
    open.slice(0, 10).map(async (issue) => {
      const got = await withRateLimitRetry(() => resend.broadcasts.get(issue.broadcastId!)).catch(() => null)
      if (!got || got.error) return
      const remote = got.data.status as string
      if (remote === "sent") updates.set(issue.id, { status: "sent", sentAt: got.data.sent_at ? new Date(got.data.sent_at) : issue.sentAt ?? new Date() })
      else if (remote === "canceled") updates.set(issue.id, { status: "canceled" }) // not in the SDK's types, but Resend's docs list it
      else if (remote === "draft" && issue.status === "scheduled") updates.set(issue.id, { status: "draft", scheduledAt: null })
    }),
  )
  for (const [id, patch] of updates) await db.update(newsletterIssues).set({ ...patch, updatedAt: new Date() }).where(eq(newsletterIssues.id, id))
  return issues.map((i) => (updates.has(i.id) ? { ...i, ...updates.get(i.id)! } : i))
}
