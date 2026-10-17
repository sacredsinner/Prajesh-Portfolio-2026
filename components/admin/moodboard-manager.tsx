"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteMoodboard, getMoodboardComments, replyOnMoodboard, saveMoodboard, sendMoodboard, setMoodboardShared } from "@/app/actions/moodboards"
import { MoodboardView } from "@/components/moodboards/moodboard-view"
import { ITEM_LABELS, MOODBOARD_STATUS_LABELS, defaultSections, newId, type MoodboardItem, type MoodboardItemType, type MoodboardSection, type MoodboardStatus } from "@/lib/moodboards"
import { uploadToBlob } from "@/lib/upload-client"

export type AdminMoodboard = {
  id: string
  title: string
  clientName: string | null
  clientEmail: string | null
  intro: string | null
  sections: MoodboardSection[]
  shareToken: string
  shared: boolean
  status: string
  approvedBy: string | null
  lastViewedAt: Date | null
  updatedAt: Date
  commentCount: number
}

type Draft = { id?: string; title: string; clientName: string; clientEmail: string; intro: string; sections: MoodboardSection[] }
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
    return <MoodboardEditor initial={editing} onCancel={() => setEditing(null)} onSaved={(note) => { setEditing(null); setMessage(note); router.refresh() }} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Content studio</p>
          <h1 className="mt-2 font-serif text-4xl">Moodboards</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Curated boards for a client: mood, colour, type and references. Share a private link; they can comment and approve the direction, and you get an email each time.</p>
        </div>
        <button onClick={() => { setMessage(""); setEditing({ title: "", clientName: "", clientEmail: "", intro: "", sections: defaultSections() }) }} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">New moodboard</button>
      </div>

      {message && <p role="status" className="rounded-lg border border-border p-3 text-sm">{message}</p>}

      {sending && (
        <SendPanel board={sending} onCancel={() => setSending(null)} onSend={async (note) => { const board = sending; setSending(null); await run(board.id, () => sendMoodboard(board.id, note), `Link sent to ${board.clientEmail}.`) }} />
      )}

      {thread && <Thread board={thread.board} comments={thread.comments} onClose={() => setThread(null)} onReplied={async () => { setMessage("Reply posted" + (thread.board.clientEmail ? ` and emailed to ${thread.board.clientEmail}.` : ".")); setThread({ board: thread.board, comments: await getMoodboardComments(thread.board.id) }); router.refresh() }} />}

      <section className="grid gap-3">
        {boards.map((board) => {
          const busy = busyId === board.id
          const items = board.sections.reduce((sum, section) => sum + section.items.length, 0)
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
                <button disabled={busy} onClick={() => { setMessage(""); setEditing({ id: board.id, title: board.title, clientName: board.clientName ?? "", clientEmail: board.clientEmail ?? "", intro: board.intro ?? "", sections: board.sections }) }} className="rounded-lg border border-border px-3 py-1.5 text-sm">Edit</button>
                <button disabled={busy || !board.clientEmail} title={board.clientEmail ? undefined : "Add the client's email first"} onClick={() => setSending(board)} className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40">Send link</button>
                <a href={`/m/${board.shareToken}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-sm">Preview</a>
                <button disabled={busy} onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/m/${board.shareToken}`).then(() => setMessage(board.shared ? "Private link copied." : "Private link copied. Turn the link on before sharing it."))} className="rounded-lg border border-border px-3 py-1.5 text-sm">Copy link</button>
                <button disabled={busy} onClick={() => run(board.id, () => setMoodboardShared(board.id, !board.shared), board.shared ? "Link switched off. The client page now shows nothing." : "Link switched on.")} className="rounded-lg border border-border px-3 py-1.5 text-sm">{board.shared ? "Turn link off" : "Turn link on"}</button>
                <button disabled={busy} onClick={() => openThread(board)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Comments{board.commentCount ? ` (${board.commentCount})` : ""}</button>
                <button disabled={busy} onClick={() => { if (window.confirm(`Delete "${board.title}" and its comments permanently?`)) void run(board.id, () => deleteMoodboard(board.id), "Moodboard deleted.") }} className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive">Delete</button>
              </div>
            </article>
          )
        })}
        {boards.length === 0 && <p className="text-muted-foreground">No moodboards yet. Create one, add images, colours, typefaces and references, then send the private link to your client.</p>}
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

function MoodboardEditor({ initial, onCancel, onSaved }: { initial: Draft; onCancel: () => void; onSaved: (message: string) => void }) {
  const [draft, setDraft] = useState<Draft>(initial)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(false)
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((old) => ({ ...old, [key]: value }))
  const setSection = (id: string, patch: Partial<MoodboardSection>) => setDraft((old) => ({ ...old, sections: old.sections.map((section) => (section.id === id ? { ...section, ...patch } : section)) }))
  const setItem = (sectionId: string, itemId: string, patch: Partial<MoodboardItem>) => setSection(sectionId, { items: draft.sections.find((s) => s.id === sectionId)!.items.map((item) => (item.id === itemId ? ({ ...item, ...patch } as MoodboardItem) : item)) })
  const move = <T,>(list: T[], index: number, by: number) => {
    const target = index + by
    if (target < 0 || target >= list.length) return list
    const copy = [...list]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    return copy
  }

  function addItem(sectionId: string, type: MoodboardItemType) {
    const base = { id: newId() }
    const item: MoodboardItem =
      type === "image" ? { ...base, type, url: "" } : type === "colour" ? { ...base, type, hex: "#1B1A16" } : type === "type" ? { ...base, type, family: "" } : type === "note" ? { ...base, type, text: "" } : { ...base, type, url: "" }
    const section = draft.sections.find((s) => s.id === sectionId)!
    setSection(sectionId, { items: [...section.items, item] })
  }

  async function uploadImages(sectionId: string, files: File[]) {
    setUploading(sectionId)
    setError("")
    try {
      const uploaded = await Promise.all(files.map((file) => uploadToBlob(file, "moodboards")))
      const section = draft.sections.find((s) => s.id === sectionId)!
      setSection(sectionId, { items: [...section.items, ...uploaded.map((file) => ({ id: newId(), type: "image" as const, url: file.url }))] })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(null)
    }
  }

  async function save() {
    setBusy(true)
    setError("")
    try {
      const sections = draft.sections.map((section) => ({ ...section, items: section.items.filter((item) => (item.type === "image" || item.type === "link" ? item.url.trim() : item.type === "type" ? item.family.trim() : item.type === "note" ? item.text.trim() : true)) }))
      const result = await saveMoodboard({ ...draft, sections })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onSaved("Moodboard saved.")
    } catch {
      setError("Couldn't save. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save() }} className="grid gap-6 rounded-2xl border border-border p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">{draft.id ? "Edit moodboard" : "New moodboard"}</h1>
        <div className="flex gap-4"><button type="button" onClick={() => setPreview((p) => !p)} className="text-sm underline">{preview ? "Back to editing" : "Preview"}</button><button type="button" onClick={onCancel} className="text-sm underline">Cancel</button></div>
      </div>

      {preview ? (
        <div className="rounded-xl border border-dashed border-border p-4 sm:p-8">
          <h2 className="font-serif text-4xl">{draft.title || "Untitled"}</h2>
          {draft.intro && <p className="mt-4 max-w-2xl whitespace-pre-line text-muted-foreground">{draft.intro}</p>}
          <div className="mt-10"><MoodboardView sections={draft.sections} /></div>
        </div>
      ) : (
        <>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>Title<input className={inputClass} value={draft.title} onChange={(e) => set("title", e.target.value)} required maxLength={140} placeholder="e.g. Himal Roasters — Direction 1: Warm & handmade" /></label>
            <label className={labelClass}>Client name<input className={inputClass} value={draft.clientName} onChange={(e) => set("clientName", e.target.value)} maxLength={120} /></label>
            <label className={labelClass}>Client email<input className={inputClass} type="email" value={draft.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} maxLength={200} placeholder="Needed to send the link" /></label>
            <label className={`${labelClass} sm:col-span-2`}>Intro<textarea className={inputClass} rows={3} value={draft.intro} onChange={(e) => set("intro", e.target.value)} maxLength={2000} placeholder="A few lines on the direction and what you'd like the client to look at." /></label>
          </fieldset>

          {draft.sections.map((section, sectionIndex) => (
            <fieldset key={section.id} className="grid gap-3 rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input aria-label="Section title" className={`${inputClass} max-w-xs font-serif text-lg`} value={section.title} onChange={(e) => setSection(section.id, { title: e.target.value })} maxLength={80} required />
                <input aria-label="Section note" className={`${inputClass} min-w-0 flex-1`} value={section.note ?? ""} onChange={(e) => setSection(section.id, { note: e.target.value })} maxLength={600} placeholder="Optional note shown beside the title" />
                <div className="flex gap-1">
                  <button type="button" onClick={() => set("sections", move(draft.sections, sectionIndex, -1))} disabled={sectionIndex === 0} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move section up">↑</button>
                  <button type="button" onClick={() => set("sections", move(draft.sections, sectionIndex, 1))} disabled={sectionIndex === draft.sections.length - 1} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move section down">↓</button>
                  <button type="button" onClick={() => { if (!section.items.length || window.confirm(`Remove "${section.title}" and its ${section.items.length} items?`)) set("sections", draft.sections.filter((s) => s.id !== section.id)) }} className="rounded border border-border px-2 py-1 text-xs" aria-label="Remove section">×</button>
                </div>
              </div>

              <div className="grid gap-2">
                {section.items.map((item, itemIndex) => (
                  <div key={item.id} className="grid gap-2 rounded-lg bg-secondary/40 p-3 sm:grid-cols-[6rem_1fr_auto] sm:items-start">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{ITEM_LABELS[item.type]}</span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {item.type === "image" && (
                        <>
                          <div className="flex items-center gap-3 sm:col-span-2">{item.url ? <img src={item.url} alt="" className="h-16 w-24 border border-border object-cover" /> : null}<input aria-label="Image URL" className={inputClass} value={item.url} onChange={(e) => setItem(section.id, item.id, { url: e.target.value })} placeholder="Image link, or upload below" /></div>
                          <input aria-label="Caption" className={inputClass} value={item.caption ?? ""} onChange={(e) => setItem(section.id, item.id, { caption: e.target.value })} maxLength={300} placeholder="Caption (optional)" />
                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(item.wide)} onChange={(e) => setItem(section.id, item.id, { wide: e.target.checked })} /> Full width</label>
                        </>
                      )}
                      {item.type === "colour" && (
                        <>
                          <div className="flex items-center gap-2"><input aria-label="Colour" type="color" value={/^#[0-9a-fA-F]{6}$/.test(item.hex) ? item.hex : "#1b1a16"} onChange={(e) => setItem(section.id, item.id, { hex: e.target.value.toUpperCase() })} className="h-9 w-12 cursor-pointer border border-border bg-transparent" /><input aria-label="Hex" className={inputClass} value={item.hex} onChange={(e) => setItem(section.id, item.id, { hex: e.target.value })} maxLength={7} placeholder="#1B1A16" /></div>
                          <input aria-label="Colour name" className={inputClass} value={item.name ?? ""} onChange={(e) => setItem(section.id, item.id, { name: e.target.value })} maxLength={60} placeholder="Name, e.g. Ink" />
                          <input aria-label="Colour note" className={`${inputClass} sm:col-span-2`} value={item.note ?? ""} onChange={(e) => setItem(section.id, item.id, { note: e.target.value })} maxLength={300} placeholder="Where it's used (optional)" />
                        </>
                      )}
                      {item.type === "type" && (
                        <>
                          <input aria-label="Typeface" className={inputClass} value={item.family} onChange={(e) => setItem(section.id, item.id, { family: e.target.value })} maxLength={80} placeholder="Google Font name, e.g. Instrument Serif" />
                          <input aria-label="Sample text" className={inputClass} value={item.sample ?? ""} onChange={(e) => setItem(section.id, item.id, { sample: e.target.value })} maxLength={200} placeholder="Sample text (optional)" />
                          <input aria-label="Type note" className={`${inputClass} sm:col-span-2`} value={item.note ?? ""} onChange={(e) => setItem(section.id, item.id, { note: e.target.value })} maxLength={300} placeholder="Role, e.g. headlines (optional)" />
                        </>
                      )}
                      {item.type === "note" && <textarea aria-label="Note" className={`${inputClass} sm:col-span-2`} rows={2} value={item.text} onChange={(e) => setItem(section.id, item.id, { text: e.target.value })} maxLength={2000} placeholder="A thought, a principle, a line of copy…" />}
                      {item.type === "link" && (
                        <>
                          <input aria-label="Link URL" className={inputClass} value={item.url} onChange={(e) => setItem(section.id, item.id, { url: e.target.value })} placeholder="https://…" />
                          <input aria-label="Link title" className={inputClass} value={item.title ?? ""} onChange={(e) => setItem(section.id, item.id, { title: e.target.value })} maxLength={160} placeholder="Title (optional)" />
                          <input aria-label="Link note" className={`${inputClass} sm:col-span-2`} value={item.note ?? ""} onChange={(e) => setItem(section.id, item.id, { note: e.target.value })} maxLength={300} placeholder="Why it's here (optional)" />
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setSection(section.id, { items: move(section.items, itemIndex, -1) })} disabled={itemIndex === 0} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move up">↑</button>
                      <button type="button" onClick={() => setSection(section.id, { items: move(section.items, itemIndex, 1) })} disabled={itemIndex === section.items.length - 1} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move down">↓</button>
                      <button type="button" onClick={() => setSection(section.id, { items: section.items.filter((i) => i.id !== item.id) })} className="rounded border border-border px-2 py-1 text-xs" aria-label="Remove">×</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <label className="rounded-lg border border-border px-3 py-1.5">{uploading === section.id ? "Uploading…" : "Upload images"}<input type="file" accept="image/*" multiple className="hidden" disabled={uploading !== null} onChange={(e) => { const files = Array.from(e.target.files ?? []); e.target.value = ""; if (files.length) void uploadImages(section.id, files) }} /></label>
                {(["image", "colour", "type", "note", "link"] as MoodboardItemType[]).map((type) => <button key={type} type="button" onClick={() => addItem(section.id, type)} className="rounded-lg border border-border px-3 py-1.5">+ {ITEM_LABELS[type]}</button>)}
              </div>
            </fieldset>
          ))}
          <button type="button" onClick={() => set("sections", [...draft.sections, { id: newId(), title: "New section", items: [] }])} className="w-fit rounded-lg border border-border px-3 py-2 text-sm">Add section</button>
        </>
      )}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy || uploading !== null} className="w-fit rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
    </form>
  )
}
