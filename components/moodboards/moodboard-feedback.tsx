"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sendMoodboardFeedback } from "@/app/actions/moodboards"

const inputClass = "w-full border-0 border-b border-input bg-transparent px-0 py-3 text-base focus:border-foreground focus:outline-none"

// Client feedback on a moodboard: a comment, "Approve this direction" or "Request changes".
export function MoodboardFeedback({ token, approved, clientName }: { token: string; approved: boolean; clientName: string | null }) {
  const router = useRouter()
  const [name, setName] = useState(clientName ?? "")
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState<"comment" | "approval" | "changes" | null>(null)
  const [error, setError] = useState("")
  const [done, setDone] = useState("")

  async function submit(kind: "comment" | "approval" | "changes") {
    if (kind === "approval" && !window.confirm("Approve this direction? I'll take it as the go-ahead for the next stage.")) return
    setBusy(kind)
    setError("")
    setDone("")
    try {
      const result = await sendMoodboardFeedback({ token, name, body, kind, website: (document.getElementById(`hp-${token}`) as HTMLInputElement | null)?.value ?? "" })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setBody("")
      setDone(kind === "approval" ? "Thank you! Your approval has been sent." : kind === "changes" ? "Got it. Your change request has been sent." : "Your comment has been added.")
      router.refresh()
    } catch {
      setError("Sorry, that didn't work. Please try again or reply to the email this came with.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="border border-foreground p-6 sm:p-8">
      <p className="font-serif text-2xl">Your thoughts</p>
      <p className="mt-2 text-sm text-muted-foreground">Leave a comment on anything that stands out. When the direction feels right, approve it and I&apos;ll move to the next stage.</p>
      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor={`name-${token}`} className="block text-xs uppercase tracking-widest text-muted-foreground">Your name</label>
          <input id={`name-${token}`} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} maxLength={120} autoComplete="name" />
        </div>
        <div>
          <label htmlFor={`body-${token}`} className="block text-xs uppercase tracking-widest text-muted-foreground">Comment</label>
          <textarea id={`body-${token}`} value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000} className={`${inputClass} resize-none`} placeholder="What do you like? What's not quite right?" />
        </div>
        <div aria-hidden="true" className="hidden"><input id={`hp-${token}`} type="text" tabIndex={-1} autoComplete="off" /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {done && <p role="status" className="text-sm">{done}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" disabled={busy !== null} onClick={() => submit("comment")} className="border border-foreground px-5 py-3 text-sm disabled:opacity-50">{busy === "comment" ? "Sending…" : "Add comment"}</button>
          {!approved && <button type="button" disabled={busy !== null} onClick={() => submit("changes")} className="border border-border px-5 py-3 text-sm disabled:opacity-50">{busy === "changes" ? "Sending…" : "Request changes"}</button>}
          {!approved && <button type="button" disabled={busy !== null} onClick={() => submit("approval")} className="bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">{busy === "approval" ? "Sending…" : "Approve this direction"}</button>}
        </div>
      </div>
    </div>
  )
}
