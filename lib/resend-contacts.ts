import "server-only"

import { getResend, withRateLimitRetry } from "@/lib/email"

// People in Resend's audience, sorted into two segments:
// - "Website newsletter": confirmed newsletter subscribers (double opt-in), for Broadcasts.
// - "Leads": everyone who sends an enquiry through the contact form.
// Someone can be in both. Resend adds an unsubscribe link to every broadcast.
export const NEWSLETTER_SEGMENT = "Website newsletter"
export const LEADS_SEGMENT = "Leads"

type ResendClient = NonNullable<ReturnType<typeof getResend>>
type ResendError = { name: string; message: string }

export type ContactResult = { ok: true; isNew: boolean } | { ok: false; error: string }

// Plain-English version of the errors you can actually do something about.
export function describeResendError(error: ResendError) {
  if (error.name === "restricted_api_key") return "the Resend API key can only send emails. To add contacts it needs Full access (Resend → API Keys), saved as RESEND_API_KEY in Vercel"
  if (error.name === "invalid_api_key" || error.name === "missing_api_key") return "the Resend API key isn't valid. Check RESEND_API_KEY in Vercel"
  return error.message
}

const segmentLookups = new Map<string, Promise<string>>()

// Finds a segment by name, creating it the first time it's needed.
async function segmentId(resend: ResendClient, name: string) {
  let lookup = segmentLookups.get(name)
  if (!lookup) {
    lookup = (async () => {
      const list = await withRateLimitRetry(() => resend.segments.list({ limit: 100 }))
      if (list.error) throw new Error(describeResendError(list.error))
      const existing = list.data.data.find((segment) => segment.name === name)
      if (existing) return existing.id
      const created = await withRateLimitRetry(() => resend.segments.create({ name }))
      if (created.error) throw new Error(describeResendError(created.error))
      return created.data.id
    })()
    segmentLookups.set(name, lookup)
  }
  try {
    return await lookup
  } catch (error) {
    segmentLookups.delete(name) // try again next time
    console.error(`[resend] Could not find or create the "${name}" segment:`, error instanceof Error ? error.message : error)
    return null
  }
}

async function addToSegment(resend: ResendClient, email: string, segment: string | null) {
  if (!segment) return
  const added = await withRateLimitRetry(() => resend.contacts.segments.add({ email, segmentId: segment }))
  if (added.error && !/exist|already/i.test(added.error.message)) console.error("[resend] Could not add the contact to the segment:", added.error.message)
}

function splitName(name: string) {
  const [firstName = "", ...rest] = name.trim().split(/\s+/)
  return { firstName: firstName || undefined, lastName: rest.join(" ") || undefined }
}

export async function isSubscribed(email: string) {
  const resend = getResend()
  if (!resend) return false
  const found = await withRateLimitRetry(() => resend.contacts.get({ email }))
  return !found.error && Boolean(found.data) && !found.data.unsubscribed
}

// A confirmed newsletter sign-up: subscribed, and in the newsletter segment.
export async function addSubscriber(email: string): Promise<ContactResult> {
  const resend = getResend()
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set" }
  const segment = await segmentId(resend, NEWSLETTER_SEGMENT)

  const existing = await withRateLimitRetry(() => resend.contacts.get({ email }))
  if (existing.error || !existing.data) {
    const created = await withRateLimitRetry(() => resend.contacts.create({ email, unsubscribed: false, ...(segment ? { segments: [{ id: segment }] } : {}) }))
    if (!created.error) return { ok: true, isNew: true }
    if (!/exist/i.test(created.error.message)) return { ok: false, error: describeResendError(created.error) }
  }

  // Already a contact (a lead, someone who unsubscribed before, or a second click on the
  // link): make sure they're subscribed and in the segment. Coming back counts as new.
  const wasSubscribed = existing.data ? !existing.data.unsubscribed : false
  const updated = await withRateLimitRetry(() => resend.contacts.update({ email, unsubscribed: false }))
  if (updated.error) return { ok: false, error: describeResendError(updated.error) }
  await addToSegment(resend, email, segment)
  return { ok: true, isNew: !wasSubscribed }
}

// A contact-form enquiry: a contact in the "Leads" segment. An existing contact keeps
// their subscription setting, so this never re-subscribes someone who opted out.
export async function addLead(lead: { email: string; name: string }): Promise<ContactResult> {
  const resend = getResend()
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set" }
  const email = lead.email.trim().toLowerCase()
  const segment = await segmentId(resend, LEADS_SEGMENT)
  const { firstName, lastName } = splitName(lead.name)

  const existing = await withRateLimitRetry(() => resend.contacts.get({ email }))
  if (existing.error || !existing.data) {
    const created = await withRateLimitRetry(() => resend.contacts.create({ email, firstName, lastName, unsubscribed: false, ...(segment ? { segments: [{ id: segment }] } : {}) }))
    if (!created.error) return { ok: true, isNew: true }
    if (!/exist/i.test(created.error.message)) return { ok: false, error: describeResendError(created.error) }
  } else if (!existing.data.first_name && firstName) {
    const named = await withRateLimitRetry(() => resend.contacts.update({ email, firstName, lastName }))
    if (named.error) console.error("[resend] Could not add the lead's name:", named.error.message)
  }
  await addToSegment(resend, email, segment)
  return { ok: true, isNew: false }
}
