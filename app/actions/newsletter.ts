"use server"

import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { newsletterConfirmEmail } from "@/lib/email-templates"
import { confirmationUrl } from "@/lib/newsletter"
import { isSubscribed } from "@/lib/resend-contacts"

// A "use server" file may only export async functions (and types).

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200, "Use a shorter email address."),
  website: z.string().max(200).optional(), // honeypot: people never see it, bots fill it in
})

export type NewsletterResult = { ok: true } | { ok: false; error: string }

// Step 1 of double opt-in: email a confirmation link. The answer is the same whether or
// not the address is already subscribed, so the form can't be used to look people up.
export async function subscribeToNewsletter(input: unknown): Promise<NewsletterResult> {
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a valid email address." }
  const { email, website } = parsed.data
  if (website) return { ok: true }

  const already = await isSubscribed(email).catch(() => false)
  if (already) return { ok: true }

  const result = await sendEmail({ to: email, ...newsletterConfirmEmail(confirmationUrl(email)) })
  if (!result.ok) {
    console.error("[newsletter] Confirmation email failed:", result.error)
    return { ok: false, error: "Sorry, that didn't work. Please try again in a moment." }
  }
  return { ok: true }
}
