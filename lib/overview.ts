import "server-only"

import { and, count, desc, eq, gte, inArray, ne, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { blogPosts, contacts, invoices, moodboardComments, moodboards, projects } from "@/lib/db/schema"
import { displayStatus, today } from "@/lib/invoices"
import { formatMoney, isCurrency, type Currency } from "@/lib/money"
import { NEWSLETTER_SEGMENT, LEADS_SEGMENT, countSegment } from "@/lib/resend-contacts"

// Numbers and lists for the admin overview. Every query is cheap; the Resend counts
// are fetched with a short timeout so a slow API never holds up the page.

export type Overview = Awaited<ReturnType<typeof getOverview>>

const sumByCurrency = (rows: { currency: string; total: string }[]) => {
  const totals: Partial<Record<Currency, number>> = {}
  for (const row of rows) if (isCurrency(row.currency)) totals[row.currency] = (totals[row.currency] ?? 0) + Number(row.total)
  return (Object.entries(totals) as [Currency, number][]).map(([code, amount]) => formatMoney(amount, code))
}

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T) => Promise.race([promise.catch(() => fallback), new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))])

export async function getOverview() {
  await ensureSchema()
  const now = today()
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const yearStart = `${now.slice(0, 4)}-01-01`

  const [
    [enquiryCounts],
    recentEnquiries,
    documents,
    boards,
    recentComments,
    [content],
    newsletterCount,
    leadsCount,
  ] = await Promise.all([
    db.select({ newCount: sql<number>`count(*) filter (where ${contacts.status} = 'new')::int`, monthCount: sql<number>`count(*) filter (where ${contacts.createdAt} >= ${monthAgo})::int` }).from(contacts),
    db.select({ id: contacts.id, name: contacts.name, company: contacts.company, email: contacts.email, status: contacts.status, packageInterest: contacts.packageInterest, budget: contacts.budget, createdAt: contacts.createdAt }).from(contacts).where(ne(contacts.status, "archived")).orderBy(desc(contacts.createdAt)).limit(5),
    db.select({ id: invoices.id, kind: invoices.kind, number: invoices.number, status: invoices.status, clientName: invoices.clientName, currency: invoices.currency, total: invoices.total, dueDate: invoices.dueDate, paidAt: invoices.paidAt, issueDate: invoices.issueDate }).from(invoices).where(inArray(invoices.status, ["sent", "paid", "accepted"])),
    db.select({ id: moodboards.id, title: moodboards.title, clientName: moodboards.clientName, status: moodboards.status, shared: moodboards.shared, updatedAt: moodboards.updatedAt }).from(moodboards).orderBy(desc(moodboards.updatedAt)).limit(5),
    db.select({ id: moodboardComments.id, author: moodboardComments.author, body: moodboardComments.body, kind: moodboardComments.kind, createdAt: moodboardComments.createdAt, boardTitle: moodboards.title }).from(moodboardComments).innerJoin(moodboards, eq(moodboards.id, moodboardComments.moodboardId)).where(eq(moodboardComments.fromClient, true)).orderBy(desc(moodboardComments.createdAt)).limit(5),
    db.select({ projects: sql<number>`(select count(*) from ${projects})::int`, notes: sql<number>`(select count(*) from ${blogPosts} where ${blogPosts.published})::int`, drafts: sql<number>`(select count(*) from ${blogPosts} where not ${blogPosts.published})::int` }).from(sql`(select 1) as one`),
    withTimeout(countSegment(NEWSLETTER_SEGMENT), 4000, null),
    withTimeout(countSegment(LEADS_SEGMENT), 4000, null),
  ])

  const invoiceRows = documents.filter((d) => d.kind === "invoice")
  const unpaid = invoiceRows.filter((d) => d.status === "sent")
  const overdue = unpaid.filter((d) => displayStatus(d, now) === "overdue")
  const paidThisYear = invoiceRows.filter((d) => d.status === "paid" && ((d.paidAt ? d.paidAt.toISOString().slice(0, 10) : d.issueDate) >= yearStart))
  const quotesOpen = documents.filter((d) => d.kind === "quote" && d.status === "sent" && displayStatus(d, now) === "sent")
  const quotesAccepted = documents.filter((d) => d.kind === "quote" && d.status === "accepted")

  return {
    enquiries: { newCount: enquiryCounts?.newCount ?? 0, monthCount: enquiryCounts?.monthCount ?? 0, recent: recentEnquiries },
    money: {
      outstanding: sumByCurrency(unpaid),
      overdueCount: overdue.length,
      overdueAmounts: sumByCurrency(overdue),
      paidThisYear: sumByCurrency(paidThisYear),
      unpaidList: unpaid.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")).slice(0, 5).map((d) => ({ ...d, overdue: displayStatus(d, now) === "overdue" })),
      quotesOpen: quotesOpen.length,
      quotesAccepted: quotesAccepted.length,
    },
    moodboards: { changesRequested: boards.filter((b) => b.status === "changes").length, awaiting: boards.filter((b) => b.status === "shared").length, recent: boards, recentComments },
    content,
    audience: { newsletter: newsletterCount, leads: leadsCount },
  }
}
