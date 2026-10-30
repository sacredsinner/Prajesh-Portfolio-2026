"use client"

import { useState } from "react"
import { X, CheckCircle2, AlertCircle, Calendar, Send, FileEdit, EyeOff, ShieldCheck, Sparkles, ArrowRight } from "lucide-react"
import type { ProjectData, ProjectStatus } from "@/lib/project-editor-types"

interface PublishModalProps {
  project: ProjectData
  onPublish: (status: ProjectStatus, scheduledAt?: string | null) => Promise<void>
  onClose: () => void
}

export function PublishModal({ project, onPublish, onClose }: PublishModalProps) {
  const [scheduleMode, setScheduleMode] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  // Validation Checks
  const checks = [
    {
      id: "cover",
      label: "Cover Image Uploaded",
      passed: Boolean(project.thumbnail && !project.thumbnail.startsWith("/placeholder")),
      required: true,
      hint: "Add a high-resolution hero cover image.",
    },
    {
      id: "title",
      label: "Project Title Completed",
      passed: Boolean(project.title && project.title.trim().length >= 3),
      required: true,
      hint: "Title should be at least 3 characters.",
    },
    {
      id: "description",
      label: "Project Description Completed",
      passed: Boolean(project.overview && project.overview.trim().length >= 15),
      required: true,
      hint: "Add a compelling project overview.",
    },
    {
      id: "category",
      label: "Category & Discipline Selected",
      passed: Boolean(project.category?.trim()),
      required: true,
      hint: "Choose a primary category.",
    },
    {
      id: "blocks",
      label: "Content Blocks (Minimum 2)",
      passed: (project.blocks?.length ?? 0) >= 2,
      required: true,
      hint: `Currently has ${project.blocks?.length ?? 0} content block${project.blocks?.length === 1 ? "" : "s"}.`,
    },
    {
      id: "seo",
      label: "SEO Title & Meta Description",
      passed: Boolean((project.seoTitle || project.title) && (project.seoDescription || project.overview)),
      required: false,
      hint: "Meta tags optimize discoverability and social sharing previews.",
    },
    {
      id: "accessibility",
      label: "Accessibility (Alt Text Check)",
      passed: (project.blocks ?? [])
        .filter((b) => b.type === "image" || b.type === "full-width-image")
        .every((b: any) => Boolean(b.alt || b.caption)),
      required: false,
      hint: "All image blocks have descriptive alt text or captions.",
    },
  ]

  const requiredPassed = checks.filter((c) => c.required).every((c) => c.passed)
  const allPassed = checks.every((c) => c.passed)
  const passedCount = checks.filter((c) => c.passed).length

  const handleAction = async (status: ProjectStatus, date?: string | null) => {
    setBusy(true)
    setError("")
    try {
      await onPublish(status, date)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publishing action failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-foreground" />
              <h3 className="font-serif text-2xl font-medium">Publishing Readiness</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Review your project quality score and release status before making it live.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Readiness Meter */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Readiness Score</span>
              <span>
                {passedCount} of {checks.length} checks passed
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all duration-500 ${
                  allPassed ? "bg-[#1c6538]" : requiredPassed ? "bg-amber-600" : "bg-muted-foreground"
                }`}
                style={{ width: `${(passedCount / checks.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Verification Checklist
            </p>
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/40"
              >
                {check.passed ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#1c6538]" />
                ) : check.required ? (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                ) : (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                )}
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{check.label}</span>
                    {check.required && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-muted-foreground">{check.hint}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule option */}
          {scheduleMode && (
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <label className="block text-xs font-medium text-foreground">
                Scheduled Publishing Date & Time
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                />
              </label>
              <p className="mt-2 text-[11px] text-muted-foreground">
                The project will automatically appear on the public site when this time is reached.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* Action Footer */}
        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {project.status === "published" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleAction("draft")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <EyeOff className="size-3.5" /> Revert to Draft
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setScheduleMode(!scheduleMode)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Calendar className="size-3.5" /> {scheduleMode ? "Cancel Schedule" : "Schedule Publishing"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Cancel
            </button>

            {scheduleMode ? (
              <button
                type="button"
                disabled={busy || !scheduledDate}
                onClick={() => handleAction("scheduled", scheduledDate)}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
              >
                <Calendar className="size-4" /> Schedule Project
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !requiredPassed}
                onClick={() => handleAction("published")}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
              >
                <Send className="size-4" />
                {project.status === "published" ? "Update Live Project" : "Publish to Site"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
