import "server-only"

import { Resend } from "resend"

// Without a verified domain, Resend's test sender can only deliver to the
// address that owns the Resend account. Set RESEND_FROM_EMAIL to an address on
// a verified domain (e.g. "Prajesh Shakya <hello@shakyaprajesh.com.np>") to
// email anyone else.
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL ?? "Portfolio Admin <onboarding@resend.dev>"

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}
