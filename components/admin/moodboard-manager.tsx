"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { deleteMoodboard, getMoodboardComments, replyOnMoodboard, saveMoodboard, sendMoodboard, setMoodboardShared } from "@/app/actions/moodboards"
import { MOODBOARD_STATUS_LABELS, type MoodboardSection, type MoodboardStatus } from "@/lib/moodboards"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import type { Canvas } from "@/lib/canvas"
import { Search } from "lucide-react"
import { toast } from "sonner"

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
  const [busyId, setBusyId] = useState<string | null>(null)
  const [sending, setSending] = useState<AdminMoodboard | null>(null)
  const [thread, setThread] = useState<{ board: AdminMoodboard; comments: Comment[] } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminMoodboard | null>(null)
  const [search, setSearch] = useState("")

  async function run(id: string, action: () => Promise<{ ok: true } | { ok: false; error: string }>, success: string) {
    setBusyId(id)
    try {
      const result = await action()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(success)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please check your connection and retry.")
    } finally {
      setBusyId(null)
    }
  }

  async function openThread(board: AdminMoodboard) {
    try {
      setThread({ board, comments: await getMoodboardComments(board.id) })
    } catch {
      toast.error("Couldn't load comments. Reload the page and retry.")
    }
  }

  const filteredBoards = useMemo(() => {
    if (!search.trim()) return boards
    const q = search.toLowerCase()
    return boards.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.clientName?.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
    )
  }, [boards, search])

  if (editing) {
    return (
      <DetailsForm
        initial={editing}
        onCancel={() => setEditing(null)}
        onSaved={(id, isNew) => {
          setEditing(null)
          if (isNew) {
            router.push(`/admin/moodboards/${id}`)
          } else {
            toast.success("Moodboard details saved.")
            router.refresh()
          }
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl">Visual direction boards</h2>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            Infinite-canvas boards for client reviews: images, notes, swatches, typefaces and links. Share a private link with real-time commenting and approval.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search boards…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-foreground"
            />
          </div>
          <a
            href="/m/apple"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
            title="Launch Apple Guitars interactive showcase"
          >
            <span>Apple Guitars</span> ↗
          </a>
          <a
            href="/m/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
            title="Launch interactive client presentation demo"
          >
            <span>Komorebi Studio</span> ↗
          </a>
          <button
            onClick={() => setEditing({ title: "", clientName: "", clientEmail: "", intro: "" })}
            className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
          >
            New moodboard
          </button>
        </div>
      </div>

      {sending && (
        <SendPanel
          board={sending}
          onCancel={() => setSending(null)}
          onSend={async (note) => {
            const board = sending
            setSending(null)
            await run(board.id, () => sendMoodboard(board.id, note), `Link sent to ${board.clientEmail}.`)
          }}
        />
      )}

      {thread && (
        <Thread
          board={thread.board}
          comments={thread.comments}
          onClose={() => setThread(null)}
          onReplied={async () => {
            toast.success(
              "Reply posted" + (thread.board.clientEmail ? ` and emailed to ${thread.board.clientEmail}.` : ".")
            )
            setThread({ board: thread.board, comments: await getMoodboardComments(thread.board.id) })
            router.refresh()
          }}
        />
      )}

      <section className="grid gap-3">
        {filteredBoards.map((board) => {
          const busy = busyId === board.id
          const items = board.canvas
            ? board.canvas.items.filter((i) => i.type !== "frame").length
            : board.sections.reduce((sum, section) => sum + section.items.length, 0)
          return (
            <article key={board.id} className="rounded-xl border border-border p-4 transition-colors hover:border-foreground/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    {board.clientName || "No client"}{" "}
                    <span className={statusChip(board.status)}>
                      {MOODBOARD_STATUS_LABELS[board.status as MoodboardStatus] ?? board.status}
                    </span>
                    {board.shared ? "" : <span className="rounded-full border border-border px-2 py-0.5 text-[10px] normal-case tracking-normal">Link off</span>}
                  </p>
                  <h2 className="mt-1 font-serif text-2xl truncate">{board.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {items} item{items === 1 ? "" : "s"} · {board.commentCount} comment{board.commentCount === 1 ? "" : "s"} · updated {when(board.updatedAt)}
                    {board.lastViewedAt ? ` · client viewed ${when(board.lastViewedAt)}` : ""}
                    {board.approvedBy ? ` · approved by ${board.approvedBy}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a href={`/admin/moodboards/${board.id}`} className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background hover:opacity-90 transition-opacity">
                  Open board
                </a>
                <button
                  disabled={busy}
                  onClick={() => setEditing({ id: board.id, title: board.title, clientName: board.clientName ?? "", clientEmail: board.clientEmail ?? "", intro: board.intro ?? "" })}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                >
                  Details
                </button>
                <button
                  disabled={busy || !board.clientEmail}
                  title={board.clientEmail ? undefined : "Add the client's email first"}
                  onClick={() => setSending(board)}
                  className="rounded-lg border border-foreground px-3 py-1.5 text-xs hover:bg-secondary transition-colors disabled:opacity-40"
                >
                  Send link
                </button>
                <a href={`/m/${board.shareToken}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors">
                  Preview ↗
                </a>
                <button
                  disabled={busy}
                  onClick={() => {
                    const url = `${window.location.origin}/m/${board.shareToken}`
                    navigator.clipboard?.writeText(url).then(() =>
                      toast.success(board.shared ? "Private link copied to clipboard!" : "Private link copied. Note: link is currently turned off.")
                    )
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                >
                  Copy link
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      board.id,
                      () => setMoodboardShared(board.id, !board.shared),
                      board.shared ? "Link switched off." : "Link switched on."
                    )
                  }
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                >
                  {board.shared ? "Turn link off" : "Turn link on"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => openThread(board)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                >
                  Comments{board.commentCount ? ` (${board.commentCount})` : ""}
                </button>
                <button
                  disabled={busy}
                  onClick={() => setDeleteTarget(board)}
                  className="rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </article>
          )
        })}

        {filteredBoards.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No moodboards found.
          </div>
        )}
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete moodboard"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}" and all its comments?`}
        confirmLabel="Delete permanently"
        onConfirm={async () => {
          if (!deleteTarget) return
          await run(deleteTarget.id, () => deleteMoodboard(deleteTarget.id), "Moodboard deleted permanently.")
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}

function SendPanel({ board, onCancel, onSend }: { board: AdminMoodboard; onCancel: () => void; onSend: (message: string) => void }) {
  const [note, setNote] = useState("")
  return (
    <div className="rounded-xl border border-foreground p-4">
      <p className="font-serif text-xl">Send &ldquo;{board.title}&rdquo;</p>
      <p className="mt-1 text-xs text-muted-foreground">Emails a private review link to {board.clientEmail}. They can leave comments and approve directly.</p>
      <label className="mt-3 grid gap-1.5 text-xs">
        Personal message (optional)
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Here's the initial direction for review..." className={inputClass} />
      </label>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => onSend(note)} className="rounded-full bg-foreground px-4 py-1.5 text-xs text-background">Send email</button>
        <button type="button" onClick={onCancel} className="rounded-full border border-border px-4 py-1.5 text-xs">Cancel</button>
      </div>
    </div>
  )
}

function DetailsForm({ initial, onCancel, onSaved }: { initial: Draft; onCancel: () => void; onSaved: (id: string, isNew: boolean) => void }) {
  const [data, setData] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const result = await saveMoodboard({
        id: data.id,
        title: data.title.trim(),
        clientName: data.clientName.trim() || null,
        clientEmail: data.clientEmail.trim() || null,
        intro: data.intro.trim() || null,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved(result.id, !data.id)
    } catch {
      setError("Couldn't save. Please retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border p-5 grid gap-4 max-w-xl">
      <h3 className="font-serif text-2xl">{data.id ? "Edit details" : "New moodboard"}</h3>
      <label className={labelClass}>
        Title
        <input required value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className={inputClass} placeholder="Brand Identity Exploration" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Client name
          <input value={data.clientName} onChange={(e) => setData({ ...data, clientName: e.target.value })} className={inputClass} placeholder="Acme Inc." />
        </label>
        <label className={labelClass}>
          Client email
          <input type="email" value={data.clientEmail} onChange={(e) => setData({ ...data, clientEmail: e.target.value })} className={inputClass} placeholder="founder@acme.com" />
        </label>
      </div>
      <label className={labelClass}>
        Intro note
        <textarea rows={3} value={data.intro} onChange={(e) => setData({ ...data, intro: e.target.value })} className={inputClass} placeholder="Notes for the client explaining the visual direction..." />
      </label>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="rounded-full bg-foreground px-5 py-2 text-xs text-background disabled:opacity-50">
          {busy ? "Saving…" : data.id ? "Save details" : "Create and open board"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-border px-4 py-2 text-xs">Cancel</button>
      </div>
    </form>
  )
}

function Thread({ board, comments, onClose, onReplied }: { board: AdminMoodboard; comments: Comment[]; onClose: () => void; onReplied: () => void }) {
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function reply(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setBusy(true)
    setError("")
    try {
      const result = await replyOnMoodboard(board.id, body.trim())
      if (!result.ok) {
        setError(result.error)
        return
      }
      setBody("")
      onReplied()
    } catch {
      setError("Couldn't post reply.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Feedback on &ldquo;{board.title}&rdquo;</h3>
        <button type="button" onClick={onClose} className="text-xs underline">Close thread</button>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-3 text-xs space-y-1 bg-secondary/30">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-medium text-foreground">{c.author}</span>
              <span>{when(c.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet on this board.</p>}
      </div>
      <form onSubmit={reply} className="space-y-2 pt-2 border-t border-border">
        <textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply to your client..." className={inputClass} required />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button disabled={busy} className="rounded-full bg-foreground px-4 py-1.5 text-xs text-background disabled:opacity-50">
          {busy ? "Posting…" : "Post reply"}
        </button>
      </form>
    </div>
  )
}
