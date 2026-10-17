"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteMoodboard, getMoodboardComments, replyOnMoodboard, saveMoodboard, sendMoodboard, setMoodboardShared } from "@/app/actions/moodboards"
import { MOODBOARD_STATUS_LABELS, type MoodboardSection, type MoodboardStatus } from "@/lib/moodboards"
import type { Canvas } from "@/lib/canvas"

export type AdminMoodboard = {
  id: string
  title: string
  clientName: string | null
  clientEmail: string | null
  intro: string | null
  sections: MoodboardSection[]
  canvas: Canvas | null
  shareToken: string
  shared: boolean
  status: string
  approvedBy: string | null
  lastViewedAt: Date | null
  updatedAt: Date
  commentCount: number
}

type Draft = { id?: string; title: string; clientName: string; clientEmail: string; intro: string }
type Comment = { id: string; author: string; body: string; fromClient: boolean; kind: string; createdAt: Date }

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
const labelClass = "grid gap-1.5 text-sm"
const statusChip = (status: string) => `inline-flex rounded-full px-2.5 py-0.5 text-xs ${status === "approved" ? "bg-foreground text-background" : status === "changes" ? "border border-destructive text-destructive" : status === "draft" ? "border border-dashed border-border text-muted-foreground" : "border border-border"}`

const when = (date: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kathmandu" }).format(new Date(date))

export function MoodboardManager({ boards }: { boards: AdminMoodboard[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Draft | null>(null)
  const [message, setMessage] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [sending, setSending] = useState<AdminMoodboard | null>(null)
  const [thread, setThread] = useState<{ board: AdminMoodboard; comments: Comment[] } | null>(null)

  async function run(id: string, action: () => Promise<{ ok: true } | { ok: false; error: string }>, success: string) {
    setBusyId(id)
    setMessage("")
    try {
      const result = await action()
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setMessage(success)
      router.refresh()
    } catch {
      setMessage("Something went wrong. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusyId(null)
    }
  }

  async function openThread(board: AdminMoodboard) {
    setMessage("")
    try {
      setThread({ board, comments: await getMoodboardComments(board.id) })
    } catch {
      setMessage("Couldn't load the comments. Reload the page and retry.")
    }
  }

  if (editing) {
    return <DetailsForm initial={editing} onCancel={() => setEditing(null)} onSaved={(id, isNew) => { setEditing(null); if (isNew) router.push(`/admin/moodboards/${id}`); else { setMessage("Details saved."); router.refresh() } }} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Content studio</p>
          <h1 className="mt-2 font-serif text-4xl">Moodboards</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Infinite-canvas boards for a client: images, notes, swatches, type, links and embeds, arranged freely. Share a private link; they can comment on any item and approve the direction, and you get an email each time.</p>
        </div>
        <button onClick={() => { setMessage(""); setEditing({ title: "", clientName: "", clientEmail: "", intro: "" }) }} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">New moodboard</button>
      </div>

      {message && <p role="status" className="rounded-lg border border-border p-3 text-sm">{message}</p>}

      {sending && (
        <SendPanel board={sending} onCancel={() => setSending(null)} onSend={async (note) => { const board = sending; setSending(null); await run(board.id, () => sendMoodboard(board.id, note), `Link sent to ${board.clientEmail}.`) }} />
      )}

      {thread && <Thread board={thread.board} comments={thread.comments} onClose={() => setThread(null)} onReplied={async () => { setMessage("Reply posted" + (thread.board.clientEmail ? ` and emailed to ${thread.board.clientEmail}.` : ".")); setThread({ board: thread.board, comments: await getMoodboardComments(thread.board.id) }); router.refresh() }} />}

      <section className="grid gap-3">
        {boards.map((board) => {
          const busy = busyId === board.id
          const items = board.canvas ? board.canvas.items.filter((i) => i.type !== "frame").length : board.sections.reduce((sum, section) => sum + section.items.length, 0)
          return (
            <article key={board.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {board.clientName || "No client"} <span className={statusChip(board.status)}>{MOODBOARD_STATUS_LABELS[board.status as MoodboardStatus] ?? board.status}</span>{board.shared ? "" : <span className="rounded-full border border-border px-2.5 py-0.5 text-xs normal-case tracking-normal">Link off</span>}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl">{board.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {items} item{items === 1 ? "" : "s"} · {board.commentCount} comment{board.commentCount === 1 ? "" : "s"} · updated {when(board.updatedAt)}
                    {board.lastViewedAt ? ` · client viewed ${when(board.lastViewedAt)}` : ""}
                    {board.approvedBy ? ` · approved by ${board.approvedBy}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`/admin/moodboards/${board.id}`} className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background">Open board</a>
                <button disabled={busy} onClick={() => { setMessage(""); setEditing({ id: board.id, title: board.title, clientName: board.clientName ?? "", clientEmail: board.clientEmail ?? "", intro: board.intro ?? "" }) }} className="rounded-lg border border-border px-3 py-1.5 text-sm">Details</button>
                <button disabled={busy || !board.clientEmail} title={board.clientEmail ? undefined : "Add the client's email first"} onClick={() => setSending(board)} className="rounded-lg border border-foreground px-3 py-1.5 text-sm disabled:opacity-40">Send link</button>
                <a href={`/m/${board.shareToken}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-sm">Preview</a>
                <button disabled={busy} onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/m/${board.shareToken}`).then(() => setMessage(board.shared ? "Private link copied." : "Private link copied. Turn the link on before sharing it."))} className="rounded-lg border border-border px-3 py-1.5 text-sm">Copy link</button>
                <button disabled={busy} onClick={() => run(board.id, () => setMoodboardShared(board.id, !board.shared), board.shared ? "Link switched off. The client page now shows nothing." : "Link switched on.")} className="rounded-lg border border-border px-3 py-1.5 text-sm">{board.shared ? "Turn link off" : "Turn link on"}</button>
                <button disabled={busy} onClick={() => openThread(board)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Comments{board.commentCount ? ` (${board.commentCount})` : ""}</button>
                <button disabled={busy} onClick={() => { if (window.confirm(`Delete "${board.title}" and its comments permanently?`)) void run(board.id, () => deleteMoodboard(board.id), "Moodboard deleted.") }} className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive">Delete</button>
              </div>
            </article>
          )
        })}
        {boards.length === 0 && <p className="text-muted-foreground">No moodboards yet. Create one, arrange images, colours, typefaces and references on the board, then send the private link to your client.</p>}
      </section>
    </div>
  )
}

function SendPanel({ board, onCancel, onSend }: { board: AdminMoodboard; onCancel: () => void; onSend: (message: string) => void }) {
  const [note, setNote] = useState("")
  return (
    <div className="rounded-xl border border-foreground p-4">
      <p className="font-serif text-xl">Send &ldquo;{board.title}&rdquo;</p>
      <p className="mt-1 text-sm text-muted-foreground">To {board.clientEmail}, from your site&apos;s address, with the private link. This also turns the link on.</p>
      <label className={`${labelClass} mt-4`}>Message (optional)<textarea className={`${inputClass} min-h-24`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Leave empty for the standard message." maxLength={2000} /></label>
      <div className="mt-4 flex gap-3"><button onClick={() => onSend(note)} className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background">Send</button><button onClick={onCancel} className="text-sm underline">Cancel</button></div>
    </div>
  )
}

function Thread({ board, comments, onClose, onReplied }: { board: AdminMoodboard; comments: Comment[]; onClose: () => void; onReplied: () => void }) {
  const [reply, setReply] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function send() {
    setBusy(true)
    setError("")
    try {
      const result = await replyOnMoodboard(board.id, reply)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setReply("")
      onReplied()
    } catch {
      setError("Couldn't post the reply. Reload the page and retry.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="rounded-xl border border-foreground p-4">
      <div className="flex items-center justify-between"><p className="font-serif text-xl">Comments on &ldquo;{board.title}&rdquo;</p><button onClick={onClose} className="text-sm underline">Close</button></div>
      <ol className="mt-4 space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className={`border-l pl-3 ${comment.fromClient ? "border-border" : "border-foreground"}`}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{comment.author}{comment.kind === "approval" ? " · approved" : comment.kind === "changes" ? " · requested changes" : ""} · {when(comment.createdAt)}</p>
            <p className="mt-1 whitespace-pre-line text-sm">{comment.body}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-muted-foreground">No comments yet.</li>}
      </ol>
      <label className={`${labelClass} mt-4`}>Reply<textarea className={`${inputClass} min-h-20`} value={reply} onChange={(e) => setReply(e.target.value)} maxLength={2000} placeholder={board.clientEmail ? `Posted on the board and emailed to ${board.clientEmail}.` : "Posted on the board (no client email on file)."} /></label>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      <button disabled={busy || !reply.trim()} onClick={send} className="mt-3 rounded-full bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-50">{busy ? "Posting…" : "Post reply"}</button>
    </div>
  )
}

function DetailsForm({ initial, onCancel, onSaved }: { initial: Draft; onCancel: () => void; onSaved: (id: string, isNew: boolean) => void }) {
  const [draft, setDraft] = useState<Draft>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((old) => ({ ...old, [key]: value }))
  async function save() {
    setBusy(true)
    setError("")
    try {
      const result = await saveMoodboard({ ...draft, sections: [] })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved(result.id, !draft.id)
    } catch {
      setError("Couldn't save. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); void save() }} className="grid gap-4 rounded-2xl border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4"><h1 className="font-serif text-3xl">{draft.id ? "Moodboard details" : "New moodboard"}</h1><button type="button" onClick={onCancel} className="text-sm underline">Cancel</button></div>
      <label className={`${labelClass}`}>Title<input className={inputClass} value={draft.title} onChange={(e) => set("title", e.target.value)} required maxLength={140} placeholder="e.g. Himal Roasters — Direction 1: Warm & handmade" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>Client name<input className={inputClass} value={draft.clientName} onChange={(e) => set("clientName", e.target.value)} maxLength={120} /></label>
        <label className={labelClass}>Client email<input className={inputClass} type="email" value={draft.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} maxLength={200} placeholder="Needed to send the link" /></label>
      </div>
      <label className={labelClass}>Intro<textarea className={inputClass} rows={3} value={draft.intro} onChange={(e) => set("intro", e.target.value)} maxLength={2000} placeholder="A few lines on the direction, shown above the board." /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="w-fit rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">{busy ? "Saving…" : draft.id ? "Save" : "Create and open the board"}</button>
    </form>
  )
}
