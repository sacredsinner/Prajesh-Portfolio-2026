"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { EMAIL_FROM, getResend } from "@/lib/email"

// A "use server" file may only export async functions. Exporting anything else
// (it previously exported a plain array) makes every Server Action on /admin fail.

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(10000),
})

export type AdminEmailInput = z.infer<typeof emailSchema>
export type AdminEmailResult = { ok: true; id: string | null } | { ok: false; error: string }

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

export async function sendAdminEmail(input: unknown): Promise<AdminEmailResult> {
  await requireAdmin()
  const parsed = emailSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Check the recipient, subject and message." }
  const resend = getResend()
  if (!resend) return { ok: false, error: "Email isn't set up yet. Add RESEND_API_KEY to the Vercel project." }

  const response = await resend.emails.send({
    from: EMAIL_FROM,
    to: parsed.data.to,
    replyTo: ADMIN_EMAIL,
    subject: parsed.data.subject,
    text: parsed.data.text,
  })
  if (response.error) {
    console.error("[email] Admin email send failed", response.error)
    return { ok: false, error: "Resend rejected the email. The test sender can only email your own address, so verify your domain in Resend and set RESEND_FROM_EMAIL." }
  }
  return { ok: true, id: response.data?.id ?? null }
}
