"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { activateShowcaseVideo, addShowcaseVideo, deleteShowcaseVideo } from "@/app/actions/showcase"
import { uploadToBlob } from "@/lib/upload-client"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "sonner"

type Video = { id: number; url: string; filename: string; isActive: boolean; sizeBytes: number }

export function AdminVideoManager({ videos: initialVideos }: { videos: Video[] }) {
  const router = useRouter()
  const [videos, setVideos] = useState(initialVideos)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

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
      toast.success("Showcase video uploaded successfully", { id: toastId })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed. Check the Blob connection.", { id: toastId })
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  async function activate(id: number) {
    setBusy(true)
    // Optimistically update
    setVideos((prev) => prev.map((v) => ({ ...v, isActive: v.id === id })))
    try {
      await activateShowcaseVideo(id)
      toast.success("Active video updated for homepage")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Activation failed")
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function removeVideo() {
    if (!deleteId) return
    const id = deleteId
    setBusy(true)
    // Optimistically remove
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

  const label = busy ? (progress !== null ? `Uploading ${Math.round(progress)}%` : "Working…") : "Choose video"

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Homepage showcase</p>
          <h2 className="mt-2 font-serif text-2xl">Upload a video</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            MP4, WebM or MOV up to 100MB. The active video autoplays beneath the hero, muted, so keep it short and compress it before uploading.
          </p>
        </div>
        <label className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-center text-sm text-background hover:opacity-90 transition-opacity">
          {label}
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

      <div className="grid gap-3">
        {videos.map((video) => (
          <article
            key={video.id}
            className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-[180px_1fr_auto] md:items-center"
          >
            <video
              className="aspect-video w-full rounded-lg bg-muted object-cover"
              src={video.url}
              muted
              controls
              preload="metadata"
            />
            <div>
              <p className="text-sm font-medium">{video.filename}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(video.sizeBytes / 1024 / 1024)}MB · {video.isActive ? "Active on homepage" : "Not active"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || video.isActive}
                onClick={() => void activate(video.id)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  video.isActive
                    ? "bg-foreground text-background"
                    : "border border-border hover:bg-secondary disabled:opacity-50"
                }`}
              >
                {video.isActive ? "Active" : "Set active"}
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
