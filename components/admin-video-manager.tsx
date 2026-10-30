"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { activateShowcaseVideo, deactivateShowcaseVideo, addShowcaseVideo, deleteShowcaseVideo } from "@/app/actions/showcase"
import { setFeatureFlagAction } from "@/app/actions/features"
import { uploadToBlob } from "@/lib/upload-client"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, Video, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { FeatureFlags } from "@/lib/feature-flags"

type Video = { id: number; url: string; filename: string; isActive: boolean; sizeBytes: number }

export function AdminVideoManager({
  videos: initialVideos,
  initialFeatures,
}: {
  videos: Video[]
  initialFeatures?: FeatureFlags
}) {
  const router = useRouter()
  const [videos, setVideos] = useState(initialVideos)
  const [features, setFeatures] = useState<FeatureFlags>(initialFeatures ?? { promoVideo: false })
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const activeVideo = videos.find((v) => v.isActive) || null
  const hasActiveVideo = activeVideo !== null

  async function upload(file: File) {
    setBusy(true)
    setProgress(0)
    const toastId = toast.loading("Uploading showcase video…")
    try {
      const uploaded = await uploadToBlob(file, "portfolio/showcase", setProgress)
      const saved = await addShowcaseVideo(uploaded)
      if (!saved.ok) {
        toast.error(saved.error, { id: toastId })
        return
      }
      toast.success("Showcase video uploaded and set active on homepage", { id: toastId })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed. Check the Blob connection.", { id: toastId })
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  async function toggleVideo(id: number, makeActive: boolean) {
    setBusy(true)
    // Optimistically update
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, isActive: makeActive } : makeActive ? { ...v, isActive: false } : v,
      ),
    )

    try {
      if (makeActive) {
        await activateShowcaseVideo(id)
        toast.success("Showcase video is now ACTIVE on homepage")
      } else {
        await deactivateShowcaseVideo(id)
        toast.success("Showcase video turned OFF for homepage")
      }
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function toggleMasterShowcase(enable: boolean) {
    if (!enable) {
      setBusy(true)
      setVideos((prev) => prev.map((v) => ({ ...v, isActive: false })))
      try {
        await deactivateShowcaseVideo()
        toast.success("Homepage video showcase turned OFF")
        router.refresh()
      } catch {
        toast.error("Failed to turn off showcase video")
        router.refresh()
      } finally {
        setBusy(false)
      }
    } else {
      const target = videos.find((v) => v.isActive) || videos[0]
      if (target) {
        await toggleVideo(target.id, true)
      } else {
        toast.info("Please upload a video first to turn on the showcase.")
      }
    }
  }

  async function togglePromoStudio(enable: boolean) {
    setBusy(true)
    setFeatures((prev) => ({ ...prev, promoVideo: enable }))
    try {
      const res = await setFeatureFlagAction("promoVideo", enable)
      if (res.ok) {
        toast.success(enable ? "Promo Video Studio (/promo) is now ON" : "Promo Video Studio (/promo) is now OFF")
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Failed to update feature setting")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function removeVideo() {
    if (!deleteId) return
    const id = deleteId
    setBusy(true)
    setVideos((prev) => prev.filter((v) => v.id !== id))
    try {
      await deleteShowcaseVideo(id)
      toast.success("Video deleted permanently")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed")
      router.refresh()
    } finally {
      setBusy(false)
      setDeleteId(null)
    }
  }

  const uploadLabel = busy ? (progress !== null ? `Uploading ${Math.round(progress)}%` : "Working…") : "Upload video"

  return (
    <section className="grid gap-6">
      {/* Backend Feature Toggles */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Toggle 1: Homepage Showcase Video */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  hasActiveVideo ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                }`}
              />
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Homepage Video Showcase</h3>
              </div>
            </div>
            <Switch
              checked={hasActiveVideo}
              disabled={busy || videos.length === 0}
              onCheckedChange={(checked) => void toggleMasterShowcase(checked)}
              aria-label="Toggle homepage video showcase"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {hasActiveVideo
              ? `Currently ON. "${activeVideo?.filename}" autoplays beneath the homepage hero.`
              : "Currently OFF. The homepage video section is completely hidden from public visitors."}
          </p>
        </div>

        {/* Toggle 2: Promo Video Studio (/promo) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  features.promoVideo ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                }`}
              />
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Promo Video Studio (/promo)</h3>
              </div>
            </div>
            <Switch
              checked={features.promoVideo}
              disabled={busy}
              onCheckedChange={(checked) => void togglePromoStudio(checked)}
              aria-label="Toggle promo video studio page"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {features.promoVideo ? (
              <span className="flex items-center gap-1.5">
                Currently ON. Accessible at{" "}
                <Link
                  href="/promo"
                  target="_blank"
                  className="underline font-mono text-foreground hover:text-primary inline-flex items-center gap-0.5"
                >
                  /promo <ExternalLink className="w-3 h-3" />
                </Link>{" "}
                with video generator and 60 FPS exporter.
              </span>
            ) : (
              "Currently OFF. The /promo route returns 404 and is hidden from public navigation."
            )}
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Video Asset Library</p>
          <h2 className="mt-2 font-serif text-2xl">Upload Video</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            MP4, WebM or MOV up to 100MB. Use the ON/OFF switches above or on each video row to control what is displayed publicly.
          </p>
        </div>
        <label className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-center text-sm text-background hover:opacity-90 transition-opacity">
          {uploadLabel}
          <input
            className="sr-only"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) void upload(file)
            }}
          />
        </label>
      </div>

      {/* Video Cards */}
      <div className="grid gap-3">
        {videos.map((video) => (
          <article
            key={video.id}
            className={`grid gap-4 rounded-xl border p-4 md:grid-cols-[180px_1fr_auto] md:items-center transition-all ${
              video.isActive ? "border-emerald-500/50 bg-emerald-500/5" : "border-border bg-card"
            }`}
          >
            <video
              className="aspect-video w-full rounded-lg bg-muted object-cover"
              src={video.url}
              muted
              controls
              preload="metadata"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{video.filename}</p>
                {video.isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE ON HOMEPAGE
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(video.sizeBytes / 1024 / 1024)}MB · {video.isActive ? "Active on homepage" : "Turned off"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggleVideo(video.id, !video.isActive)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  video.isActive
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border border-border hover:bg-secondary text-foreground"
                }`}
              >
                {video.isActive ? "Active (Turn Off)" : "Turn On"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setDeleteId(video.id)}
                className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {videos.length === 0 && <p className="text-sm text-muted-foreground">No showcase videos uploaded yet.</p>}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete video"
        description="Are you sure you want to permanently delete this showcase video from your storage?"
        confirmLabel="Delete permanently"
        onConfirm={removeVideo}
      />
    </section>
  )
}
