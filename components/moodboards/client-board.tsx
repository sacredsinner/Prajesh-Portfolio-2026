"use client"

import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import { describeItem, type Canvas, type CanvasItem } from "@/lib/canvas"
import { CanvasStage, type CanvasStageControls } from "@/components/moodboards/canvas/canvas-stage"
import { MoodboardFeedback } from "@/components/moodboards/moodboard-feedback"
import { PresentationBar } from "@/components/moodboards/canvas/presentation-bar"
import { FloatingActionDock } from "@/components/moodboards/canvas/floating-action-dock"
import { ItemContextDrawer } from "@/components/moodboards/canvas/item-context-drawer"
import { buildSlides, parseReactions } from "@/lib/presentation"
import { useRouter } from "next/navigation"
import { X, MessageSquare } from "lucide-react"

type Comment = {
  id: string
  author: string
  body: string
  fromClient: boolean
  kind: string
  itemId: string | null
  createdAt: Date
}

export function ClientBoard({
  canvas,
  comments,
  token,
  approved,
  clientName,
  title,
  intro,
}: {
  canvas: Canvas
  comments: Comment[]
  token: string
  approved: boolean
  clientName: string | null
  title?: string
  intro?: string | null
}) {
  const router = useRouter()
  const [picked, setPicked] = useState<CanvasItem | null>(null)
  const [isPresentation, setIsPresentation] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAllCommentsDrawer, setShowAllCommentsDrawer] = useState(false)
  const stageControls = useRef<CanvasStageControls | null>(null)
  const stageContainerRef = useRef<HTMLDivElement>(null)

  const slides = useMemo(() => buildSlides(canvas, title, intro), [canvas, title, intro])
  const reactionsMap = useMemo(() => parseReactions(comments), [comments])

  const pins = useMemo(() => {
    const counts = comments.reduce<Record<string, number>>((acc, c) => {
      if (c.itemId) {
        acc[c.itemId] = (acc[c.itemId] ?? 0) + 1
      }
      return acc
    }, {})
    return Object.entries(counts).map(([itemId, count]) => ({ itemId, count }))
  }, [comments])

  const when = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kathmandu",
    }).format(new Date(d))

  const onItem = comments.filter((c) => picked && c.itemId === picked.id)

  const handleInitControls = useCallback((controls: CanvasStageControls) => {
    stageControls.current = controls
  }, [])

  const handleSlideChange = useCallback(
    (index: number) => {
      setActiveSlideIndex(index)
      const slide = slides[index]
      if (slide && stageControls.current) {
        stageControls.current.fitTo(slide.bounds, 96, true)
      }
    },
    [slides]
  )

  const handleStartPresentation = useCallback(() => {
    if (!slides.length) return
    setIsPresentation(true)
    setActiveSlideIndex(0)
    setPicked(null)
    setShowAllCommentsDrawer(false)
    stageControls.current?.fitTo(slides[0].bounds, 96, true)
  }, [slides])

  const handleExitPresentation = useCallback(() => {
    setIsPresentation(false)
    stageControls.current?.fitItems(canvas.items, true)
  }, [canvas.items])

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev
      setTimeout(() => stageControls.current?.fitItems(canvas.items, true), 150)
      return next
    })
  }, [canvas.items])

  const handleOpenFeedback = useCallback(() => {
    document.getElementById("feedback-section")?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Close drawers / exit fullscreen on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (picked) setPicked(null)
        if (showAllCommentsDrawer) setShowAllCommentsDrawer(false)
        if (isFullscreen && !isPresentation) setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [picked, showAllCommentsDrawer, isFullscreen, isPresentation])

  const activeSlide = slides[activeSlideIndex]

  return (
    <div className="space-y-10">
      {/* Canvas Stage Frame */}
      <div
        ref={stageContainerRef}
        className={`relative overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-0 z-[1000] h-screen w-screen rounded-none border-0 bg-background"
            : "h-[74vh] min-h-[460px] rounded-2xl border border-border"
        }`}
      >
        <CanvasStage
          canvas={canvas}
          pins={pins}
          onPickItem={(item) => {
            if (isPresentation) return
            setPicked(item && item.type !== "frame" ? item : null)
          }}
          selectedItem={picked?.id ?? null}
          onInitControls={handleInitControls}
          presentationActive={isPresentation}
          activeSlideItemIds={isPresentation && activeSlide ? activeSlide.itemIds : null}
        >
          {/* Presentation Header Bar */}
          {isPresentation && (
            <PresentationBar
              slides={slides}
              activeSlideIndex={activeSlideIndex}
              onSlideChange={handleSlideChange}
              onExit={handleExitPresentation}
            />
          )}

          {/* Floating Action Dock */}
          {!isPresentation && (
            <FloatingActionDock
              onStartPresentation={handleStartPresentation}
              onFitAll={() => stageControls.current?.fitItems(canvas.items, true)}
              onToggleFullscreen={handleToggleFullscreen}
              isFullscreen={isFullscreen}
              commentCount={comments.length}
              onToggleComments={() => setShowAllCommentsDrawer((prev) => !prev)}
              onOpenFeedback={handleOpenFeedback}
              approved={approved}
            />
          )}

          {/* Contextual Side Drawer for Selected Item */}
          {picked && (
            <ItemContextDrawer
              item={picked}
              comments={comments}
              token={token}
              clientName={clientName}
              reactions={reactionsMap[picked.id]}
              onClose={() => setPicked(null)}
              onCommentAdded={() => router.refresh()}
            />
          )}

          {/* All Comments Slide-over Drawer */}
          {showAllCommentsDrawer && (
            <div
              data-control="true"
              className="absolute bottom-4 right-4 top-4 z-[1050] flex w-80 max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-border bg-background/95 p-5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-right-4 sm:w-96"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <h3 className="font-serif text-lg font-medium">All Discussion ({comments.length})</h3>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllCommentsDrawer(false)
                  }}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-3 flex-1 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    No comments on this moodboard yet.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {comments.map((c) => {
                      const item = c.itemId ? canvas.items.find((i) => i.id === c.itemId) : null
                      return (
                        <li
                          key={c.id}
                          className={`rounded-xl border p-3 text-xs ${
                            c.fromClient ? "border-border bg-secondary/30" : "border-foreground/30 bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                            <span className="font-medium text-foreground">{c.author}</span>
                            <span>{when(c.createdAt)}</span>
                          </div>
                          {item && (
                            <button
                              type="button"
                              onClick={() => {
                                setPicked(item)
                                setShowAllCommentsDrawer(false)
                                stageControls.current?.fitTo(
                                  { x: item.x, y: item.y, w: item.w, h: item.h },
                                  120,
                                  true
                                )
                              }}
                              className="mt-1 text-[11px] underline opacity-80 hover:opacity-100"
                            >
                              On {describeItem(item)} ↗
                            </button>
                          )}
                          <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{c.body}</p>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            </div>
          )}
        </CanvasStage>
      </div>

      {/* Full Feedback & Sign-off Section Below Canvas */}
      <section
        id="feedback-section"
        className="grid gap-10 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div>
          <h2 className="font-serif text-3xl">Discussion & Log</h2>
          {picked && (
            <div className="mt-4 rounded-xl border border-foreground p-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Selected: {describeItem(picked)}
              </p>
              {onItem.length ? (
                <ul className="mt-2 space-y-2">
                  {onItem.map((c) => (
                    <li
                      key={c.id}
                      className={`border-l pl-3 ${c.fromClient ? "border-border" : "border-foreground"}`}
                    >
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {c.author} · {when(c.createdAt)}
                      </p>
                      <p className="mt-0.5 whitespace-pre-line">{c.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted-foreground">
                  No comments on this item yet. Your next comment will be pinned to it.
                </p>
              )}
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="mt-3 text-xs underline"
              >
                Comment on the board as a whole instead
              </button>
            </div>
          )}
          <ol className="mt-6 space-y-4">
            {comments.map((c) => {
              const item = c.itemId ? canvas.items.find((i) => i.id === c.itemId) : null
              return (
                <li
                  key={c.id}
                  className={`border-l pl-4 ${c.fromClient ? "border-border" : "border-foreground"}`}
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {c.author}
                    {c.kind === "approval"
                      ? " · approved"
                      : c.kind === "changes"
                      ? " · requested changes"
                      : ""}{" "}
                    · {when(c.createdAt)}
                    {item ? ` · on ${describeItem(item)}` : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{c.body}</p>
                </li>
              )
            })}
            {comments.length === 0 && (
              <li className="text-sm text-muted-foreground">No comments yet.</li>
            )}
          </ol>
        </div>
        <MoodboardFeedback
          token={token}
          approved={approved}
          clientName={clientName}
          itemId={picked?.id}
          itemLabel={picked ? describeItem(picked) : undefined}
        />
      </section>
    </div>
  )
}
