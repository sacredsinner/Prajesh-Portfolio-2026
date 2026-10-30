"use client"

import { Play, Maximize2, Minimize2, MessageSquare, Compass, CheckCircle2 } from "lucide-react"

export function FloatingActionDock({
  onStartPresentation,
  onFitAll,
  onToggleFullscreen,
  isFullscreen,
  commentCount,
  onToggleComments,
  onOpenFeedback,
  approved,
}: {
  onStartPresentation: () => void
  onFitAll: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  commentCount: number
  onToggleComments: () => void
  onOpenFeedback?: () => void
  approved?: boolean
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[1030] flex flex-col items-center gap-2 px-4">
      {/* Floating Control Capsule */}
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border bg-background/95 p-1.5 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.01]">
        {/* Start Guided Tour */}
        <button
          type="button"
          onClick={onStartPresentation}
          className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:opacity-90 active:scale-95"
          title="Start interactive pitch presentation"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Start Tour</span>
        </button>

        <div className="h-4 w-px bg-border" />

        {/* View Comments Drawer */}
        <button
          type="button"
          onClick={onToggleComments}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-foreground transition hover:bg-secondary active:scale-95"
          title="View all discussion pins"
        >
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Comments</span>
          {commentCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-semibold text-foreground">
              {commentCount}
            </span>
          )}
        </button>

        {/* Fit to View */}
        <button
          type="button"
          onClick={onFitAll}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-foreground transition hover:bg-secondary active:scale-95"
          title="Fit whole moodboard to screen"
        >
          <Compass className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">Fit All</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen mode"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen mode"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Approve / Sign-off shortcut if not approved */}
        {onOpenFeedback && !approved && (
          <>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <button
              type="button"
              onClick={onOpenFeedback}
              className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary active:scale-95 sm:flex"
              title="Review & submit approval or changes"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Review Direction</span>
            </button>
          </>
        )}
      </div>

      {/* Helpful Hint Pill */}
      <p className="pointer-events-none rounded-full border border-border/60 bg-background/80 px-3 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm">
        💡 Tip: Click any item on the board to view thread & add reactions
      </p>
    </div>
  )
}
