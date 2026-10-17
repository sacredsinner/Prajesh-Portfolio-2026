import "server-only"

import { Resend } from "resend"
import { CONTACT_EMAIL } from "@/lib/site"

// shakyaprajesh.com.np is set up in Resend (its DKIM, SPF and MX records are in the
// domain's Vercel DNS), so mail goes out from the site's own domain. Replies still
// reach Gmail through replyTo. RESEND_FROM_EMAIL can override the sender.
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL?.trim() || "Prajesh Shakya <hello@shakyaprajesh.com.np>"

// Resend's shared test sender. It can only deliver to the email address that owns the
// Resend account, so it's only used if the domain above stops working.
const TEST_SENDER = "Prajesh Shakya <onboarding@resend.dev>"

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

// Resend allows only a few API requests a second. If it answers "rate limit exceeded",
// wait a moment and try again rather than dropping the email or sign-up.
export async function withRateLimitRetry<T extends { error: { name: string } | null }>(call: () => Promise<T>, attempts = 4): Promise<T> {
  let result = await call()
  for (let attempt = 1; attempt < attempts && result.error?.name === "rate_limit_exceeded"; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    result = await call()
  }
  return result
}

type EmailMessage = {
  to: string | string[]
  subject: string
  text: string
  html?: string
  replyTo?: string | string[]
  attachments?: { filename: string; content: Buffer }[]
}

export type SendEmailResult = { ok: true; id: string | null } | { ok: false; error: string }

export async function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  const resend = getResend()
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set." }

  // hello@shakyaprajesh.com.np only sends (the domain has no inbox), so replies go to Gmail
  // unless the email says otherwise.
  message = { ...message, replyTo: message.replyTo ?? CONTACT_EMAIL }
  let response = await withRateLimitRetry(() => resend.emails.send({ ...message, from: EMAIL_FROM }))
  // If the domain isn't verified for this API key, fall back to the test sender so
  // emails to the account owner (enquiry alerts, password resets) still arrive.
  if (response.error && /verif/i.test(response.error.message ?? "")) {
    console.error(`[email] Resend won't send from ${EMAIL_FROM}: ${response.error.message} Falling back to the test sender.`)
    response = await withRateLimitRetry(() => resend.emails.send({ ...message, from: TEST_SENDER }))
  }
  if (response.error) {
    console.error("[email] Resend rejected the email", response.error)
    return { ok: false, error: response.error.message || "Resend rejected the email." }
  }
  return { ok: true, id: response.data?.id ?? null }
}
