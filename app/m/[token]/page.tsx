import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { and, asc, eq } from "drizzle-orm"
import { BrandMark } from "@/components/brand-mark"
import { ClientBoard } from "@/components/moodboards/client-board"
import { sectionsToCanvas } from "@/lib/canvas"
import { auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { moodboardComments, moodboards } from "@/lib/db/schema"
import { DEMO_MOODBOARD, DEMO_CANVAS, DEMO_COMMENTS } from "@/lib/demo-board"
import { APPLE_GUITAR_MOODBOARD, APPLE_GUITAR_CANVAS, APPLE_GUITAR_COMMENTS } from "@/lib/apple-guitars-board"

// A client's moodboard: /m/<token>. Private (unguessable link, not indexed).
export const dynamic = "force-dynamic"

async function load(token: string) {
  if (token === "demo") {
    return {
      ...DEMO_MOODBOARD,
      canvas: DEMO_CANVAS,
      sections: [],
    }
  }
  if (token === "apple" || token === "apple-guitars") {
    return {
      ...APPLE_GUITAR_MOODBOARD,
      canvas: APPLE_GUITAR_CANVAS,
      sections: [],
    }
  }
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(token)) return undefined
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
  const isDemo = token === "demo"
  const isApple = token === "apple" || token === "apple-guitars"
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const isAdmin = isAdminUser(session?.user)
  if (!isAdmin && !isDemo && !isApple) await db.update(moodboards).set({ lastViewedAt: new Date() }).where(eq(moodboards.id, row.id))
  const comments = isApple
    ? APPLE_GUITAR_COMMENTS
    : isDemo
    ? DEMO_COMMENTS
    : await db.select().from(moodboardComments).where(eq(moodboardComments.moodboardId, row.id)).orderBy(asc(moodboardComments.createdAt))
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
        {approved && <p className="mt-4 text-sm">Approved by <strong>{row.approvedBy}</strong>{row.approvedAt ? ` on ${when(row.approvedAt)}` : ""}.</p>}
        <div className="mt-12"><ClientBoard canvas={row.canvas ?? sectionsToCanvas(row.sections)} comments={comments} token={row.shareToken} approved={approved} clientName={row.clientName} title={row.title} intro={row.intro} /></div>
      </div>
      <footer className="page-container border-t border-border py-8 text-xs text-muted-foreground"><p className="font-serif text-base italic text-foreground">Designed with intention.</p><p className="mt-2">This page is private to you. Please don&apos;t share the link.</p></footer>
    </main>
  )
}
