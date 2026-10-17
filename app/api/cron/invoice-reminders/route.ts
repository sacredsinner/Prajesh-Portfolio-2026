import { and, eq, isNotNull, isNull, lt, or } from "drizzle-orm"
import { NextResponse } from "next/server"
import { ADMIN_EMAIL } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { invoices } from "@/lib/db/schema"
import { amountLabel, documentUrl } from "@/lib/documents"
import { sendEmail } from "@/lib/email"
import { invoiceReminderEmail, renderEmail, textToHtml } from "@/lib/email-templates"
import { formatDate, today } from "@/lib/invoices"
import { getBusinessSettings } from "@/lib/settings"
import { SITE_URL } from "@/lib/site"

// Daily (vercel.json → crons): a polite reminder for each sent invoice that's past due.
// At most one a week per invoice and three in total, so running it twice is harmless.
// If CRON_SECRET is set in Vercel, only Vercel's scheduler can trigger it.
export const dynamic = "force-dynamic"

const WEEK = 7 * 24 * 60 * 60 * 1000
const MAX_REMINDERS = 3

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await ensureSchema()
  const settings = await getBusinessSettings()
  if (!settings.remindersEnabled) return NextResponse.json({ reminded: 0, skipped: "Reminders are switched off." })

  const due = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.kind, "invoice"),
        eq(invoices.status, "sent"),
        isNotNull(invoices.clientEmail),
        lt(invoices.dueDate, today()),
        lt(invoices.reminderCount, MAX_REMINDERS),
        or(isNull(invoices.remindedAt), lt(invoices.remindedAt, new Date(Date.now() - WEEK))),
      ),
    )
    .limit(50)

  const reminded: string[] = []
  for (const row of due) {
    const result = await sendEmail({
      to: row.clientEmail!,
      replyTo: ADMIN_EMAIL,
      ...invoiceReminderEmail({ number: row.number, clientName: row.clientName, amount: amountLabel(row), dueDate: formatDate(row.dueDate), url: documentUrl(row.publicToken), businessName: settings.businessName }),
    })
    if (!result.ok) {
      console.error(`[reminders] ${row.number}:`, result.error)
      continue
    }
    await db.update(invoices).set({ remindedAt: new Date(), reminderCount: row.reminderCount + 1, updatedAt: new Date() }).where(eq(invoices.id, row.id))
    reminded.push(`${row.number} (${row.clientName}, ${amountLabel(row)})`)
  }

  if (reminded.length) {
    const text = `Payment reminders went out today for:\n\n${reminded.map((line) => `• ${line}`).join("\n")}\n\nMark invoices as paid in the content studio to stop reminders.`
    await sendEmail({
      to: process.env.CONTACT_NOTIFICATION_EMAIL || ADMIN_EMAIL,
      subject: `Payment reminders sent (${reminded.length})`,
      text,
      html: renderEmail({ preheader: `${reminded.length} payment reminder${reminded.length === 1 ? "" : "s"} sent today.`, kicker: "Invoices", heading: "Reminders sent", bodyHtml: textToHtml(text), cta: { label: "Open Invoices", url: `${SITE_URL}/admin/invoices` } }),
    }).catch((error) => console.error("[reminders] Summary email failed", error))
  }
  return NextResponse.json({ reminded: reminded.length })
}
