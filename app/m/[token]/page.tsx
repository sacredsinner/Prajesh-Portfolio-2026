import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { and, asc, eq } from "drizzle-orm"
import { BrandMark } from "@/components/brand-mark"
import { MoodboardFeedback } from "@/components/moodboards/moodboard-feedback"
import { MoodboardView } from "@/components/moodboards/moodboard-view"
import { auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { moodboardComments, moodboards } from "@/lib/db/schema"

// A client's moodboard: /m/<token>. Private (unguessable link, not indexed).
export const dynamic = "force-dynamic"

async function load(token: string) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return undefined
  await ensureSchema()
  const [row] = await db.select().from(moodboards).where(and(eq(moodboards.shareToken, token), eq(moodboards.shared, true))).limit(1)
  return row
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const row = await load((await params).token)
  return { title: row ? `${row.title} — Moodboard` : "Moodboard", robots: { index: false, follow: false } }
}

export default async function MoodboardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const row = await load(token)
  if (!row) notFound()
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const isAdmin = isAdminUser(session?.user)
  if (!isAdmin) await db.update(moodboards).set({ lastViewedAt: new Date() }).where(eq(moodboards.id, row.id))
  const comments = await db.select().from(moodboardComments).where(eq(moodboardComments.moodboardId, row.id)).orderBy(asc(moodboardComments.createdAt))
  const approved = row.status === "approved"
  const when = (date: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kathmandu" }).format(date)

  return (
    <main className="min-h-screen bg-background">
      <header className="page-container flex items-center justify-between py-6">
        <span className="inline-flex items-center gap-3"><BrandMark className="h-7 w-7" /><span className="text-[12px] font-semibold uppercase tracking-[0.3em]">Prajesh Shakya</span></span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Moodboard{approved ? " · Approved" : ""}</span>
      </header>
      <div className="page-container pb-24 pt-12">
        {isAdmin && <p className="mb-8 border border-dashed border-border p-3 text-xs text-muted-foreground">You&apos;re viewing this as the admin. This is exactly what your client sees.</p>}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{row.clientName ? `For ${row.clientName}` : "Direction"}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">{row.title}</h1>
        {row.intro && <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{row.intro}</p>}
        <div className="mt-16"><MoodboardView sections={row.sections} /></div>

        <section className="mt-20 grid gap-10 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="font-serif text-3xl">Comments</h2>
            {approved && <p className="mt-3 text-sm">Approved by <strong>{row.approvedBy}</strong>{row.approvedAt ? ` on ${when(row.approvedAt)}` : ""}.</p>}
            <ol className="mt-6 space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className={`border-l pl-4 ${comment.fromClient ? "border-border" : "border-foreground"}`}>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{comment.author}{comment.kind === "approval" ? " · approved" : comment.kind === "changes" ? " · requested changes" : ""} · {when(comment.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{comment.body}</p>
                </li>
              ))}
              {comments.length === 0 && <li className="text-sm text-muted-foreground">No comments yet.</li>}
            </ol>
          </div>
          <MoodboardFeedback token={row.shareToken} approved={approved} clientName={row.clientName} />
        </section>
      </div>
      <footer className="page-container border-t border-border py-8 text-xs text-muted-foreground"><p className="font-serif text-base italic text-foreground">Designed with intention.</p><p className="mt-2">This page is private to you. Please don&apos;t share the link.</p></footer>
    </main>
  )
}
