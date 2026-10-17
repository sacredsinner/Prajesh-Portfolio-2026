import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { SITE_URL } from "@/lib/site"

// Newsletter sign-ups use double opt-in: the form emails a signed link, and only a
// confirmed address is added to Resend (see lib/resend-contacts.ts). The link is
// signed with NEWSLETTER_SECRET (or BETTER_AUTH_SECRET) and lasts seven days.

const LINK_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000

function secret() {
  return process.env.NEWSLETTER_SECRET || process.env.BETTER_AUTH_SECRET || ""
}

function sign(email: string, issuedAt: number) {
  return createHmac("sha256", secret()).update(`newsletter-confirm:${email.toLowerCase()}:${issuedAt}`).digest("base64url")
}

export function confirmationUrl(email: string) {
  const issuedAt = Date.now()
  const params = new URLSearchParams({ email, t: String(issuedAt), sig: sign(email, issuedAt) })
  return `${SITE_URL}/api/newsletter/confirm?${params.toString()}`
}

export function verifyConfirmation(email: string, t: string, sig: string) {
  if (!secret() || !email || !/^\d{13}$/.test(t) || !sig) return false
  const issuedAt = Number(t)
  const age = Date.now() - issuedAt
  if (age < 0 || age > LINK_LIFETIME_MS) return false
  const expected = Buffer.from(sign(email, issuedAt))
  const given = Buffer.from(sig)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
