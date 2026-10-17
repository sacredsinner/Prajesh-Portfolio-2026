import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, isAdminUser } from "@/lib/auth"
import { listMoodboards } from "@/app/actions/moodboards"
import { MoodboardManager } from "@/components/admin/moodboard-manager"

export const metadata: Metadata = { title: "Moodboards · Content studio", robots: { index: false, follow: false } }

export const dynamic = "force-dynamic"

export default async function AdminMoodboardsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) redirect("/admin")
  const boards = await listMoodboards()
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <a href="/admin" className="text-xs uppercase tracking-widest hover:opacity-60">← Content studio</a>
        <div className="mt-8"><MoodboardManager boards={boards} /></div>
      </div>
    </main>
  )
}
