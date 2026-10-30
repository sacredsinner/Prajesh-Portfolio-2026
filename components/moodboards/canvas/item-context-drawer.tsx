"use client"

import { useState } from "react"
import { describeItem, type CanvasItem } from "@/lib/canvas"
import { AVAILABLE_REACTIONS, type EmojiReaction } from "@/lib/presentation"
import { sendMoodboardFeedback } from "@/app/actions/moodboards"
import { X, Send, Sparkles, MessageSquare } from "lucide-react"

type Comment = {
  id: string
  author: string
  body: string
  fromClient: boolean
  kind: string
  itemId: string | null
  createdAt: Date
}

export function ItemContextDrawer({
  item,
  comments,
  token,
  clientName,
  reactions = { "❤️": 0, "🔥": 0, "💡": 0, "🤔": 0 },
  onClose,
  onCommentAdded,
}: {
  item: CanvasItem
  comments: Comment[]
  token: string
  clientName: string | null
  reactions?: Record<EmojiReaction, number>
  onClose: () => void
  onCommentAdded?: () => void
}) {
  const [name, setName] = useState(clientName ?? "")
  const [body, setBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeReaction, setActiveReaction] = useState<EmojiReaction | null>(null)
  const [statusMessage, setStatusMessage] = useState("")
  const [localReactions, setLocalReactions] = useState(reactions)

  const itemComments = comments.filter((c) => c.itemId === item.id)
  const when = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kathmandu",
    }).format(new Date(d))

  async function handleReaction(emoji: EmojiReaction, meaning: string) {
    if (isSubmitting) return
    setIsSubmitting(true)
    setActiveReaction(emoji)
    setStatusMessage("")

    // Optimistic update
    setLocalReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }))

    try {
      const res = await sendMoodboardFeedback({
        token,
        name: name.trim() || clientName || "Client",
        body: `${emoji} ${meaning}`,
        kind: "comment",
        itemId: item.id,
      })

      if (res.ok) {
        setStatusMessage(`Reaction saved: ${emoji}`)
        onCommentAdded?.()
      } else {
        setStatusMessage(res.error || "Could not save reaction")
      }
    } catch {
      setStatusMessage("Failed to send reaction.")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setActiveReaction(null), 1200)
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || isSubmitting) return

    setIsSubmitting(true)
    setStatusMessage("")

    try {
      const res = await sendMoodboardFeedback({
        token,
        name: name.trim() || clientName || "Client",
        body: body.trim(),
        kind: "comment",
        itemId: item.id,
      })

      if (res.ok) {
        setBody("")
        setStatusMessage("Comment posted!")
        onCommentAdded?.()
      } else {
        setStatusMessage(res.error || "Could not post comment.")
      }
    } catch {
      setStatusMessage("Error sending comment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      data-control="true"
      className="absolute bottom-4 right-4 top-4 z-[1050] flex w-80 max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-border bg-background/95 p-5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-right-4 sm:w-96"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {item.type}
          </span>
          <h3 className="line-clamp-1 font-serif text-lg font-medium text-foreground">
            {describeItem(item)}
          </h3>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Reactions */}
      <div className="pt-3">
        <div className="flex items-center gap-1.5 pb-2">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Quick Client Sentiment
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {AVAILABLE_REACTIONS.map(({ emoji, label, meaning }) => {
            const count = localReactions[emoji] || 0
            const isSelected = activeReaction === emoji
            return (
              <button
                key={emoji}
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.stopPropagation()
                  handleReaction(emoji, meaning)
                }}
                title={`${label} (${meaning})`}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-2 text-center transition active:scale-95 ${
                  isSelected
                    ? "scale-105 border-foreground bg-secondary font-semibold"
                    : "border-border hover:border-foreground/60 hover:bg-secondary/40"
                }`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                  {count > 0 ? count : "+1"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Discussion List */}
      <div className="my-3 flex-1 overflow-y-auto pr-1">
        <div className="flex items-center gap-1.5 pb-2">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Thread ({itemComments.length})
          </p>
        </div>

        {itemComments.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-3 text-center text-xs text-muted-foreground">
            <p>No feedback on this item yet.</p>
            <p className="mt-0.5 text-[11px] opacity-80">Tap an emoji above or leave a thought below.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {itemComments.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg border p-2.5 text-xs ${
                  c.fromClient
                    ? "border-border bg-secondary/20"
                    : "border-foreground/20 bg-background"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="font-medium text-foreground">{c.author}</span>
                  <span>{when(c.createdAt)}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap leading-relaxed text-foreground">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="border-t border-border pt-3">
        {!clientName && (
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground"
            maxLength={60}
          />
        )}
        <div className="relative">
          <textarea
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Discuss or comment on this item…"
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 pr-10 text-xs leading-relaxed outline-none focus:border-foreground"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!body.trim() || isSubmitting}
            className="absolute bottom-2.5 right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-foreground text-background transition disabled:opacity-30 hover:opacity-90 active:scale-95"
            aria-label="Send"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
        {statusMessage && (
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  )
}
