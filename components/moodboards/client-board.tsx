"use client"

import { useState } from "react"
import { describeItem, type Canvas, type CanvasItem } from "@/lib/canvas"
import { CanvasStage } from "@/components/moodboards/canvas/canvas-stage"
import { MoodboardFeedback } from "@/components/moodboards/moodboard-feedback"

type Comment = { id: string; author: string; body: string; fromClient: boolean; kind: string; itemId: string | null; createdAt: Date }

// The client's view: the canvas (pan, zoom, fit, mini-map) with comment counts on items.
// Clicking an item selects it so a comment can be pinned to it.
export function ClientBoard({ canvas, comments, token, approved, clientName }: { canvas: Canvas; comments: Comment[]; token: string; approved: boolean; clientName: string | null }) {
  const [picked, setPicked] = useState<CanvasItem | null>(null)
  const pins = Object.entries(comments.reduce<Record<string, number>>((acc, c) => (c.itemId ? { ...acc, [c.itemId]: (acc[c.itemId] ?? 0) + 1 } : acc), {})).map(([itemId, count]) => ({ itemId, count }))
  const when = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kathmandu" }).format(new Date(d))
  const onItem = comments.filter((c) => picked && c.itemId === picked.id)

  return (
    <div className="space-y-10">
      <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-border">
        <CanvasStage canvas={canvas} pins={pins} onPickItem={(item) => setPicked(item && item.type !== "frame" ? item : null)} selectedItem={picked?.id ?? null}>
          <p className="pointer-events-none absolute left-4 top-4 rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground backdrop-blur">Drag to move around · pinch or ⌘-scroll to zoom · click an item to comment on it</p>
        </CanvasStage>
      </div>

      <section className="grid gap-10 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="font-serif text-3xl">Comments</h2>
          {picked && (
            <div className="mt-4 rounded-xl border border-foreground p-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected: {describeItem(picked)}</p>
              {onItem.length ? <ul className="mt-2 space-y-2">{onItem.map((c) => <li key={c.id} className={`border-l pl-3 ${c.fromClient ? "border-border" : "border-foreground"}`}><p className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.author} · {when(c.createdAt)}</p><p className="mt-0.5 whitespace-pre-line">{c.body}</p></li>)}</ul> : <p className="mt-2 text-muted-foreground">No comments on this item yet. Your next comment will be pinned to it.</p>}
              <button type="button" onClick={() => setPicked(null)} className="mt-3 text-xs underline">Comment on the board as a whole instead</button>
            </div>
          )}
          <ol className="mt-6 space-y-4">
            {comments.map((c) => {
              const item = c.itemId ? canvas.items.find((i) => i.id === c.itemId) : null
              return (
                <li key={c.id} className={`border-l pl-4 ${c.fromClient ? "border-border" : "border-foreground"}`}>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.author}{c.kind === "approval" ? " · approved" : c.kind === "changes" ? " · requested changes" : ""} · {when(c.createdAt)}{item ? ` · on ${describeItem(item)}` : ""}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{c.body}</p>
                </li>
              )
            })}
            {comments.length === 0 && <li className="text-sm text-muted-foreground">No comments yet.</li>}
          </ol>
        </div>
        <MoodboardFeedback token={token} approved={approved} clientName={clientName} itemId={picked?.id} itemLabel={picked ? describeItem(picked) : undefined} />
      </section>
    </div>
  )
}
