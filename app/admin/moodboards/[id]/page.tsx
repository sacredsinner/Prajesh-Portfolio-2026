import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth, isAdminUser } from "@/lib/auth"
import { loadMoodboard } from "@/app/actions/moodboards"
import { BoardEditor } from "@/components/moodboards/canvas/board-editor"

export const metadata: Metadata = { title: "Moodboard · Content studio", robots: { index: false, follow: false } }

export const dynamic = "force-dynamic"

export default async function MoodboardEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) redirect("/admin")
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const board = await loadMoodboard(id)
  if (!board) notFound()
  return <BoardEditor board={board} />
}
