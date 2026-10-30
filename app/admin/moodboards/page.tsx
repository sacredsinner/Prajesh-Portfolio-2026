import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, isAdminUser } from "@/lib/auth"
import { listMoodboards } from "@/app/actions/moodboards"
import { MoodboardManager } from "@/components/admin/moodboard-manager"
import { AdminHeader } from "@/components/admin/admin-header"

export const metadata: Metadata = { title: "Moodboards · Content studio", robots: { index: false, follow: false } }

export const dynamic = "force-dynamic"

export default async function AdminMoodboardsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) redirect("/admin")
  const boards = await listMoodboards()
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminHeader active="moodboards" user={session.user} />
        <div className="mt-6">
          <MoodboardManager boards={boards} />
        </div>
      </div>
    </main>
  )
}
