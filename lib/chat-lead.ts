import "server-only"

import { revalidatePath } from "next/cache"
import { and, eq, gte } from "drizzle-orm"
import { db } from "@/lib/db"
import { contacts } from "@/lib/db/schema"
import { ADMIN_EMAIL } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { renderEmail, detailsBlock, textToHtml } from "@/lib/email-templates"
import { addLead } from "@/lib/resend-contacts"
import { ensureSchema } from "@/lib/db/migrate"
import { SITE_URL } from "@/lib/site"

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
const PHONE_REGEX = /(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\b\d{10,12}\b)/

export async function detectAndSaveChatLead(messages: any[]) {
  if (!Array.isArray(messages) || messages.length === 0) return

  const userMessages = messages.filter((m) => m && m.role === "user")
  if (userMessages.length === 0) return

  // Extract text from the latest user message
  const lastUserMsg = userMessages[userMessages.length - 1]
  const lastText =
    typeof lastUserMsg.content === "string"
      ? lastUserMsg.content
      : Array.isArray(lastUserMsg.parts)
      ? lastUserMsg.parts.map((p: any) => p.text || "").join(" ")
      : ""

  const emailMatch = lastText.match(EMAIL_REGEX)
  const phoneMatch = lastText.match(PHONE_REGEX)

  let email = emailMatch ? emailMatch[0].toLowerCase() : null
  let phone = phoneMatch ? phoneMatch[0].trim() : null

  // If not found in the latest message, check combined user messages
  if (!email && !phone) {
    const allUserText = userMessages
      .map((m) => (typeof m.content === "string" ? m.content : JSON.stringify(m.parts || "")))
      .join(" ")
    const e = allUserText.match(EMAIL_REGEX)
    const p = allUserText.match(PHONE_REGEX)
    if (e) email = e[0].toLowerCase()
    if (p) phone = p[0].trim()
  }

  // If neither email nor phone is found, there is no lead to capture yet
  if (!email && !phone) return

  const conversationTranscript = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const sender = m.role === "user" ? "Visitor" : "Praj (AI)"
      const text =
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.parts)
          ? m.parts.map((p: any) => p.text || "").join(" ")
          : ""
      return `${sender}:\n${text.trim()}`
    })
    .join("\n\n")

  // Detect package interest from the dialogue
  let packageInterest = null
  const combinedLower = conversationTranscript.toLowerCase()
  if (combinedLower.includes("system")) packageInterest = "System (Large Project)"
  else if (combinedLower.includes("identity")) packageInterest = "Identity (Medium Project)"
  else if (combinedLower.includes("foundation")) packageInterest = "Foundation (Small Project)"

  try {
    const fallbackEmail = `${(phone || "chat-lead").replace(/[^0-9a-zA-Z]/g, "")}@chat-lead.local`
    const primaryEmail = email || fallbackEmail

    // De-duplicate: ignore if we already saved this exact lead within the last 15 minutes
    const recent = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(
        and(
          eq(contacts.email, primaryEmail),
          gte(contacts.createdAt, new Date(Date.now() - 15 * 60_000))
        )
      )
      .limit(1)

    if (recent.length > 0) {
      return
    }

    await ensureSchema()

    const rawName = email ? email.split("@")[0].replace(/[._-]/g, " ") : "Chat Visitor"
    const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1)

    const fullMessage = [
      `[Captured via Praj AI Brand Strategist]`,
      email ? `Email: ${email}` : null,
      phone ? `Phone: ${phone}` : null,
      packageInterest ? `Package Interest: ${packageInterest}` : null,
      `\n--- Conversation Transcript ---\n`,
      conversationTranscript,
    ]
      .filter(Boolean)
      .join("\n")

    // 1. Save directly into contacts table (appears in /admin dashboard)
    await db.insert(contacts).values({
      name: capitalizedName,
      email: primaryEmail,
      company: phone ? `Phone: ${phone}` : "Praj AI Chat",
      message: fullMessage,
      notes: `Captured automatically by Praj AI Brand Strategist on ${new Date().toLocaleString()}`,
      packageInterest,
      status: "new",
    })

    // 2. Send instant email notification to Prajesh
    const recipient = process.env.CONTACT_NOTIFICATION_EMAIL || ADMIN_EMAIL
    const rows: [string, string][] = [
      ["Lead Name", capitalizedName],
      ...(email ? [["Email", `<a href="mailto:${email}">${email}</a>`] as [string, string]] : []),
      ...(phone ? [["Phone", `<a href="tel:${phone}">${phone}</a>`] as [string, string]] : []),
      ...(packageInterest ? [["Package Interest", packageInterest] as [string, string]] : []),
      ["Channel", "Praj AI Chat"],
    ]

    const emailHtml = renderEmail({
      preheader: `New chat lead: ${email || phone}`,
      kicker: "Praj AI Chat Lead",
      heading: `New Lead: ${capitalizedName}`,
      bodyHtml: detailsBlock(rows) + textToHtml(fullMessage),
      cta: { label: "View in Content Studio", url: `${SITE_URL}/admin?tab=contacts` },
    })

    await sendEmail({
      to: recipient,
      replyTo: email || recipient,
      subject: `New Lead from Praj AI Chat: ${capitalizedName}${phone ? ` (${phone})` : ""}`,
      html: emailHtml,
      text: `New lead from Praj AI Chat:\nName: ${capitalizedName}\nEmail: ${email || "N/A"}\nPhone: ${phone || "N/A"}\n\n${fullMessage}\n\nManage in Content Studio: ${SITE_URL}/admin?tab=contacts`,
    }).catch((err) => console.error("[praj-lead] Email notification failed:", err))

    // 3. Add to Resend audience if an email exists
    if (email) {
      await addLead({
        email,
        name: capitalizedName,
        packageInterest: packageInterest || undefined,
      }).catch((err) => console.error("[praj-lead] Resend sync failed:", err))
    }

    revalidatePath("/admin")
    console.log(`[praj-lead] Successfully captured chat lead: ${email || phone}`)
  } catch (error) {
    console.error("[praj-lead] Could not record chat lead:", error)
  }
}
