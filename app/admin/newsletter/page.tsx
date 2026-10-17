import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { desc, eq } from "drizzle-orm"
import { auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { blogPosts } from "@/lib/db/schema"
import { listIssues, listSubscribers, refreshIssueStatuses, sendReadiness, sentNoteIds } from "@/lib/newsletter-issues"
import { NewsletterManager } from "@/components/admin/newsletter-manager"

export const metadata: Metadata = { title: "Newsletter · Content studio", robots: { index: false, follow: false } }

export const dynamic = "force-dynamic"

export default async function AdminNewsletterPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) redirect("/admin")
  await ensureSchema()
  const [issues, subscribers, readiness, notes, sent] = await Promise.all([
    listIssues().then(refreshIssueStatuses),
    listSubscribers(),
    sendReadiness(),
    db.select({ id: blogPosts.id, title: blogPosts.title, slug: blogPosts.slug, publishedAt: blogPosts.publishedAt }).from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.publishedAt)),
    sentNoteIds(),
  ])
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <a href="/admin" className="text-xs uppercase tracking-widest hover:opacity-60">← Content studio</a>
        <div className="mt-8"><NewsletterManager issues={issues} subscribers={subscribers} readiness={readiness} notes={notes} sentNoteIds={sent} /></div>
      </div>
    </main>
  )
}
