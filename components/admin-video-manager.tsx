"use client"

import { useState } from "react"
import { activateShowcaseVideo, addShowcaseVideo, deleteShowcaseVideo } from "@/app/actions/showcase"
import { uploadToBlob } from "@/lib/upload-client"

type Video = { id: number; url: string; filename: string; isActive: boolean; sizeBytes: number }

export function AdminVideoManager({ videos }: { videos: Video[] }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  async function upload(file: File) {
    setBusy(true); setMessage(""); setProgress(0)
    try {
      // The video goes straight to Blob storage, then the server records it.
      const uploaded = await uploadToBlob(file, "portfolio/showcase", setProgress)
      const saved = await addShowcaseVideo(uploaded)
      if (!saved.ok) {
        setMessage(saved.error)
        return
      }
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed. Check the Blob and database connections.")
    } finally { setBusy(false); setProgress(null) }
  }
  async function activate(id: number) {
    setBusy(true); setMessage("")
    try { await activateShowcaseVideo(id); window.location.reload() }
    catch (error) { setMessage(error instanceof Error ? error.message : "Activation failed"); setBusy(false) }
  }
  async function remove(id: number) {
    if (!window.confirm("Delete this video permanently?")) return
    setBusy(true); setMessage("")
    try { await deleteShowcaseVideo(id); window.location.reload() }
    catch (error) { setMessage(error instanceof Error ? error.message : "Delete failed"); setBusy(false) }
  }
  const label = busy ? (progress !== null ? `Uploading ${Math.round(progress)}%` : "Working…") : "Choose video"
  return <section className="grid gap-6"><div className="flex flex-col gap-4 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Homepage showcase</p><h2 className="mt-2 font-serif text-2xl">Upload a video</h2><p className="mt-2 max-w-xl text-sm text-muted-foreground">MP4, WebM or MOV up to 100MB. The active video autoplays beneath the hero, muted, so keep it short and compress it before uploading.</p></div><label className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-center text-sm text-background">{label}<input className="sr-only" type="file" accept="video/mp4,video/webm,video/quicktime" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file) }} /></label></div>{message && <p role="alert" className="text-sm text-destructive">{message}</p>}<div className="grid gap-3">{videos.map((video) => <article key={video.id} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-[180px_1fr_auto] md:items-center"><video className="aspect-video w-full rounded-lg bg-muted object-cover" src={video.url} muted controls preload="metadata" /><div><p className="text-sm font-medium">{video.filename}</p><p className="mt-1 text-xs text-muted-foreground">{Math.round(video.sizeBytes / 1024 / 1024)}MB · {video.isActive ? "Active on homepage" : "Not active"}</p></div><div className="flex gap-2"><button type="button" disabled={busy || video.isActive} onClick={() => void activate(video.id)} className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">{video.isActive ? "Active" : "Set active"}</button><button type="button" disabled={busy} onClick={() => void remove(video.id)} className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive disabled:opacity-50">Delete</button></div></article>)}{videos.length === 0 && <p className="text-sm text-muted-foreground">No showcase videos uploaded yet.</p>}</div></section>
}
