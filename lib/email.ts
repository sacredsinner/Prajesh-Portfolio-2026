import "server-only"

import { Resend } from "resend"

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

type EmailMessage = {
  to: string | string[]
  subject: string
  text: string
  html?: string
  replyTo?: string | string[]
}

export type SendEmailResult = { ok: true; id: string | null } | { ok: false; error: string }

export async function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  const resend = getResend()
  if (!resend) return { ok: false, error: "RESEND_API_KEY is not set." }

  let response = await resend.emails.send({ ...message, from: EMAIL_FROM })
  // If the domain isn't verified for this API key, fall back to the test sender so
  // emails to the account owner (enquiry alerts, password resets) still arrive.
  if (response.error && /verif/i.test(response.error.message ?? "")) {
    console.error(`[email] Resend won't send from ${EMAIL_FROM}: ${response.error.message} Falling back to the test sender.`)
    response = await resend.emails.send({ ...message, from: TEST_SENDER })
  }
  if (response.error) {
    console.error("[email] Resend rejected the email", response.error)
    return { ok: false, error: response.error.message || "Resend rejected the email." }
  }
  return { ok: true, id: response.data?.id ?? null }
}
