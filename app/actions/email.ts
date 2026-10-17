"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

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
  // Sent from the site's domain; the client's reply goes to your Gmail.
  const result = await sendEmail({ to: parsed.data.to, replyTo: ADMIN_EMAIL, subject: parsed.data.subject, text: parsed.data.text })
  if (!result.ok) return { ok: false, error: `The email wasn't sent: ${result.error}` }
  return { ok: true, id: result.id }
}
