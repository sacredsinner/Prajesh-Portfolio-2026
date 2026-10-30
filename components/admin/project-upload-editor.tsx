"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ChevronDown, Copy, Eye, GripVertical, ImagePlus, MoreHorizontal, Plus, Redo2, Save, Sparkles, Trash2, Undo2, Upload, X } from "lucide-react"
import { saveProject } from "@/app/actions/cms"
import { uploadToBlob } from "@/lib/upload-client"

const starterBlocks = [
  { id: "intro", type: "text", title: "Project introduction", content: "Tell the story behind this project, the opportunity, and the point of view that shaped the work." },
  { id: "image-1", type: "image", title: "Hero image", content: "" },
  { id: "heading-1", type: "heading", title: "The idea", content: "A clear idea makes a flexible identity." },
]

const blockTypes = ["Image", "Image Grid", "Carousel", "Full-width Image", "Video", "Text", "Heading", "Quote", "Divider", "Embed", "Before / After", "GIF", "PDF", "Figma Prototype"]

export function ProjectUploadEditor() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Brand identity")
  const [blocks, setBlocks] = useState(starterBlocks)
  const [selected, setSelected] = useState("intro")
  const [sidebar, setSidebar] = useState("details")
  const [status, setStatus] = useState("Draft saved")
  const [publishOpen, setPublishOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [coverUrl, setCoverUrl] = useState("")
  const [uploadError, setUploadError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const checklist = useMemo(() => [
    [Boolean(title.trim()), "Project title"],
    [Boolean(description.trim()), "Description"],
    [Boolean(slug.trim()), "URL slug"],
    [blocks.length >= 2, "At least two content blocks"],
    [Boolean(category), "Category"],
  ] as const, [title, description, slug, blocks.length, category])
  const ready = checklist.every(([complete]) => complete)

  function addBlock(type: string) {
    const id = `${type.toLowerCase().replace(/[^a-z]+/g, "-")}-${Date.now()}`
    const next = { id, type: type.toLowerCase(), title: type, content: type === "Divider" ? "" : "Click to edit this block" }
    setBlocks((current) => [...current, next])
    setSelected(id)
  }

  function updateBlock(id: string, content: string) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, content } : block))
    setStatus("Saving…")
    window.setTimeout(() => setStatus("Draft saved"), 500)
  }

  function duplicateBlock(id: string) {
    const original = blocks.find((block) => block.id === id)
    if (!original) return
    const copy = { ...original, id: `${original.id}-copy-${Date.now()}`, title: `${original.title} copy` }
    setBlocks((current) => [...current, copy])
  }

  function deleteBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id))
    setSelected(blocks.find((block) => block.id !== id)?.id ?? "")
  }

  async function uploadCover(file: File) {
    setUploading(true)
    setUploadError("")
    setStatus("Uploading cover…")
    try {
      const uploaded = await uploadToBlob(file, "portfolio")
      setCoverUrl(uploaded.url)
      setStatus("Draft saved")
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not upload this image.")
      setStatus("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function publish() {
    setStatus("Publishing…")
    const result = await saveProject({ slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), title, category, year: new Date().getFullYear().toString(), thumbnail: coverUrl || "/placeholder.jpg", client: "", overview: description, problem: "", approach: "", solution: blocks.map((block) => `${block.title}: ${block.content}`).join("\n\n"), outcome: "", images: [], featured: false, seoTitle: title, seoDescription: description })
    setStatus(result.ok ? "Published" : result.error)
    if (result.ok) setPublishOpen(false)
  }

  return <main className="min-h-screen bg-secondary/40 text-foreground">
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4"><Link href="/admin" className="rounded-md p-2 hover:bg-secondary" aria-label="Back to studio"><ArrowLeft className="size-4" /></Link><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Project editor</p><p className="text-sm font-medium">{title || "Untitled project"}</p></div></div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span className="size-2 rounded-full bg-[#1c6538]" />{status}</div>
        <div className="flex items-center gap-2"><button className="hidden rounded-md border border-border p-2 hover:bg-secondary md:block" aria-label="Undo"><Undo2 className="size-4" /></button><button className="hidden rounded-md border border-border p-2 hover:bg-secondary md:block" aria-label="Redo"><Redo2 className="size-4" /></button><button className="rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"><Eye className="mr-2 inline size-4" />Preview</button><button onClick={() => setPublishOpen(true)} className="rounded-md bg-foreground px-4 py-2 text-sm text-background">Publish</button></div>
      </div>
    </header>
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 rounded-xl border border-border bg-background shadow-sm">
        <div className="border-b border-border p-5 md:p-8"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cover & project details</span><span className="text-xs text-muted-foreground">Autosave on</span></div><button onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) void uploadCover(file) }} className="mt-6 flex min-h-48 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50 text-center transition-colors hover:border-foreground hover:bg-secondary"><Upload className="size-6 text-muted-foreground" /><span className="mt-3 text-sm font-medium">{uploading ? "Uploading cover…" : "Drop a cover image here"}</span><span className="mt-1 text-xs text-muted-foreground">or browse from your device · JPG, PNG, WebP</span></button><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCover(file) }} />{uploadError && <p className="mt-3 text-sm text-destructive" role="alert">{uploadError}</p>}{coverUrl && <img src={coverUrl} alt="Uploaded project cover preview" className="mt-4 aspect-video w-full rounded-lg object-cover" />}<div className="mt-8 grid gap-5"><label className="grid gap-2 text-sm font-medium">Project title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Aster House — Brand Identity" className="rounded-md border border-input bg-background px-3 py-3 font-serif text-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label><label className="grid gap-2 text-sm font-medium">Subtitle<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="One line that sets the context" className="rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label><label className="grid gap-2 text-sm font-medium">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What changed because of this project?" className="resize-y rounded-md border border-input bg-background px-3 py-2 leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label></div></div>
        <div className="border-b border-border p-5 md:p-8"><div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Project canvas</p><h2 className="mt-1 font-serif text-2xl">Build your story</h2></div><div className="flex items-center gap-2"><button className="rounded-md border border-border p-2 hover:bg-secondary" aria-label="Copy selected block"><Copy className="size-4" /></button><button onClick={() => addBlock("Text")} className="rounded-md bg-foreground px-3 py-2 text-sm text-background"><Plus className="mr-1 inline size-4" />Add block</button></div></div><div className="grid gap-3">{blocks.map((block) => <article key={block.id} onClick={() => setSelected(block.id)} className={`group rounded-lg border bg-background transition-shadow ${selected === block.id ? "border-foreground shadow-md" : "border-border hover:border-muted-foreground"}`} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", block.id)}><div className="flex items-center gap-3 border-b border-border px-4 py-3"><GripVertical className="size-4 cursor-grab text-muted-foreground" /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{block.type}</span><span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"><button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id) }} className="rounded p-1.5 hover:bg-secondary" aria-label="Duplicate block"><Copy className="size-3.5" /></button><button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id) }} className="rounded p-1.5 hover:bg-secondary" aria-label="Delete block"><Trash2 className="size-3.5" /></button><MoreHorizontal className="size-4 text-muted-foreground" /></span></div>{block.type === "image" || block.type.includes("image") ? <button onClick={() => fileRef.current?.click()} className="flex min-h-40 w-full items-center justify-center bg-secondary/60 text-muted-foreground hover:bg-secondary"><ImagePlus className="mr-2 size-5" />Add media</button> : block.type === "divider" ? <div className="p-6"><div className="border-t border-border" /></div> : <div className="p-5"><input value={block.title} onChange={(e) => updateBlock(block.id, e.target.value)} className="w-full bg-transparent font-serif text-xl outline-none" aria-label="Block title" /><textarea value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} rows={3} className="mt-3 w-full resize-y bg-transparent text-sm leading-relaxed text-muted-foreground outline-none" aria-label="Block content" /></div>}</article>)}</div><div className="mt-4 flex flex-wrap gap-2">{blockTypes.slice(0, 8).map((type) => <button key={type} onClick={() => addBlock(type)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary">+ {type}</button>)}</div></div>
      </section>
      <aside className="h-fit rounded-xl border border-border bg-background shadow-sm lg:sticky lg:top-22"><nav className="grid grid-cols-3 border-b border-border p-1" aria-label="Editor settings"><button onClick={() => setSidebar("details")} className={`rounded-md px-2 py-2 text-xs ${sidebar === "details" ? "bg-secondary font-medium" : "text-muted-foreground"}`}>Details</button><button onClick={() => setSidebar("seo")} className={`rounded-md px-2 py-2 text-xs ${sidebar === "seo" ? "bg-secondary font-medium" : "text-muted-foreground"}`}>SEO</button><button onClick={() => setSidebar("analytics")} className={`rounded-md px-2 py-2 text-xs ${sidebar === "analytics" ? "bg-secondary font-medium" : "text-muted-foreground"}`}>Stats</button></nav><div className="flex flex-col gap-6 p-5">{sidebar === "details" && <><Field label="URL slug"><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="project-slug" /></Field><Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)}><option>Brand identity</option><option>Digital experience</option><option>Packaging</option><option>Strategy</option></select></Field><Field label="Creative fields"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-2 py-1 text-xs">Branding</span><span className="rounded-full bg-secondary px-2 py-1 text-xs">Art direction</span><button className="rounded-full border border-dashed border-border px-2 py-1 text-xs">+ Add</button></div></Field><Field label="Tags"><input placeholder="identity, strategy, design" /></Field><Field label="Visibility"><select><option>Public</option><option>Private draft</option><option>Unlisted</option></select></Field></>}{sidebar === "seo" && <><Field label="Meta title"><input value={title} onChange={(e) => setTitle(e.target.value)} /></Field><Field label="Meta description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} /></Field><Field label="Open Graph image"><button onClick={() => fileRef.current?.click()} className="w-full rounded-md border border-dashed border-border px-3 py-6 text-xs text-muted-foreground">Upload social image</button></Field><div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">SEO score <strong className="text-foreground">{ready ? "Good" : "Needs work"}</strong></div></>}{sidebar === "analytics" && <div className="grid gap-3">{[["Views", "—"], ["Appreciations", "—"], ["Saves", "—"], ["Comments", "—"]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><strong>{value}</strong></div>)}<p className="text-xs leading-relaxed text-muted-foreground">Analytics appear after this project receives traffic.</p></div>}</div></aside>
    </div>
    {publishOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" role="dialog" aria-modal="true" aria-labelledby="publish-title"><div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl md:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Final review</p><h2 id="publish-title" className="mt-2 font-serif text-3xl">Ready to publish?</h2></div><button onClick={() => setPublishOpen(false)} aria-label="Close"><X className="size-5" /></button></div><div className="mt-6 grid gap-3">{checklist.map(([complete, label]) => <div key={label} className="flex items-center gap-3 text-sm"><span className={`grid size-5 place-items-center rounded-full ${complete ? "bg-[#1c6538] text-white" : "border border-border"}`}>{complete && <Check className="size-3" />}</span>{label}</div>)}</div><button disabled={!ready} onClick={publish} className="mt-8 w-full rounded-md bg-foreground px-4 py-3 text-sm text-background disabled:cursor-not-allowed disabled:opacity-40">{ready ? "Publish project" : "Complete checklist to publish"}</button></div></div>}
  </main>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-medium">{label}{children}</label> }
