"use client"

import { useState } from "react"
import { activateShowcaseVideo, deleteShowcaseVideo, uploadShowcaseVideo } from "@/app/actions/showcase"

type Video = { id: number; url: string; filename: string; isActive: boolean; sizeBytes: number }

export function AdminVideoManager({ videos }: { videos: Video[] }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  async function upload(file: File) {
    setBusy(true); setMessage("")
    try { const formData = new FormData(); formData.set("file", file); await uploadShowcaseVideo(formData); window.location.reload() } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed") } finally { setBusy(false) }
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
  return <section className="grid gap-6"><div className="flex flex-col gap-4 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Homepage showcase</p><h2 className="mt-2 font-serif text-2xl">Upload a video</h2><p className="mt-2 max-w-xl text-sm text-muted-foreground">Public MP4, WebM, or MOV video up to 100MB. The active video autoplays beneath the hero.</p></div><label className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-center text-sm text-background">{busy ? "Uploading…" : "Choose video"}<input className="sr-only" type="file" accept="video/*" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file) }} /></label></div>{message && <p className="text-sm text-destructive">{message}</p>}<div className="grid gap-3">{videos.map((video) => <article key={video.id} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-[180px_1fr_auto] md:items-center"><video className="aspect-video w-full rounded-lg bg-muted object-cover" src={video.url} muted controls preload="metadata" /><div><p className="text-sm font-medium">{video.filename}</p><p className="mt-1 text-xs text-muted-foreground">{Math.round(video.sizeBytes / 1024 / 1024)}MB · {video.isActive ? "Active on homepage" : "Not active"}</p></div><div className="flex gap-2"><button type="button" disabled={busy || video.isActive} onClick={() => void activate(video.id)} className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50">{video.isActive ? "Active" : "Set active"}</button><button type="button" disabled={busy} onClick={() => void remove(video.id)} className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive disabled:opacity-50">Delete</button></div></article>)}{videos.length === 0 && <p className="text-sm text-muted-foreground">No showcase videos uploaded yet.</p>}</div></section>
}
