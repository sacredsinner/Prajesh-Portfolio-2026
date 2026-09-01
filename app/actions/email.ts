"use server"

import { Resend } from "resend"
import { headers } from "next/headers"
import { z } from "zod"
import { auth, isAdminUser } from "@/lib/auth"

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(10000),
})

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

export async function sendAdminEmail(input: unknown) {
  await requireAdmin()
  const data = emailSchema.parse(input)
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("Email service is not configured")

  const resend = new Resend(apiKey)
  const response = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Portfolio Admin <onboarding@resend.dev>",
    to: data.to,
    subject: data.subject,
    text: data.text,
  })
  if (response.error) {
    console.error("[v0] Admin email send failed", response.error)
    throw new Error("Unable to send email")
  }
  return { id: response.data?.id ?? null }
}

export type AdminEmailInput = z.infer<typeof emailSchema>

export async function sendContactReply(input: { to: string; subject: string; text: string }) {
  return sendAdminEmail(input)
}

export const emailFeatureChecklist = [
  "Send a one-off email to any validated recipient",
  "Reply to a contact directly from the Contacts tab",
  "Use the configured Resend sender identity",
  "Show success and safe failure states in the admin UI",
  "Protect all sends with the admin session",
]
