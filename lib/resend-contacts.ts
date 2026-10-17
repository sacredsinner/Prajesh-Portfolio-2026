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
const LEAD_PROPERTIES = ["package_interest", "budget", "timeline", "last_enquiry"] as const
let propertiesReady: Promise<void> | null = null

// Contact properties (custom fields in Resend) that hold the enquiry details.
async function ensureLeadProperties(resend: ResendClient) {
  propertiesReady ??= (async () => {
    const list = await withRateLimitRetry(() => resend.contactProperties.list({ limit: 100 }))
    if (list.error) throw new Error(describeResendError(list.error))
    const existing = new Set(list.data.data.map((property) => property.key))
    for (const key of LEAD_PROPERTIES) {
      if (existing.has(key)) continue
      const created = await withRateLimitRetry(() => resend.contactProperties.create({ key, type: "string" }))
      if (created.error && !/exist/i.test(created.error.message)) throw new Error(describeResendError(created.error))
    }
  })()
  try {
    await propertiesReady
    return true
  } catch (error) {
    propertiesReady = null
    console.error("[resend] Could not create the lead properties:", error instanceof Error ? error.message : error)
    return false
  }
}

export async function addLead(lead: { email: string; name: string; packageInterest?: string; budget?: string; timeline?: string }): Promise<ContactResult> {
  const resend = getResend()
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set" }
  const email = lead.email.trim().toLowerCase()
  const segment = await segmentId(resend, LEADS_SEGMENT)
  const { firstName, lastName } = splitName(lead.name)
  const details = { package_interest: lead.packageInterest, budget: lead.budget, timeline: lead.timeline }
  const hasDetails = Object.values(details).some(Boolean)
  const properties = hasDetails && (await ensureLeadProperties(resend))
    ? Object.fromEntries([...Object.entries(details).filter(([, value]) => value).map(([key, value]) => [key, { type: "string" as const, value: String(value) }]), ["last_enquiry", { type: "string" as const, value: new Date().toISOString().slice(0, 10) }]])
    : undefined

  const existing = await withRateLimitRetry(() => resend.contacts.get({ email }))
  if (existing.error || !existing.data) {
    const created = await withRateLimitRetry(() => resend.contacts.create({ email, firstName, lastName, unsubscribed: false, ...(properties ? { properties } : {}), ...(segment ? { segments: [{ id: segment }] } : {}) }))
    if (!created.error) return { ok: true, isNew: true }
    if (!/exist/i.test(created.error.message)) return { ok: false, error: describeResendError(created.error) }
  } else if ((!existing.data.first_name && firstName) || properties) {
    const updated = await withRateLimitRetry(() => resend.contacts.update({ email, ...(!existing.data?.first_name && firstName ? { firstName, lastName } : {}), ...(properties ? { properties } : {}) }))
    if (updated.error) console.error("[resend] Could not update the lead:", updated.error.message)
  }
  await addToSegment(resend, email, segment)
  return { ok: true, isNew: false }
}

// How many people are in a segment (for the admin overview). Counts up to 1,000; null if
// the key can't read contacts.
export async function countSegment(name: string): Promise<number | null> {
  const resend = getResend()
  if (!resend) return null
  const segment = await segmentId(resend, name)
  if (!segment) return null
  let total = 0
  let after: string | undefined
  for (let page = 0; page < 10; page++) {
    const list = await withRateLimitRetry(() => resend.contacts.list({ segmentId: segment, limit: 100, ...(after ? { after } : {}) }))
    if (list.error) return null
    const rows = list.data.data.filter((contact) => !contact.unsubscribed)
    total += rows.length
    if (!list.data.has_more || list.data.data.length === 0) break
    after = list.data.data[list.data.data.length - 1].id
  }
  return total
}
