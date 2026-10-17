"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { getVersion, listVersions, saveCanvas, suggestImageDetails } from "@/app/actions/moodboards"
import { GRID, ITEM_NAMES, MIN_SIZE, STICKY_COLOURS, boundsOf, describeItem, intersects, makeItem, parseEmbed, snap, type Canvas, type CanvasItem, type CanvasItemType, type Rect } from "@/lib/canvas"
import { IMAGE_ASPECTS, newId, paletteExports } from "@/lib/moodboards"
import { extractPalette } from "@/lib/palette"
import { uploadToBlob } from "@/lib/upload-client"
import { ItemView } from "@/components/moodboards/canvas/item-view"
import { ConnectorLayer, MiniMap, ZoomControls, backgroundStyle } from "@/components/moodboards/canvas/canvas-stage"
import { useBoard } from "@/components/moodboards/canvas/use-board"
import { useViewport } from "@/components/moodboards/canvas/use-viewport"

type Comment = { id: string; author: string; body: string; fromClient: boolean; kind: string; itemId: string | null; createdAt: Date }
type Board = { id: string; title: string; clientName: string | null; shareToken: string; shared: boolean; status: string; canvas: Canvas; comments: Comment[] }

type Drag =
  | { kind: "move"; ids: string[]; start: { x: number; y: number }; base: Canvas; origin: Map<string, { x: number; y: number }> }
  | { kind: "resize"; id: string; handle: string; start: { x: number; y: number }; base: Canvas; rect: Rect; keepRatio: boolean }
  | { kind: "pan"; start: { x: number; y: number }; view: { x: number; y: number } }
  | { kind: "marquee"; start: { x: number; y: number }; rect: Rect; additive: boolean }
  | { kind: "connect"; from: string; to: { x: number; y: number } }

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const
const inputClass = "w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground"

export function BoardEditor({ board }: { board: Board }) {
  const b = useBoard(board.canvas)
  const { canvas } = b
  const { view, setView, ref, toCanvas, zoomAt, fitTo, fitItems } = useViewport()
  const [selected, setSelected] = useState<string[]>([])
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] })
  const [tool, setTool] = useState<"select" | "connect" | "pan">("select")
  const [snapOn, setSnapOn] = useState(true)
  const [panel, setPanel] = useState<"inspector" | "layers" | "comments" | "history" | null>("inspector")
  const [panelOpen, setPanelOpen] = useState(false) // narrow screens only; the panel is always docked from lg up
  const [saveState, setSaveState] = useState<{ status: "saved" | "saving" | "error" | "dirty"; at?: string; error?: string }>({ status: "saved" })
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)
  const lastSnapshot = useRef(Date.now())
  const editingText = useRef(false)

  const selectedItems = useMemo(() => canvas.items.filter((i) => selected.includes(i.id)), [canvas.items, selected])
  const single = selectedItems.length === 1 ? selectedItems[0] : null
  const sorted = useMemo(() => [...canvas.items].sort((a, c) => a.z - c.z), [canvas.items])
  const commentCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of board.comments) if (c.itemId) m.set(c.itemId, (m.get(c.itemId) ?? 0) + 1)
    return m
  }, [board.comments])

  useEffect(() => { fitItems(canvas.items) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Autosave: 1.5 s after the last change; a version snapshot every 5 minutes of edits.
  useEffect(() => {
    if (!b.dirty) return
    setSaveState((s) => ({ ...s, status: "dirty" }))
    const t = setTimeout(async () => {
      setSaveState((s) => ({ ...s, status: "saving" }))
      const snapshot = Date.now() - lastSnapshot.current > 5 * 60_000
      const result = await saveCanvas(board.id, canvas, snapshot).catch(() => ({ ok: false as const, error: "Lost connection. Your changes are kept here; they'll save when it's back." }))
      if (result.ok) {
        if (snapshot) lastSnapshot.current = Date.now()
        b.markSaved()
        setSaveState({ status: "saved", at: result.savedAt })
      } else setSaveState({ status: "error", error: result.error })
    }, 1500)
    return () => clearTimeout(t)
  }, [canvas, b.dirty]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (b.dirty) { e.preventDefault() } }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [b.dirty])

  // ── Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) b.redo(); else b.undo(); return }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); b.redo(); return }
      if (typing) return
      if (e.key === "Escape") { setSelected([]); setSelectedConnector(null); setTool("select"); return }
      if ((e.key === "Delete" || e.key === "Backspace")) { if (selectedConnector) { b.removeConnector(selectedConnector); setSelectedConnector(null) } else if (selected.length) { b.removeItems(selected); setSelected([]) } return }
      if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); if (selected.length) setSelected(b.duplicateItems(selected)); return }
      if (mod && e.key.toLowerCase() === "a") { e.preventDefault(); setSelected(canvas.items.filter((i) => !i.locked).map((i) => i.id)); return }
      if (mod && e.key.toLowerCase() === "g") { e.preventDefault(); if (e.shiftKey) b.ungroup(selected); else b.group(selected); return }
      if (e.key === "v") setTool("select")
      if (e.key === "c") setTool("connect")
      if (e.key === "h" || e.key === " ") { if (e.key === " ") e.preventDefault(); setTool("pan") }
      if (e.key === "f") fitItems(canvas.items)
      if (e.key === "l" && selected.length) b.setLocked(selected, !selectedItems.every((i) => i.locked))
      if (e.key === "]" ) b.reorder(selected, mod ? "front" : "forward")
      if (e.key === "[" ) b.reorder(selected, mod ? "back" : "backward")
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selected.length) {
        e.preventDefault()
        const d = e.shiftKey ? GRID * 4 : GRID
        const dx = e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0, dy = e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0
        b.updateItems(b.expandSelection(selected), (i) => ({ ...i, x: i.x + dx, y: i.y + dy }))
      }
    }
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === " ") setTool("select") }
    window.addEventListener("keydown", onKey)
    window.addEventListener("keyup", onKeyUp)
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKeyUp) }
  }, [b, canvas.items, selected, selectedItems, selectedConnector, fitItems])

  // ── Adding items
  // New items go to the middle of the view when zoomed in; when zoomed out so the whole
  // board is tiny, they go just right of the content instead, so the board stays compact.
  const centre = () => {
    const el = ref.current
    // New items land in the middle of what's on screen, nudged a little so repeats don't stack exactly.
    const c = el ? toCanvas(el.getBoundingClientRect().left + el.clientWidth / 2, el.getBoundingClientRect().top + el.clientHeight / 2) : { x: 0, y: 0 }
    return { x: c.x - 120 + (Math.random() * 40 - 20), y: c.y - 80 + (Math.random() * 40 - 20) }
  }
  const add = (type: CanvasItemType, patch: Partial<CanvasItem> = {}) => {
    const item = { ...makeItem(type, centre(), 0), ...patch } as CanvasItem
    b.addItem(item)
    setSelected([item.id])
    setPanel("inspector")
    // Zoomed far out, a new item would be a speck: bring it up to a workable size.
    if (view.scale < 0.5) fitTo({ x: item.x - 240, y: item.y - 160, w: item.w + 480, h: item.h + 320 })
    return item
  }
  async function addImages(files: File[], at?: { x: number; y: number }) {
    setUploading(true)
    setMessage("")
    try {
      let offset = 0
      for (const file of files) {
        const [uploaded, palette, size] = await Promise.all([uploadToBlob(file, "moodboards"), extractPalette(file, 5).catch(() => []), imageSize(file)])
        const w = 320, h = Math.round((w * size.h) / size.w) || 240
        const pos = at ? { x: at.x + offset, y: at.y + offset } : centre()
        const item = { ...makeItem("image", pos, 0), url: uploaded.url, w, h, palette } as CanvasItem
        b.addItem(item)
        setSelected([item.id])
        offset += 32
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }
  const onPaste = useCallback((e: ClipboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
    const files = [...(e.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"))
    if (files.length) { e.preventDefault(); void addImages(files); return }
    const text = e.clipboardData?.getData("text")?.trim()
    if (text && /^https?:\/\//.test(text)) {
      e.preventDefault()
      const embed = parseEmbed(text)
      if (embed.src) add("embed", { url: text, provider: embed.provider, title: embed.title } as Partial<CanvasItem>)
      else if (/\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(text)) add("image", { url: text } as Partial<CanvasItem>)
      else add("link", { url: text } as Partial<CanvasItem>)
    } else if (text) add("note", { text } as Partial<CanvasItem>)
  }, [canvas]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { window.addEventListener("paste", onPaste); return () => window.removeEventListener("paste", onPaste) }, [onPaste])

  // ── Pointer interactions on the stage
  // With pointer capture, e.target is the stage; use the element under the cursor instead.
  const hit = (e: React.PointerEvent) => document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-item]")?.dataset.item ?? null
  const selectedRef = useRef(selected)
  selectedRef.current = selected
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || tool === "pan" || (e.button === 0 && e.altKey)) {
      setDrag({ kind: "pan", start: { x: e.clientX, y: e.clientY }, view: { x: view.x, y: view.y } })
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      return
    }
    if (e.button !== 0) return
    const handle = (e.target as HTMLElement).dataset.handle
    const id = hit(e)
    const p = toCanvas(e.clientX, e.clientY)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    if (handle && single) {
      setDrag({ kind: "resize", id: single.id, handle, start: p, base: canvas, rect: { x: single.x, y: single.y, w: single.w, h: single.h }, keepRatio: single.type === "image" || e.shiftKey })
      return
    }
    if (tool === "connect") {
      if (id) setDrag({ kind: "connect", from: id, to: p })
      return
    }
    setSelectedConnector(null)
    if (id) {
      const item = canvas.items.find((i) => i.id === id)!
      const current = selectedRef.current
      let ids = current
      if (e.shiftKey) ids = current.includes(id) ? current.filter((s) => s !== id) : [...current, id]
      else if (!current.includes(id)) ids = item.group ? canvas.items.filter((i) => i.group === item.group).map((i) => i.id) : [id]
      setSelected(ids)
      if (item.locked || e.shiftKey) return
      const moving = b.expandSelection(ids)
      setDrag({ kind: "move", ids: moving, start: p, base: canvas, origin: new Map(canvas.items.filter((i) => moving.includes(i.id)).map((i) => [i.id, { x: i.x, y: i.y }])) })
    } else {
      if (!e.shiftKey) setSelected([])
      setDrag({ kind: "marquee", start: p, rect: { x: p.x, y: p.y, w: 0, h: 0 }, additive: e.shiftKey })
    }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return
    const p = toCanvas(e.clientX, e.clientY)
    if (drag.kind === "pan") { setView({ ...view, x: drag.view.x + e.clientX - drag.start.x, y: drag.view.y + e.clientY - drag.start.y }); return }
    if (drag.kind === "marquee") {
      const rect = { x: Math.min(drag.start.x, p.x), y: Math.min(drag.start.y, p.y), w: Math.abs(p.x - drag.start.x), h: Math.abs(p.y - drag.start.y) }
      setDrag({ ...drag, rect })
      const inside = canvas.items.filter((i) => i.type !== "frame" && intersects(rect, i)).map((i) => i.id)
      setSelected(drag.additive ? [...new Set([...selected, ...inside])] : inside)
      return
    }
    if (drag.kind === "connect") { setDrag({ ...drag, to: p }); return }
    if (drag.kind === "move") {
      let dx = p.x - drag.start.x, dy = p.y - drag.start.y
      const moving = drag.base.items.filter((i) => drag.ids.includes(i.id))
      const lead = moving[0]
      if (lead && !e.altKey) {
        const o = drag.origin.get(lead.id)!
        const bounds = boundsOf(moving.map((i) => ({ ...i, x: drag.origin.get(i.id)!.x + dx, y: drag.origin.get(i.id)!.y + dy })))
        const g = alignmentGuides(bounds, drag.base.items.filter((i) => !drag.ids.includes(i.id)), 6 / view.scale)
        if (g.dx !== null) dx += g.dx
        else if (snapOn) dx = snap(o.x + dx) - o.x
        if (g.dy !== null) dy += g.dy
        else if (snapOn) dy = snap(o.y + dy) - o.y
        setGuides({ v: g.v, h: g.h })
      }
      b.preview({ ...drag.base, items: drag.base.items.map((i) => (drag.ids.includes(i.id) ? { ...i, x: drag.origin.get(i.id)!.x + dx, y: drag.origin.get(i.id)!.y + dy } : i)) })
      return
    }
    if (drag.kind === "resize") {
      const { rect, handle } = drag
      let { x, y, w, h } = rect
      const dx = p.x - drag.start.x, dy = p.y - drag.start.y
      if (handle.includes("e")) w = rect.w + dx
      if (handle.includes("s")) h = rect.h + dy
      if (handle.includes("w")) { w = rect.w - dx; x = rect.x + dx }
      if (handle.includes("n")) { h = rect.h - dy; y = rect.y + dy }
      if (drag.keepRatio && handle.length === 2) { const r = rect.w / rect.h; if (Math.abs(dx) > Math.abs(dy)) { h = w / r; if (handle.includes("n")) y = rect.y + rect.h - h } else { w = h * r; if (handle.includes("w")) x = rect.x + rect.w - w } }
      w = Math.max(MIN_SIZE, w); h = Math.max(MIN_SIZE, h)
      if (snapOn) { w = Math.max(MIN_SIZE, snap(w)); h = Math.max(MIN_SIZE, snap(h)); if (handle.includes("w")) x = rect.x + rect.w - w; if (handle.includes("n")) y = rect.y + rect.h - h }
      b.preview({ ...drag.base, items: drag.base.items.map((i) => (i.id === drag.id ? { ...i, x, y, w, h } : i)) })
    }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return
    if (drag.kind === "move" || drag.kind === "resize") b.commit(canvas, drag.base)
    if (drag.kind === "connect") { const to = hit(e); if (to) b.connect(drag.from, to) }
    setDrag(null)
    setGuides({ v: [], h: [] })
  }
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith("image/"))
    const at = toCanvas(e.clientX, e.clientY)
    if (files.length) await addImages(files, at)
    else { const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain"); if (/^https?:\/\//.test(url)) { const embed = parseEmbed(url); if (embed.src) add("embed", { url, provider: embed.provider, title: embed.title, x: at.x, y: at.y } as Partial<CanvasItem>); else add("link", { url, x: at.x, y: at.y } as Partial<CanvasItem>) } }
  }

  const patchSingle = (patch: Partial<CanvasItem>, record = true) => { if (single) b.updateItems([single.id], (i) => ({ ...i, ...patch } as CanvasItem), record) }
  const cursor = drag?.kind === "pan" || tool === "pan" ? "cursor-grab" : tool === "connect" ? "cursor-crosshair" : ""
  const selBounds = selectedItems.length > 1 ? boundsOf(selectedItems) : null

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = [...(e.target.files ?? [])]; e.target.value = ""; if (files.length) void addImages(files) }} />
      {/* Top bar */}
      <header className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm sm:gap-3">
        <Link href="/admin/moodboards" className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest hover:bg-secondary">← Moodboards</Link>
        <div className="min-w-0"><p className="truncate font-serif text-lg leading-tight">{board.title}</p><p className="text-[11px] text-muted-foreground">{board.clientName || "No client"} · {board.shared ? "link on" : "link off"}</p></div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs ${saveState.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>{saveState.status === "saved" ? (saveState.at ? `Saved ${new Date(saveState.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "Saved") : saveState.status === "saving" ? "Saving…" : saveState.status === "dirty" ? "Unsaved changes" : saveState.error}</span>
          <button type="button" onClick={async () => { setSaveState((s) => ({ ...s, status: "saving" })); const r = await saveCanvas(board.id, canvas, "Manual save"); if (r.ok) { b.markSaved(); lastSnapshot.current = Date.now(); setSaveState({ status: "saved", at: r.savedAt }) } else setSaveState({ status: "error", error: r.error }) }} className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary">Save version</button>
          <a href={`/m/${board.shareToken}`} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs text-background"><span className="hidden sm:inline">Preview as client</span><span className="sm:hidden">Preview</span> ↗</a>
          <button type="button" onClick={() => setPanelOpen((o) => !o)} className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary lg:hidden" aria-expanded={panelOpen}>{panelOpen ? "Close panel" : "Panel"}</button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Tool rail */}
        <aside className="flex w-14 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-border py-2">
          <Tool label="Select (V)" active={tool === "select"} onClick={() => setTool("select")}>↖</Tool>
          <Tool label="Pan (H / hold space)" active={tool === "pan"} onClick={() => setTool("pan")}>✋</Tool>
          <Tool label="Connect (C): drag from one item to another" active={tool === "connect"} onClick={() => setTool("connect")}>⤳</Tool>
          <div className="my-1 h-px w-8 bg-border" />
          <Tool label="Upload images" onClick={() => fileInput.current?.click()}>{uploading ? "…" : "🖼"}</Tool>
          <Tool label="Note" onClick={() => add("note")}>T</Tool>
          <Tool label="Sticky note" onClick={() => add("sticky")}>▣</Tool>
          <Tool label="Colour swatch" onClick={() => add("colour")}>●</Tool>
          <Tool label="Palette" onClick={() => add("palette")}>▤</Tool>
          <Tool label="Typeface" onClick={() => add("font")}>Aa</Tool>
          <Tool label="Link" onClick={() => add("link")}>↗</Tool>
          <Tool label="Embed (Figma, Pinterest, Behance, Canva, YouTube, Vimeo)" onClick={() => add("embed")}>▭</Tool>
          <Tool label="Frame" onClick={() => add("frame")}>▢</Tool>
          <Tool label="Shape" onClick={() => add("shape")}>◯</Tool>
          <div className="my-1 h-px w-8 bg-border" />
          <Tool label="Undo (⌘Z)" onClick={b.undo} disabled={!b.canUndo}>↶</Tool>
          <Tool label="Redo (⇧⌘Z)" onClick={b.redo} disabled={!b.canRedo}>↷</Tool>
          <Tool label="Auto layout (tidy selection, or everything)" onClick={() => b.tidy(selected)}>⊞</Tool>
          <Tool label={snapOn ? "Snap to grid: on" : "Snap to grid: off"} active={snapOn} onClick={() => setSnapOn((s) => !s)}>#</Tool>
        </aside>

        {/* Stage */}
        <div ref={ref} className={`relative min-w-0 flex-1 touch-none overflow-hidden select-none ${cursor}`} style={backgroundStyle(canvas.background, view)} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onDoubleClick={() => { if (single && (single.type === "note" || single.type === "sticky")) editingText.current = true }}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
            <ConnectorLayer canvas={canvas} selected={selectedConnector} onSelect={(id) => { setSelectedConnector(id); setSelected([]) }} />
            {drag?.kind === "connect" && (() => { const from = canvas.items.find((i) => i.id === drag.from); return from ? <svg className="pointer-events-none absolute overflow-visible" style={{ left: 0, top: 0, zIndex: 998 }}><line x1={from.x + from.w / 2} y1={from.y + from.h / 2} x2={drag.to.x} y2={drag.to.y} stroke="#1B1A16" strokeWidth={1.5} strokeDasharray="6 4" /></svg> : null })()}
            {sorted.map((item) => {
              const isSel = selected.includes(item.id)
              const count = commentCounts.get(item.id)
              return (
                <div key={item.id} data-item={item.id} className={`absolute ${item.locked ? "" : ""}`} style={{ left: item.x, top: item.y, width: item.w, height: item.h, zIndex: item.z + 1000, transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined }}>
                  <ItemView item={item} interactive={!drag} embedLive={isSel && single?.id === item.id} onEditText={isSel && single?.id === item.id && (item.type === "note" || item.type === "sticky") ? (text) => b.updateItems([item.id], (i) => ({ ...i, text } as CanvasItem)) : undefined} />
                  {isSel && <div className="pointer-events-none absolute -inset-0.5 rounded-xl ring-2 ring-foreground" style={{ zIndex: 2 }} />}
                  {item.locked && <span className="absolute left-1 top-1 rounded bg-background/80 px-1 text-[10px]">🔒</span>}
                  {count && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">{count}</span>}
                  {isSel && single?.id === item.id && !item.locked && HANDLES.map((h) => <span key={h} data-handle={h} className="absolute h-3 w-3 border border-foreground bg-background" style={{ ...handlePos(h), transform: "translate(-50%, -50%) scale(" + 1 / view.scale + ")", cursor: `${h}-resize`, zIndex: 3 }} />)}
                </div>
              )
            })}
            {selBounds && <div className="pointer-events-none absolute border border-dashed border-foreground" style={{ left: selBounds.x - 4, top: selBounds.y - 4, width: selBounds.w + 8, height: selBounds.h + 8, zIndex: 5000 }} />}
            {drag?.kind === "marquee" && <div className="pointer-events-none absolute border border-foreground bg-foreground/5" style={{ left: drag.rect.x, top: drag.rect.y, width: drag.rect.w, height: drag.rect.h, zIndex: 5001 }} />}
            {guides.v.map((x) => <div key={`v${x}`} className="pointer-events-none absolute w-px bg-[#BD3A2A]" style={{ left: x, top: -100000, height: 200000, zIndex: 5002 }} />)}
            {guides.h.map((y) => <div key={`h${y}`} className="pointer-events-none absolute h-px bg-[#BD3A2A]" style={{ top: y, left: -100000, width: 200000, zIndex: 5002 }} />)}
          </div>
          {canvas.items.length === 0 && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><p className="max-w-sm text-center text-sm text-muted-foreground">Empty board. Upload or paste images, add notes and swatches from the left rail, or drop a Figma, Pinterest or Behance link anywhere.</p></div>}
          <ZoomControls scale={view.scale} onZoom={(f) => zoomAt(f)} onFit={() => fitItems(canvas.items)} />
          <MiniMap canvas={canvas} view={view} viewport={ref.current} bounds={boundsOf(canvas.items)} onJump={(x, y) => setView({ ...view, x, y })} />
          {message && <p role="alert" className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-destructive bg-background px-3 py-1 text-xs text-destructive">{message} <button type="button" onClick={() => setMessage("")} className="ml-2 underline">dismiss</button></p>}
        </div>

        {/* Right panel: docked on wide screens, a sheet over the stage on narrow ones */}
        <aside className={`flex-col border-l border-border bg-background ${panelOpen ? "absolute inset-y-0 right-0 z-30 flex w-72 max-w-[85vw] shadow-xl lg:static lg:max-w-none lg:shadow-none" : "hidden lg:flex lg:w-72"}`}>
          <div className="flex border-b border-border text-xs">
            {(["inspector", "layers", "comments", "history"] as const).map((key) => <button key={key} type="button" onClick={() => setPanel(panel === key ? null : key)} className={`flex-1 py-2 capitalize ${panel === key ? "bg-foreground text-background" : "hover:bg-secondary"}`}>{key === "comments" && board.comments.length ? `Comments (${board.comments.length})` : key}</button>)}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 text-sm">
            {panel === "inspector" && (
              single ? <Inspector item={single} canvas={canvas} boardTitle={board.title} onPatch={patchSingle} onRemove={() => { b.removeItems([single.id]); setSelected([]) }} onDuplicate={() => setSelected(b.duplicateItems([single.id]))} onOrder={(how) => b.reorder([single.id], how)} onLock={() => b.setLocked([single.id], !single.locked)} onPalette={(colours) => { const item = { ...makeItem("palette", { x: single.x + single.w + 24, y: single.y }, 0), colours, name: single.type === "image" ? single.caption || "From image" : "Palette" } as CanvasItem; b.addItem(item) }} setMessage={setMessage} />
              : selectedConnector ? <ConnectorInspector connector={canvas.connectors.find((c) => c.id === selectedConnector)!} onPatch={(p) => b.updateConnector(selectedConnector, p)} onRemove={() => { b.removeConnector(selectedConnector); setSelectedConnector(null) }} />
              : selectedItems.length > 1 ? (
                <div className="space-y-3">
                  <p className="font-serif text-lg">{selectedItems.length} items</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => b.group(selected)} className="rounded-lg border border-border px-3 py-1.5">Group (⌘G)</button>
                    <button type="button" onClick={() => b.ungroup(selected)} className="rounded-lg border border-border px-3 py-1.5">Ungroup</button>
                    <button type="button" onClick={() => b.setLocked(selected, !selectedItems.every((i) => i.locked))} className="rounded-lg border border-border px-3 py-1.5">{selectedItems.every((i) => i.locked) ? "Unlock" : "Lock"}</button>
                    <button type="button" onClick={() => b.tidy(selected)} className="rounded-lg border border-border px-3 py-1.5">Auto layout</button>
                    <button type="button" onClick={() => { const bb = boundsOf(selectedItems); const frame = { ...makeItem("frame", { x: bb.x - 32, y: bb.y - 64 }, 0), w: snap(bb.w + 64), h: snap(bb.h + 96), title: "Frame" } as CanvasItem; b.addItem(frame); setSelected([frame.id]) }} className="rounded-lg border border-border px-3 py-1.5">Wrap in frame</button>
                    <button type="button" onClick={() => setSelected(b.duplicateItems(selected))} className="rounded-lg border border-border px-3 py-1.5">Duplicate</button>
                    <button type="button" onClick={() => { b.removeItems(selected); setSelected([]) }} className="rounded-lg border border-destructive px-3 py-1.5 text-destructive">Delete</button>
                  </div>
                  <p className="text-xs text-muted-foreground">Arrange: align with the guides while dragging, or press [ and ] to change the order.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-serif text-lg">Board</p>
                  <label className="grid gap-1.5">Background<select className={inputClass} value={canvas.background ?? "dots"} onChange={(e) => b.setBackground(e.target.value as Canvas["background"])}><option value="dots">Dots</option><option value="grid">Grid</option><option value="plain">Plain</option></select></label>
                  <p className="text-xs leading-relaxed text-muted-foreground">Click an item to edit it. Shift-click or drag on empty space to select several. Scroll to pan, pinch or ⌘-scroll to zoom, space-drag to pan. Paste an image or a link straight onto the board.</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">Keys: V select · H pan · C connect · F fit · L lock · ⌘D duplicate · ⌘G group · [ ] order · arrows nudge · Delete.</p>
                </div>
              )
            )}
            {panel === "layers" && <Layers items={sorted} selected={selected} onSelect={(id, additive) => setSelected(additive ? (selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]) : [id])} onLock={(id, locked) => b.setLocked([id], locked)} />}
            {panel === "comments" && <CommentsPanel comments={board.comments} items={canvas.items} onJump={(id) => { const item = canvas.items.find((i) => i.id === id); if (item) { setSelected([id]); fitItems([item]) } }} />}
            {panel === "history" && <History boardId={board.id} onRestore={(c) => { b.replace(c); setSelected([]) }} />}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${active ? "bg-foreground text-background" : "hover:bg-secondary"} disabled:opacity-30`}>{children}</button>
}

function handlePos(h: string): React.CSSProperties {
  const x = h.includes("w") ? "0%" : h.includes("e") ? "100%" : "50%"
  const y = h.includes("n") ? "0%" : h.includes("s") ? "100%" : "50%"
  return { left: x, top: y }
}

// Snaps the dragged bounds to other items' edges and centres within `tolerance`.
function alignmentGuides(moving: Rect, others: Rect[], tolerance: number) {
  const xs = [moving.x, moving.x + moving.w / 2, moving.x + moving.w]
  const ys = [moving.y, moving.y + moving.h / 2, moving.y + moving.h]
  let dx: number | null = null, dy: number | null = null
  const v: number[] = [], h: number[] = []
  for (const o of others) {
    for (const ox of [o.x, o.x + o.w / 2, o.x + o.w]) for (const mx of xs) { const d = ox - mx; if (Math.abs(d) <= tolerance && (dx === null || Math.abs(d) < Math.abs(dx))) { dx = d; v.length = 0; v.push(ox) } }
    for (const oy of [o.y, o.y + o.h / 2, o.y + o.h]) for (const my of ys) { const d = oy - my; if (Math.abs(d) <= tolerance && (dy === null || Math.abs(d) < Math.abs(dy))) { dy = d; h.length = 0; h.push(oy) } }
  }
  return { dx, dy, v, h }
}

function imageSize(file: File) {
  return new Promise<{ w: number; h: number }>((resolve) => {
    const img = new Image()
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(img.src) }
    img.onerror = () => resolve({ w: 4, h: 3 })
    img.src = URL.createObjectURL(file)
  })
}

function Inspector({ item, canvas, boardTitle, onPatch, onRemove, onDuplicate, onOrder, onLock, onPalette, setMessage }: { item: CanvasItem; canvas: Canvas; boardTitle: string; onPatch: (patch: Partial<CanvasItem>, record?: boolean) => void; onRemove: () => void; onDuplicate: () => void; onOrder: (how: "front" | "back" | "forward" | "backward") => void; onLock: () => void; onPalette: (colours: string[]) => void; setMessage: (m: string) => void }) {
  const [busy, setBusy] = useState("")
  const field = (label: string, node: React.ReactNode) => <label className="grid gap-1.5">{label}{node}</label>
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between"><p className="font-serif text-lg">{ITEM_NAMES[item.type]}</p><span className="text-[11px] text-muted-foreground">{Math.round(item.w)} × {Math.round(item.h)}</span></div>
      {item.type === "image" && (
        <>
          {field("Image link", <input className={inputClass} value={item.url} onChange={(e) => onPatch({ url: e.target.value })} placeholder="https://…" />)}
          {field("Caption", <input className={inputClass} value={item.caption ?? ""} onChange={(e) => onPatch({ caption: e.target.value })} maxLength={300} />)}
          {field("Crop", <select className={inputClass} value={item.aspect ?? "auto"} onChange={(e) => onPatch({ aspect: e.target.value as never })}>{IMAGE_ASPECTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select>)}
          <div className="grid gap-1.5"><span>Focal point</span><FocalPicker url={item.url} focal={item.focal ?? { x: 0.5, y: 0.5 }} onChange={(focal) => onPatch({ focal })} /></div>
          {field("Tags", <input className={inputClass} value={(item.tags ?? []).join(", ")} onChange={(e) => onPatch({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12) })} placeholder="warm, tactile, serif" />)}
          {item.palette && item.palette.length > 0 && <div className="flex items-center gap-1">{item.palette.map((hex) => <span key={hex} title={hex} className="h-6 w-6 rounded-full border border-border" style={{ background: hex }} />)}<button type="button" onClick={() => onPalette(item.palette!)} className="ml-auto text-xs underline">Save as palette</button></div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!item.url || busy === "palette"} onClick={async () => { setBusy("palette"); try { onPatch({ palette: await extractPalette(item.url, 5) }) } catch (e) { setMessage(e instanceof Error ? e.message : "Couldn't read the colours") } finally { setBusy("") } }} className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40">{busy === "palette" ? "Reading…" : "Extract colours"}</button>
            <button type="button" disabled={!item.url || busy === "ai"} onClick={async () => { setBusy("ai"); const r = await suggestImageDetails(item.url, boardTitle); if (r.ok) onPatch({ tags: r.insight.keywords, caption: item.caption || r.insight.caption }); else setMessage(r.error); setBusy("") }} className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40">{busy === "ai" ? "Thinking…" : "Suggest keywords"}</button>
          </div>
        </>
      )}
      {(item.type === "note" || item.type === "sticky") && field("Text", <textarea className={`${inputClass} min-h-28`} value={item.text} onChange={(e) => onPatch({ text: e.target.value })} />)}
      {item.type === "note" && field("Size", <select className={inputClass} value={item.size ?? "m"} onChange={(e) => onPatch({ size: e.target.value as never })}><option value="s">Small</option><option value="m">Medium</option><option value="l">Large</option></select>)}
      {item.type === "sticky" && <div className="flex gap-2">{(Object.keys(STICKY_COLOURS) as (keyof typeof STICKY_COLOURS)[]).map((c) => <button key={c} type="button" title={STICKY_COLOURS[c].label} onClick={() => onPatch({ colour: c })} className={`h-7 w-7 rounded-full border ${item.colour === c ? "border-foreground ring-2 ring-foreground ring-offset-1" : "border-border"}`} style={{ background: STICKY_COLOURS[c].bg }} />)}</div>}
      {item.type === "colour" && (
        <>
          <div className="flex items-center gap-2"><input type="color" value={/^#[0-9a-fA-F]{6}$/.test(item.hex) ? item.hex : "#1b1a16"} onChange={(e) => onPatch({ hex: e.target.value.toUpperCase() })} className="h-9 w-12 cursor-pointer border border-border bg-transparent" /><input className={inputClass} value={item.hex} onChange={(e) => onPatch({ hex: e.target.value })} maxLength={7} /></div>
          {field("Name", <input className={inputClass} value={item.name ?? ""} onChange={(e) => onPatch({ name: e.target.value })} maxLength={60} />)}
          {field("Note", <input className={inputClass} value={item.note ?? ""} onChange={(e) => onPatch({ note: e.target.value })} maxLength={300} placeholder="Where it's used" />)}
        </>
      )}
      {item.type === "palette" && (
        <>
          {field("Name", <input className={inputClass} value={item.name ?? ""} onChange={(e) => onPatch({ name: e.target.value })} maxLength={60} />)}
          <div className="grid gap-1.5">
            {item.colours.map((hex, i) => <div key={i} className="flex items-center gap-2"><input type="color" value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000"} onChange={(e) => onPatch({ colours: item.colours.map((c, n) => (n === i ? e.target.value.toUpperCase() : c)) })} className="h-7 w-9 cursor-pointer border border-border bg-transparent" /><input className={inputClass} value={hex} onChange={(e) => onPatch({ colours: item.colours.map((c, n) => (n === i ? e.target.value : c)) })} maxLength={7} /><button type="button" onClick={() => onPatch({ colours: item.colours.filter((_, n) => n !== i) })} disabled={item.colours.length <= 1} className="text-xs disabled:opacity-30">×</button></div>)}
            {item.colours.length < 8 && <button type="button" onClick={() => onPatch({ colours: [...item.colours, "#888888"] })} className="w-fit text-xs underline">Add colour</button>}
          </div>
          <div className="flex flex-wrap gap-2">{(["hex", "rgb", "css", "tailwind"] as const).map((k) => <button key={k} type="button" onClick={() => navigator.clipboard?.writeText(paletteExports(item.colours, item.name)[k])} className="rounded-full border border-border px-2.5 py-1 text-[11px]">{{ hex: "Copy HEX", rgb: "Copy RGB", css: "CSS vars", tailwind: "Tailwind" }[k]}</button>)}</div>
        </>
      )}
      {item.type === "font" && (
        <>
          {field("Google Font", <input className={inputClass} value={item.family} onChange={(e) => onPatch({ family: e.target.value })} maxLength={80} />)}
          {field("Sample text", <input className={inputClass} value={item.sample ?? ""} onChange={(e) => onPatch({ sample: e.target.value })} maxLength={200} />)}
          {field("Note", <input className={inputClass} value={item.note ?? ""} onChange={(e) => onPatch({ note: e.target.value })} maxLength={300} placeholder="Role, e.g. headlines" />)}
        </>
      )}
      {item.type === "link" && (
        <>
          {field("Link", <input className={inputClass} value={item.url} onChange={(e) => onPatch({ url: e.target.value })} placeholder="https://…" />)}
          {field("Title", <input className={inputClass} value={item.title ?? ""} onChange={(e) => onPatch({ title: e.target.value })} maxLength={160} />)}
          {field("Note", <input className={inputClass} value={item.note ?? ""} onChange={(e) => onPatch({ note: e.target.value })} maxLength={300} />)}
        </>
      )}
      {item.type === "embed" && (
        <>
          {field("Link", <input className={inputClass} value={item.url} onChange={(e) => { const p = parseEmbed(e.target.value); onPatch({ url: e.target.value, provider: p.provider, title: item.title || p.title }) }} placeholder="Figma, Pinterest, Behance, Canva, YouTube or Vimeo link" />)}
          {field("Title", <input className={inputClass} value={item.title ?? ""} onChange={(e) => onPatch({ title: e.target.value })} maxLength={160} />)}
          <p className="text-xs text-muted-foreground">{parseEmbed(item.url).src ? `Embeds as ${parseEmbed(item.url).title}.` : item.url ? "This link can't be shown inline; it will open in a new tab." : ""}</p>
        </>
      )}
      {item.type === "frame" && (
        <>
          {field("Title", <input className={inputClass} value={item.title} onChange={(e) => onPatch({ title: e.target.value })} maxLength={120} />)}
          {field("Tone", <select className={inputClass} value={item.tone ?? "light"} onChange={(e) => onPatch({ tone: e.target.value as never })}><option value="light">Light</option><option value="dark">Dark</option></select>)}
          <p className="text-xs text-muted-foreground">Everything inside a frame moves with it. {canvas.items.filter((i) => i.type !== "frame" && i.x >= item.x && i.y >= item.y && i.x + i.w <= item.x + item.w && i.y + i.h <= item.y + item.h).length} items inside.</p>
        </>
      )}
      {item.type === "shape" && (
        <>
          {field("Shape", <select className={inputClass} value={item.shape} onChange={(e) => onPatch({ shape: e.target.value as never })}><option value="rect">Rectangle</option><option value="ellipse">Ellipse</option></select>)}
          <div className="flex items-center gap-2"><input type="color" value={item.fill ?? "#F5F5F3"} onChange={(e) => onPatch({ fill: e.target.value.toUpperCase() })} className="h-9 w-12 cursor-pointer border border-border bg-transparent" /><button type="button" onClick={() => onPatch({ fill: undefined })} className="text-xs underline">No fill</button></div>
          {field("Label", <input className={inputClass} value={item.label ?? ""} onChange={(e) => onPatch({ label: e.target.value })} maxLength={120} />)}
        </>
      )}
      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
        {field("X", <input className={inputClass} type="number" value={Math.round(item.x)} onChange={(e) => onPatch({ x: Number(e.target.value) })} />)}
        {field("Y", <input className={inputClass} type="number" value={Math.round(item.y)} onChange={(e) => onPatch({ y: Number(e.target.value) })} />)}
        {field("Width", <input className={inputClass} type="number" min={MIN_SIZE} value={Math.round(item.w)} onChange={(e) => onPatch({ w: Math.max(MIN_SIZE, Number(e.target.value)) })} />)}
        {field("Height", <input className={inputClass} type="number" min={MIN_SIZE} value={Math.round(item.h)} onChange={(e) => onPatch({ h: Math.max(MIN_SIZE, Number(e.target.value)) })} />)}
        {field("Rotation", <input className={inputClass} type="number" min={-180} max={180} value={item.rotation ?? 0} onChange={(e) => onPatch({ rotation: Number(e.target.value) || undefined })} />)}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border pt-3 text-xs">
        <button type="button" onClick={() => onOrder("forward")} className="rounded-lg border border-border px-2.5 py-1.5">Forward</button>
        <button type="button" onClick={() => onOrder("backward")} className="rounded-lg border border-border px-2.5 py-1.5">Back</button>
        <button type="button" onClick={() => onOrder("front")} className="rounded-lg border border-border px-2.5 py-1.5">To front</button>
        <button type="button" onClick={() => onOrder("back")} className="rounded-lg border border-border px-2.5 py-1.5">To back</button>
        <button type="button" onClick={onLock} className="rounded-lg border border-border px-2.5 py-1.5">{item.locked ? "Unlock" : "Lock"}</button>
        <button type="button" onClick={onDuplicate} className="rounded-lg border border-border px-2.5 py-1.5">Duplicate</button>
        <button type="button" onClick={onRemove} className="rounded-lg border border-destructive px-2.5 py-1.5 text-destructive">Delete</button>
      </div>
    </div>
  )
}

function FocalPicker({ url, focal, onChange }: { url: string; focal: { x: number; y: number }; onChange: (f: { x: number; y: number }) => void }) {
  if (!url) return null
  return (
    <div className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-lg border border-border bg-white" onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); onChange({ x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }) }}>
      <img src={url} alt="" draggable={false} className="h-full w-full object-contain" />
      <span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground shadow" style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }} />
    </div>
  )
}

function ConnectorInspector({ connector, onPatch, onRemove }: { connector: { id: string; label?: string }; onPatch: (p: { label?: string }) => void; onRemove: () => void }) {
  return (
    <div className="space-y-3">
      <p className="font-serif text-lg">Connector</p>
      <label className="grid gap-1.5">Label<input className={inputClass} value={connector.label ?? ""} onChange={(e) => onPatch({ label: e.target.value })} maxLength={120} placeholder="e.g. leads to" /></label>
      <button type="button" onClick={onRemove} className="rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive">Delete connector</button>
    </div>
  )
}

function Layers({ items, selected, onSelect, onLock }: { items: CanvasItem[]; selected: string[]; onSelect: (id: string, additive: boolean) => void; onLock: (id: string, locked: boolean) => void }) {
  const top = [...items].reverse()
  return (
    <ul className="divide-y divide-border">
      {top.map((item) => (
        <li key={item.id} className={`flex items-center gap-2 py-1.5 ${selected.includes(item.id) ? "font-semibold" : ""}`}>
          <button type="button" onClick={(e) => onSelect(item.id, e.shiftKey)} className="min-w-0 flex-1 truncate text-left text-xs">
            <span className="mr-1.5 text-muted-foreground">{ITEM_NAMES[item.type]}</span>{describeItem(item)}{item.group ? <span className="ml-1 text-[10px] text-muted-foreground">· grouped</span> : null}
          </button>
          <button type="button" onClick={() => onLock(item.id, !item.locked)} className="text-xs" title={item.locked ? "Unlock" : "Lock"}>{item.locked ? "🔒" : "🔓"}</button>
        </li>
      ))}
      {top.length === 0 && <li className="py-2 text-xs text-muted-foreground">No items yet.</li>}
    </ul>
  )
}

function CommentsPanel({ comments, items, onJump }: { comments: Comment[]; items: CanvasItem[]; onJump: (id: string) => void }) {
  const when = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kathmandu" }).format(new Date(d))
  return (
    <div className="space-y-3">
      {comments.map((c) => {
        const item = c.itemId ? items.find((i) => i.id === c.itemId) : null
        return (
          <div key={c.id} className={`border-l pl-3 ${c.fromClient ? "border-border" : "border-foreground"}`}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.author}{c.kind === "approval" ? " · approved" : c.kind === "changes" ? " · changes" : ""} · {when(c.createdAt)}</p>
            <p className="mt-1 whitespace-pre-line text-sm">{c.body}</p>
            {item && <button type="button" onClick={() => onJump(item.id)} className="mt-1 text-xs underline">On: {describeItem(item)}</button>}
          </div>
        )
      })}
      {comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet. Reply to clients from the Moodboards list.</p>}
    </div>
  )
}

function History({ boardId, onRestore }: { boardId: string; onRestore: (c: Canvas) => void }) {
  const [versions, setVersions] = useState<{ id: string; note: string | null; createdAt: Date; items: number }[] | null>(null)
  useEffect(() => { listVersions(boardId).then(setVersions).catch(() => setVersions([])) }, [boardId])
  const when = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kathmandu" }).format(new Date(d))
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">A version is kept every few minutes while you edit, and whenever you press Save version. Restoring keeps the current state in undo.</p>
      {versions === null && <p className="text-xs text-muted-foreground">Loading…</p>}
      {versions?.map((v) => <div key={v.id} className="flex items-center justify-between gap-2 border-t border-border py-2 text-xs"><div><p>{when(v.createdAt)}</p><p className="text-muted-foreground">{v.note || "Autosave"} · {v.items} items</p></div><button type="button" onClick={async () => { const c = await getVersion(v.id); if (c && window.confirm("Restore this version? You can undo afterwards.")) onRestore(c) }} className="rounded-lg border border-border px-2.5 py-1">Restore</button></div>)}
      {versions?.length === 0 && <p className="text-xs text-muted-foreground">No versions yet.</p>}
    </div>
  )
}
