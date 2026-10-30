import "server-only"

import { and, count, desc, eq, gte, inArray, ne, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { blogPosts, contacts, invoices, moodboardComments, moodboards, projects } from "@/lib/db/schema"
import { displayStatus, today } from "@/lib/invoices"
import { formatMoney, isCurrency, type Currency } from "@/lib/money"
import { NEWSLETTER_SEGMENT, LEADS_SEGMENT, countSegment } from "@/lib/resend-contacts"
import { FALLBACK_OVERVIEW } from "@/lib/overview-fallback"

// Numbers and lists for the admin overview. Every query is cheap; the Resend counts
// are fetched with a short timeout so a slow API never holds up the page.

export type Overview = Awaited<ReturnType<typeof getOverview>>

const sumByCurrency = (rows: { currency: string; total: string }[]) => {
  const totals: Partial<Record<Currency, number>> = {}
  for (const row of rows) if (isCurrency(row.currency)) totals[row.currency] = (totals[row.currency] ?? 0) + Number(row.total)
  return (Object.entries(totals) as [Currency, number][]).map(([code, amount]) => formatMoney(amount, code))
}

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T) =>
  Promise.race([promise.catch(() => fallback), new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))])

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
    recentProjects,
    categoryStats,
    packageDemands,
    newsletterCount,
    leadsCount,
  ] = await Promise.all([
    db
      .select({
        newCount: sql<number>`count(*) filter (where ${contacts.status} = 'new')::int`,
        monthCount: sql<number>`count(*) filter (where ${contacts.createdAt} >= ${monthAgo})::int`,
        totalCount: sql<number>`count(*)::int`,
      })
      .from(contacts),
    db
      .select({
        id: contacts.id,
        name: contacts.name,
        company: contacts.company,
        email: contacts.email,
        message: contacts.message,
        status: contacts.status,
        notes: contacts.notes,
        packageInterest: contacts.packageInterest,
        budget: contacts.budget,
        timeline: contacts.timeline,
        createdAt: contacts.createdAt,
      })
      .from(contacts)
      .where(ne(contacts.status, "archived"))
      .orderBy(desc(contacts.createdAt))
      .limit(8),
    db
      .select({
        id: invoices.id,
        kind: invoices.kind,
        number: invoices.number,
        status: invoices.status,
        clientName: invoices.clientName,
        clientCompany: invoices.clientCompany,
        currency: invoices.currency,
        total: invoices.total,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        issueDate: invoices.issueDate,
        publicToken: invoices.publicToken,
      })
      .from(invoices)
      .where(inArray(invoices.status, ["sent", "paid", "accepted", "draft"])),
    db
      .select({
        id: moodboards.id,
        title: moodboards.title,
        clientName: moodboards.clientName,
        status: moodboards.status,
        shared: moodboards.shared,
        shareToken: moodboards.shareToken,
        updatedAt: moodboards.updatedAt,
      })
      .from(moodboards)
      .orderBy(desc(moodboards.updatedAt))
      .limit(6),
    db
      .select({
        id: moodboardComments.id,
        author: moodboardComments.author,
        body: moodboardComments.body,
        kind: moodboardComments.kind,
        createdAt: moodboardComments.createdAt,
        boardTitle: moodboards.title,
        moodboardId: moodboards.id,
      })
      .from(moodboardComments)
      .innerJoin(moodboards, eq(moodboards.id, moodboardComments.moodboardId))
      .where(eq(moodboardComments.fromClient, true))
      .orderBy(desc(moodboardComments.createdAt))
      .limit(6),
    db
      .select({
        projects: sql<number>`(select count(*) from ${projects})::int`,
        publishedProjects: sql<number>`(select count(*) from ${projects} where ${projects.status} = 'published')::int`,
        draftProjects: sql<number>`(select count(*) from ${projects} where ${projects.status} = 'draft')::int`,
        featuredProjects: sql<number>`(select count(*) from ${projects} where ${projects.featured} = true)::int`,
        notes: sql<number>`(select count(*) from ${blogPosts} where ${blogPosts.published})::int`,
        drafts: sql<number>`(select count(*) from ${blogPosts} where not ${blogPosts.published})::int`,
      })
      .from(sql`(select 1) as one`),
    db
      .select({
        id: projects.id,
        slug: projects.slug,
        title: projects.title,
        category: projects.category,
        year: projects.year,
        thumbnail: projects.thumbnail,
        status: projects.status,
        featured: projects.featured,
        analytics: projects.analytics,
        client: projects.client,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt))
      .limit(5),
    db
      .select({
        name: projects.category,
        count: sql<number>`count(*)::int`,
      })
      .from(projects)
      .groupBy(projects.category)
      .orderBy(desc(sql`count(*)`))
      .limit(6),
    db
      .select({
        name: contacts.packageInterest,
        count: sql<number>`count(*)::int`,
      })
      .from(contacts)
      .where(sql`${contacts.packageInterest} is not null and ${contacts.packageInterest} != ''`)
      .groupBy(contacts.packageInterest)
      .orderBy(desc(sql`count(*)`))
      .limit(5),
    withTimeout(countSegment(NEWSLETTER_SEGMENT), 4000, null),
    withTimeout(countSegment(LEADS_SEGMENT), 4000, null),
  ])

  const invoiceRows = documents.filter((d) => d.kind === "invoice")
  const unpaid = invoiceRows.filter((d) => d.status === "sent")
  const overdue = unpaid.filter((d) => displayStatus(d, now) === "overdue")
  const paidThisYear = invoiceRows.filter(
    (d) => d.status === "paid" && (d.paidAt ? d.paidAt.toISOString().slice(0, 10) : d.issueDate) >= yearStart
  )
  const allPaid = invoiceRows.filter((d) => d.status === "paid")
  const quotesOpen = documents.filter((d) => d.kind === "quote" && d.status === "sent" && displayStatus(d, now) === "sent")
  const quotesAccepted = documents.filter((d) => d.kind === "quote" && d.status === "accepted")

  // Generate monthly cashflow buckets for the last 6 months
  const monthlyRevenue: { month: string; label: string; amount: number; count: number }[] = []
  const currentMonthDate = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - i, 1)
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d)
    monthlyRevenue.push({ month: yearMonth, label, amount: 0, count: 0 })
  }

  for (const inv of allPaid) {
    const paidMonth = inv.paidAt
      ? inv.paidAt.toISOString().slice(0, 7)
      : (inv.issueDate ?? "").slice(0, 7)
    const bucket = monthlyRevenue.find((b) => b.month === paidMonth)
    if (bucket) {
      bucket.amount += Number(inv.total) || 0
      bucket.count += 1
    }
  }

  const recentTransactions = allPaid
    .sort((a, b) => {
      const aDate = a.paidAt ? a.paidAt.toISOString() : a.issueDate
      const bDate = b.paidAt ? b.paidAt.toISOString() : b.issueDate
      return bDate.localeCompare(aDate)
    })
    .slice(0, 5)

  return {
    enquiries: {
      newCount: enquiryCounts?.newCount ?? 0,
      monthCount: enquiryCounts?.monthCount ?? 0,
      totalCount: enquiryCounts?.totalCount ?? 0,
      recent: recentEnquiries,
    },
    money: {
      outstanding: sumByCurrency(unpaid),
      overdueCount: overdue.length,
      overdueAmounts: sumByCurrency(overdue),
      paidThisYear: sumByCurrency(paidThisYear),
      totalPaidCount: paidThisYear.length,
      unpaidList: unpaid
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
        .slice(0, 6)
        .map((d) => ({ ...d, overdue: displayStatus(d, now) === "overdue" })),
      quotesOpen: quotesOpen.length,
      quotesAccepted: quotesAccepted.length,
      recentTransactions,
      monthlyRevenue,
    },
    moodboards: {
      changesRequested: boards.filter((b) => b.status === "changes").length,
      awaiting: boards.filter((b) => b.status === "shared").length,
      totalCount: boards.length,
      recent: boards,
      recentComments,
    },
    content: {
      projects: content?.projects ?? 0,
      publishedProjects: content?.publishedProjects ?? 0,
      draftProjects: content?.draftProjects ?? 0,
      featuredProjects: content?.featuredProjects ?? 0,
      notes: content?.notes ?? 0,
      drafts: content?.drafts ?? 0,
    },
    recentProjects,
    categoryDistribution: categoryStats.filter((c) => Boolean(c.name)),
    packageDemands: packageDemands.filter((p) => Boolean(p.name)),
    audience: {
      newsletter: newsletterCount,
      leads: leadsCount,
    },
    pipeline: {
      newLeads: enquiryCounts?.newCount ?? 0,
      quotesPending: quotesOpen.length,
      activeCollaborations: boards.filter((b) => b.shared).length,
      unpaidInvoices: unpaid.length,
      overdueInvoices: overdue.length,
    },
  }
}

export async function getSafeOverview(options: { forceDemo?: boolean } = {}): Promise<Overview> {
  if (options.forceDemo) {
    return FALLBACK_OVERVIEW
  }
  try {
    return await getOverview()
  } catch (error) {
    console.warn("[overview] Database overview load failed, using fallback:", error instanceof Error ? error.message : error)
    return FALLBACK_OVERVIEW
  }
}
