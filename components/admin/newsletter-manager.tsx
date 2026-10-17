"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { addSubscriberManually, cancelNewsletter, changeSubscriber, deleteIssue, draftFromNote, exportSubscribersCsv, previewIssue, retryPendingSubscribers, saveIssue, sendNewsletter, sendTest, type IssueInput } from "@/app/actions/newsletter-admin"
import type { NewsletterIssue, SubscriberList } from "@/lib/newsletter-issues"

// Content studio → Newsletter: who's subscribed, write a newsletter (blank or from a
// published note), preview it, send a test, send now or schedule, and see what went out.

type Note = { id: string; title: string; slug: string; publishedAt: Date | null }
type Readiness = { ready: true; recipients: number } | { ready: false; reason: string; recipients: null }
type View = "compose" | "subscribers" | "history"
type Props = { issues: NewsletterIssue[]; subscribers: SubscriberList; readiness: Readiness; notes: Note[]; sentNoteIds: string[] }

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
const labelClass = "grid gap-1.5 text-sm"
const pill = (active: boolean) => `rounded-full px-4 py-2 text-sm ${active ? "bg-foreground text-background" : "border border-border"}`
const when = (date: Date | string | null | undefined, time = true) => (date ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", ...(time ? { hour: "numeric", minute: "2-digit" } : {}), timeZone: "Asia/Kathmandu" }).format(new Date(date)) : "")
const STATUS_LABELS: Record<string, string> = { draft: "Draft", sending: "Sending…", queued: "Sending", scheduled: "Scheduled", sent: "Sent", canceled: "Cancelled", failed: "Failed" }

const emptyDraft = (): IssueInput => ({ subject: "", previewText: "", heading: "", body: "", imageUrl: "", ctaLabel: "", ctaUrl: "", noteId: null })
const toDraft = (issue: NewsletterIssue): IssueInput => ({ id: issue.id, subject: issue.subject, previewText: issue.previewText ?? "", heading: issue.heading ?? "", body: issue.body, imageUrl: issue.imageUrl ?? "", ctaLabel: issue.ctaLabel ?? "", ctaUrl: issue.ctaUrl ?? "", noteId: issue.noteId })

export function NewsletterManager({ issues, subscribers, readiness, notes, sentNoteIds }: Props) {
  const router = useRouter()
  const [view, setView] = useState<View>("compose")
  const [message, setMessage] = useState("")
  const [editing, setEditing] = useState<IssueInput | null>(null)
  const drafts = issues.filter((i) => i.status === "draft" || i.status === "failed")
  const upcoming = issues.filter((i) => i.status === "scheduled" || i.status === "queued" || i.status === "sending")

  async function openNote(noteId: string) {
    setMessage("")
    const result = await draftFromNote(noteId)
    if (!result.ok) { setMessage(result.error); return }
    setEditing(result.draft)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Content studio</p>
          <h1 className="mt-2 font-serif text-4xl">Newsletter</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setView("compose"); setMessage("") }} className={pill(view === "compose")}>Compose</button>
          <button onClick={() => { setView("subscribers"); setMessage("") }} className={pill(view === "subscribers")}>Subscribers ({subscribers.counts.subscribed})</button>
          <button onClick={() => { setView("history"); setMessage("") }} className={pill(view === "history")}>History ({issues.filter((i) => i.status === "sent").length})</button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Subscribers" value={String(subscribers.counts.subscribed)} note={subscribers.counts.pending ? `${subscribers.counts.pending} waiting to be added to Resend` : subscribers.counts.unsubscribed ? `${subscribers.counts.unsubscribed} unsubscribed` : "confirmed and in Resend"} />
        <Stat label="Sent" value={String(issues.filter((i) => i.status === "sent").length)} note={upcoming.length ? `${upcoming.length} scheduled or on the way` : issues.find((i) => i.status === "sent") ? `last one ${when(issues.find((i) => i.status === "sent")!.sentAt, false)}` : "no newsletters yet"} />
        <Stat label="Sending" value={readiness.ready ? "Ready" : "Off"} note={readiness.ready ? `from hello@shakyaprajesh.com.np to ${readiness.recipients} people` : readiness.reason} warn={!readiness.ready} />
      </section>

      {message && <p role="status" className="rounded-lg border border-border p-3 text-sm">{message}</p>}

      {view === "compose" && (editing ? (
        <IssueEditor initial={editing} readiness={readiness} onClose={() => { setEditing(null); router.refresh() }} onMessage={setMessage} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-border p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Start from a note</p>
              <button onClick={() => { setMessage(""); setEditing(emptyDraft()) }} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">Blank newsletter</button>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {notes.map((note) => {
                const sent = sentNoteIds.includes(note.id)
                return (
                  <li key={note.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0"><p className="truncate text-sm">{note.title}</p><p className="text-xs text-muted-foreground">{when(note.publishedAt, false)}{sent ? " · already sent" : ""}</p></div>
                    <button onClick={() => openNote(note.id)} className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm ${sent ? "border-border text-muted-foreground" : "border-foreground"}`}>{sent ? "Send again" : "Use"}</button>
                  </li>
                )
              })}
              {notes.length === 0 && <li className="py-3 text-sm text-muted-foreground">No published notes yet. Publish a note under Notes, or write a blank newsletter.</li>}
            </ul>
          </div>
          <div className="rounded-xl border border-border p-4 sm:p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Drafts and scheduled</p>
            <ul className="mt-3 divide-y divide-border">
              {[...upcoming, ...drafts].map((issue) => (
                <li key={issue.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate text-sm">{issue.subject}</p><p className="text-xs text-muted-foreground">{STATUS_LABELS[issue.status]}{issue.status === "scheduled" ? ` for ${when(issue.scheduledAt)}` : ` · edited ${when(issue.updatedAt)}`}{issue.status === "failed" && issue.error ? ` · ${issue.error}` : ""}</p></div>
                  {issue.status === "scheduled" || issue.status === "queued" ? (
                    <button onClick={async () => { if (!window.confirm(`Cancel "${issue.subject}"? It goes back to drafts.`)) return; const r = await cancelNewsletter(issue.id); setMessage(r.ok ? "Cancelled. It's back in your drafts." : r.error); router.refresh() }} className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm">Cancel</button>
                  ) : issue.status === "sending" ? null : (
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => { setMessage(""); setEditing(toDraft(issue)) }} className="rounded-lg border border-foreground px-3 py-1.5 text-sm">Open</button>
                      <button onClick={async () => { if (!window.confirm("Delete this draft permanently?")) return; const r = await deleteIssue(issue.id); setMessage(r.ok ? "Draft deleted." : r.error); router.refresh() }} className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive">Delete</button>
                    </div>
                  )}
                </li>
              ))}
              {upcoming.length + drafts.length === 0 && <li className="py-3 text-sm text-muted-foreground">Nothing in progress.</li>}
            </ul>
          </div>
        </div>
      ))}

      {view === "subscribers" && <SubscribersPanel list={subscribers} onMessage={setMessage} />}
      {view === "history" && <HistoryPanel issues={issues} onMessage={setMessage} onReuse={(issue) => { setEditing({ ...toDraft(issue), id: undefined }); setView("compose") }} />}
    </div>
  )
}

function Stat({ label, value, note, warn }: { label: string; value: string; note: string; warn?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border border-border p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 truncate font-serif text-2xl">{value}</p>
      <p className={`mt-1 text-xs ${warn ? "text-destructive" : "text-muted-foreground"}`}>{note}</p>
    </div>
  )
}

// ── Compose ──────────────────────────────────────────────────────────────────

function IssueEditor({ initial, readiness, onClose, onMessage }: { initial: IssueInput; readiness: Readiness; onClose: () => void; onMessage: (m: string) => void }) {
  const router = useRouter()
  const [draft, setDraft] = useState<IssueInput>(initial)
  const [savedId, setSavedId] = useState<string | undefined>(initial.id)
  const [dirty, setDirty] = useState(!initial.id)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<{ html: string; subject: string } | null>(null)
  const [step, setStep] = useState<"edit" | "confirm">("edit")
  const [mode, setMode] = useState<"now" | "later">("now")
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleTime())
  const set = <K extends keyof IssueInput>(key: K, value: IssueInput[K]) => { setDraft((old) => ({ ...old, [key]: value })); setDirty(true) }

  // Preview refreshes a moment after typing stops.
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!draft.subject.trim() || !draft.body.trim()) { setPreview(null); return }
      const result = await previewIssue(draft)
      if (result.ok) setPreview({ html: result.html, subject: result.subject })
    }, 500)
    return () => clearTimeout(timer)
  }, [draft])

  async function save(): Promise<string | null> {
    setBusy("save"); setError("")
    try {
      const result = await saveIssue({ ...draft, id: savedId })
      if (!result.ok) { setError(result.error); return null }
      setSavedId(result.id); setDirty(false)
      return result.id
    } catch { setError("Couldn't save. Your session may have expired. Reload the page, sign in again and retry."); return null } finally { setBusy("") }
  }

  async function test() {
    const id = dirty || !savedId ? await save() : savedId
    if (!id) return
    setBusy("test"); setError("")
    try {
      const result = await sendTest(id)
      setError(result.ok ? "" : result.error)
      if (result.ok) onMessage("Test sent to your own address. Check your inbox before sending it to everyone.")
    } finally { setBusy("") }
  }

  async function confirmSend() {
    const id = dirty || !savedId ? await save() : savedId
    if (!id || !readiness.ready) return
    setBusy("send"); setError("")
    try {
      const result = await sendNewsletter({ id, scheduledAt: mode === "later" ? new Date(scheduledAt).toISOString() : null, expectedRecipients: readiness.recipients })
      if (!result.ok) { setError(result.error); setStep("edit"); return }
      onMessage(result.status === "scheduled" ? `Scheduled for ${when(new Date(scheduledAt))}, to ${result.recipients} people. You can cancel it from Compose until then.` : `Sending to ${result.recipients} people now. Resend adds each reader's own unsubscribe link.`)
      onClose()
    } catch { setError("Couldn't send. Your session may have expired. Reload the page, sign in again and retry.") } finally { setBusy("") }
  }

  const canSend = readiness.ready && draft.subject.trim() && draft.body.trim()

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form onSubmit={(e) => { e.preventDefault(); void save() }} className="grid gap-4 rounded-xl border border-border p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">{savedId ? "Edit newsletter" : "New newsletter"}</h2>
          <button type="button" onClick={onClose} className="text-sm underline">Close</button>
        </div>
        {draft.noteId && <p className="text-xs text-muted-foreground">Started from a published note. Everything below can be changed.</p>}
        <label className={labelClass}>Subject line<input className={inputClass} value={draft.subject} onChange={(e) => set("subject", e.target.value)} maxLength={150} required placeholder="What this newsletter is about" /></label>
        <label className={labelClass}>Preview text <span className="text-xs text-muted-foreground">(shown next to the subject in inboxes; optional)</span><input className={inputClass} value={draft.previewText ?? ""} onChange={(e) => set("previewText", e.target.value)} maxLength={200} /></label>
        <label className={labelClass}>Heading <span className="text-xs text-muted-foreground">(optional; the subject is used if empty)</span><input className={inputClass} value={draft.heading ?? ""} onChange={(e) => set("heading", e.target.value)} maxLength={150} /></label>
        <label className={labelClass}>Body <span className="text-xs text-muted-foreground">(same formatting as notes: ## headings, **bold**, *italic*, [links](/blog/slug), - lists, &gt; quotes)</span><textarea className={`${inputClass} min-h-64 font-mono text-[13px] leading-6`} value={draft.body} onChange={(e) => set("body", e.target.value)} maxLength={30000} required /></label>
        <label className={labelClass}>Image <span className="text-xs text-muted-foreground">(optional; a full web address or a path like /images/notes/cover.png)</span><input className={inputClass} value={draft.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} maxLength={500} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Button label <span className="text-xs text-muted-foreground">(optional)</span><input className={inputClass} value={draft.ctaLabel ?? ""} onChange={(e) => set("ctaLabel", e.target.value)} maxLength={60} placeholder="Read the note" /></label>
          <label className={labelClass}>Button link<input className={inputClass} value={draft.ctaUrl ?? ""} onChange={(e) => set("ctaUrl", e.target.value)} maxLength={500} placeholder="/blog/…" /></label>
        </div>
        {error && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p>}

        {step === "edit" ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button type="submit" disabled={Boolean(busy)} className="rounded-full border border-foreground px-4 py-2 text-sm disabled:opacity-50">{busy === "save" ? "Saving…" : dirty ? "Save draft" : "Saved"}</button>
            <button type="button" onClick={test} disabled={Boolean(busy) || !draft.subject.trim() || !draft.body.trim()} className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50">{busy === "test" ? "Sending test…" : "Send me a test"}</button>
            <button type="button" onClick={() => setStep("confirm")} disabled={Boolean(busy) || !canSend} className="ml-auto rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50">Send to subscribers…</button>
            {!readiness.ready && <p className="w-full text-xs text-destructive">{readiness.reason}</p>}
          </div>
        ) : (
          <div className="grid gap-4 rounded-xl border border-foreground p-4">
            <p className="font-serif text-xl">Send “{draft.subject.trim()}” to {readiness.recipients} {readiness.recipients === 1 ? "person" : "people"}?</p>
            <p className="text-sm text-muted-foreground">It goes from hello@shakyaprajesh.com.np to everyone in the Website newsletter list, with a one-click unsubscribe link. Replies come to your Gmail. This can&apos;t be undone once it starts sending.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setMode("now")} className={pill(mode === "now")}>Send now</button>
              <button type="button" onClick={() => setMode("later")} className={pill(mode === "later")}>Schedule</button>
            </div>
            {mode === "later" && <label className={labelClass}>When (in this computer&apos;s time zone, up to 29 days ahead)<input type="datetime-local" className={inputClass} value={scheduledAt} min={defaultScheduleTime()} onChange={(e) => setScheduledAt(e.target.value)} /></label>}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={confirmSend} disabled={Boolean(busy) || (mode === "later" && !scheduledAt)} className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-50">{busy === "send" ? "Sending…" : mode === "later" ? `Schedule for ${scheduledAt ? when(new Date(scheduledAt)) : "…"}` : `Yes, send to ${readiness.recipients} now`}</button>
              <button type="button" onClick={() => setStep("edit")} className="text-sm underline">Back</button>
            </div>
          </div>
        )}
      </form>

      <div className="rounded-xl border border-border p-4 sm:p-5">
        <div className="flex items-baseline justify-between"><p className="text-xs uppercase tracking-widest text-muted-foreground">Preview</p>{preview && <p className="truncate text-xs text-muted-foreground">Subject: {preview.subject}</p>}</div>
        {preview ? (
          <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="mt-3 h-[720px] w-full border border-border bg-[#F5F5F3]" />
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Add a subject and some text to see the email.</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Readers see this with their own unsubscribe link in the footer. Images and links need full addresses, or site paths starting with /.</p>
      </div>
    </div>
  )
}

// Ten minutes from now in the browser's time zone, as a datetime-local value.
function defaultScheduleTime() {
  const d = new Date(Date.now() + 10 * 60 * 1000)
  d.setSeconds(0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Subscribers ──────────────────────────────────────────────────────────────

function SubscribersPanel({ list, onMessage }: { list: SubscriberList; onMessage: (m: string) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "subscribed" | "unsubscribed" | "pending">("all")
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState("")
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list.rows.filter((r) => (filter === "all" || r.status === filter) && (!q || r.email.includes(q) || `${r.firstName ?? ""} ${r.lastName ?? ""}`.toLowerCase().includes(q)))
  }, [list.rows, query, filter])

  async function act(email: string, action: "unsubscribe" | "remove") {
    const question = action === "unsubscribe" ? `Unsubscribe ${email}? They stay in Resend but won't get newsletters.` : `Remove ${email} from the newsletter list?`
    if (!window.confirm(question)) return
    setBusy(email)
    try {
      const result = await changeSubscriber(email, action)
      onMessage(result.ok ? `${email} ${action === "unsubscribe" ? "unsubscribed" : "removed"}.` : result.error)
      router.refresh()
    } finally { setBusy("") }
  }

  async function exportCsv() {
    setBusy("export")
    try {
      const result = await exportSubscribersCsv()
      if (!result.ok) { onMessage(result.error); return }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
      onMessage(`Exported ${result.count} ${result.count === 1 ? "person" : "people"}.`)
    } finally { setBusy("") }
  }

  async function retry() {
    setBusy("retry")
    try {
      const result = await retryPendingSubscribers()
      onMessage(result.ok ? `Done: ${result.added} added to Resend${result.failed ? `, ${result.failed} still refused (details in the Vercel logs)` : ""}.` : result.error)
      router.refresh()
    } finally { setBusy("") }
  }

  return (
    <div className="space-y-4">
      {list.resendError && <p className="rounded-lg border border-destructive p-3 text-sm text-destructive">Resend&apos;s list can&apos;t be read: {list.resendError}. Showing the sign-ups recorded on the site.</p>}
      {list.truncated && <p className="rounded-lg border border-border p-3 text-sm">Showing the newest 2,000. Export from Resend for the full list.</p>}
      <div className="flex flex-wrap items-center gap-2">
        <input className={`${inputClass} sm:max-w-xs`} placeholder="Search by email or name" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search subscribers" />
        {(["all", "subscribed", "unsubscribed", "pending"] as const).map((key) => (
          <button key={key} onClick={() => setFilter(key)} className={`rounded-full px-3 py-1.5 text-xs ${filter === key ? "bg-foreground text-background" : "border border-border"}`}>{{ all: "All", subscribed: "Subscribed", unsubscribed: "Unsubscribed", pending: "Not in Resend" }[key]}{key !== "all" ? ` (${list.counts[key]})` : ""}</button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          {list.counts.pending > 0 && <button onClick={retry} disabled={Boolean(busy)} className="rounded-full border border-foreground px-4 py-2 text-sm disabled:opacity-50">{busy === "retry" ? "Adding…" : "Add to Resend"}</button>}
          <button onClick={exportCsv} disabled={Boolean(busy)} className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50">{busy === "export" ? "Exporting…" : "Export CSV"}</button>
          <button onClick={() => setAdding((v) => !v)} className="rounded-full bg-foreground px-4 py-2 text-sm text-background">Add by hand</button>
        </div>
      </div>

      {adding && <AddSubscriberForm onDone={(m) => { setAdding(false); onMessage(m); router.refresh() }} onCancel={() => setAdding(false)} />}

      <ul className="divide-y divide-border rounded-xl border border-border">
        {shown.map((row) => (
          <li key={row.email} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm">{row.email}{row.firstName || row.lastName ? <span className="text-muted-foreground"> · {[row.firstName, row.lastName].filter(Boolean).join(" ")}</span> : null}</p>
              <p className="text-xs text-muted-foreground">{row.status === "pending" ? `Not in Resend yet${row.syncError ? ` · ${row.syncError}` : ""}` : row.status === "unsubscribed" ? "Unsubscribed" : "Subscribed"} · {row.source === "website" ? "signed up on the site" : row.source === "admin" ? "added by hand" : "from Resend"}{row.since ? ` · ${when(row.since, false)}` : ""}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {row.status === "subscribed" && <button disabled={busy === row.email} onClick={() => act(row.email, "unsubscribe")} className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50">Unsubscribe</button>}
              <button disabled={busy === row.email} onClick={() => act(row.email, "remove")} className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive disabled:opacity-50">Remove</button>
            </div>
          </li>
        ))}
        {shown.length === 0 && <li className="p-3 text-sm text-muted-foreground">{list.rows.length === 0 ? "No subscribers yet. The sign-up form is in the footer and at /newsletter." : "Nobody matches."}</li>}
      </ul>
    </div>
  )
}

function AddSubscriberForm({ onDone, onCancel }: { onDone: (message: string) => void; onCancel: () => void }) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("")
    try {
      const result = await addSubscriberManually({ email, firstName, lastName, consent })
      if (!result.ok) { setError(result.error); return }
      onDone(`${email.trim().toLowerCase()} added to the newsletter list.`)
    } catch { setError("Couldn't add them. Your session may have expired. Reload the page, sign in again and retry.") } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-foreground p-4">
      <p className="font-serif text-xl">Add someone by hand</p>
      <p className="text-sm text-muted-foreground">For people who asked you directly to get the newsletter. They won&apos;t get a confirmation email, so only add people who&apos;ve clearly agreed.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className={labelClass}>Email<input className={inputClass} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} /></label>
        <label className={labelClass}>First name <span className="text-xs text-muted-foreground">(optional)</span><input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} /></label>
        <label className={labelClass}>Last name <span className="text-xs text-muted-foreground">(optional)</span><input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} /></label>
      </div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" /> This person asked to receive my newsletter.</label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3"><button type="submit" disabled={busy || !consent} className="rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50">{busy ? "Adding…" : "Add subscriber"}</button><button type="button" onClick={onCancel} className="text-sm underline">Cancel</button></div>
    </form>
  )
}

// ── History ──────────────────────────────────────────────────────────────────

function HistoryPanel({ issues, onMessage, onReuse }: { issues: NewsletterIssue[]; onMessage: (m: string) => void; onReuse: (issue: NewsletterIssue) => void }) {
  const router = useRouter()
  const rows = issues.filter((i) => i.status !== "draft").sort((a, b) => new Date(b.sentAt ?? b.scheduledAt ?? b.updatedAt).getTime() - new Date(a.sentAt ?? a.scheduledAt ?? a.updatedAt).getTime())
  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {rows.map((issue) => (
        <li key={issue.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm">{issue.subject}</p>
            <p className="text-xs text-muted-foreground">
              {STATUS_LABELS[issue.status]}
              {issue.status === "sent" && issue.sentAt ? ` ${when(issue.sentAt)}` : issue.status === "scheduled" ? ` for ${when(issue.scheduledAt)}` : issue.status === "failed" ? ` · ${issue.error ?? ""}` : ""}
              {issue.recipientCount != null ? ` · ${issue.recipientCount} ${issue.recipientCount === 1 ? "person" : "people"}` : ""}
              {issue.noteId ? " · from a note" : ""}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {(issue.status === "scheduled" || issue.status === "queued") && <button onClick={async () => { if (!window.confirm(`Cancel "${issue.subject}"?`)) return; const r = await cancelNewsletter(issue.id); onMessage(r.ok ? "Cancelled." : r.error); router.refresh() }} className="rounded-lg border border-border px-3 py-1.5 text-sm">Cancel</button>}
            {issue.status === "sent" && <button onClick={() => onReuse(issue)} className="rounded-lg border border-border px-3 py-1.5 text-sm">Reuse as draft</button>}
            {(issue.status === "sent" || issue.status === "canceled" || issue.status === "failed") && <button onClick={async () => { if (!window.confirm("Delete this record? Resend keeps its own copy and the delivery stats.")) return; const r = await deleteIssue(issue.id); onMessage(r.ok ? "Deleted." : r.error); router.refresh() }} className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive">Delete</button>}
          </div>
        </li>
      ))}
      {rows.length === 0 && <li className="p-3 text-sm text-muted-foreground">Nothing sent yet. Write one under Compose.</li>}
    </ul>
  )
}
