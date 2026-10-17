"use server"

import { desc, eq, ne } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { contacts } from "@/lib/db/schema"
import { sendEmail } from "@/lib/email"
import { adminMessageEmail } from "@/lib/email-templates"
import { addLead } from "@/lib/resend-contacts"

// A "use server" file may only export async functions. Exporting anything else
// (it previously exported a plain array) makes every Server Action on /admin fail.

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(10000),
})

const replySchema = z.object({
  contactId: z.string().uuid(),
  subject: z.string().trim().min(1, "Add a subject.").max(200),
  text: z.string().trim().min(1, "Write a message.").max(10000),
})

export type AdminEmailInput = z.infer<typeof emailSchema>
export type AdminEmailResult = { ok: true; id: string | null } | { ok: false; error: string }
export type LeadSyncResult = { ok: true; added: number; existing: number; failed: number } | { ok: false; error: string }

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

// Email tab: a branded email from the site's domain; the reply comes to your Gmail.
export async function sendAdminEmail(input: unknown): Promise<AdminEmailResult> {
  await requireAdmin()
  const parsed = emailSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Check the recipient, subject and message." }
  const result = await sendEmail({ to: parsed.data.to, replyTo: ADMIN_EMAIL, ...adminMessageEmail({ subject: parsed.data.subject, text: parsed.data.text }) })
  if (!result.ok) return { ok: false, error: `The email wasn't sent: ${result.error}` }
  return { ok: true, id: result.id }
}

// Reply on an enquiry: quotes their message underneath and marks the enquiry "replied".
export async function replyToContact(input: unknown): Promise<AdminEmailResult> {
  await requireAdmin()
  const parsed = replySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the subject and message." }
  const { contactId, subject, text } = parsed.data

  const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1)
  if (!contact) return { ok: false, error: "That enquiry no longer exists. Reload the page." }

  const sentOn = contact.createdAt.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
  const result = await sendEmail({
    to: contact.email,
    replyTo: ADMIN_EMAIL,
    ...adminMessageEmail({ subject, text, quote: { label: `Your message, ${sentOn}`, text: contact.message } }),
  })
  if (!result.ok) return { ok: false, error: `The reply wasn't sent: ${result.error}` }

  const stamp = new Date().toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
  const notes = [contact.notes?.trim(), `Replied ${stamp}: "${subject}"`].filter(Boolean).join("\n")
  await db.update(contacts).set({ status: "replied", notes, updatedAt: new Date() }).where(eq(contacts.id, contactId))
  revalidatePath("/admin")
  return { ok: true, id: result.id }
}

// Contacts tab: puts past enquiries (not archived) into Resend's "Leads" segment.
// New enquiries are added automatically; running this again is harmless.
export async function syncLeadsToResend(): Promise<LeadSyncResult> {
  await requireAdmin()
  const rows = await db.select({ email: contacts.email, name: contacts.name }).from(contacts).where(ne(contacts.status, "archived")).orderBy(desc(contacts.createdAt))
  const people = new Map<string, string>()
  for (const row of rows) {
    const email = row.email.trim().toLowerCase()
    if (!people.has(email)) people.set(email, row.name)
  }
  let added = 0
  let existing = 0
  let failed = 0
  for (const [email, name] of people) {
    const result = await addLead({ email, name })
    if (result.ok) {
      if (result.isNew) added++
      else existing++
    } else {
      // A key problem affects every contact, so stop and say so.
      if (/API key/i.test(result.error)) return { ok: false, error: `Couldn't add contacts: ${result.error}.` }
      console.error(`[leads] Could not add ${email}:`, result.error)
      failed++
    }
  }
  return { ok: true, added, existing, failed }
}
