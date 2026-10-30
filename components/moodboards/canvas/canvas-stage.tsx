"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { boundsOf, type Canvas, type CanvasItem, type Rect } from "@/lib/canvas"
import { ItemView } from "@/components/moodboards/canvas/item-view"
import { useViewport, type View } from "@/components/moodboards/canvas/use-viewport"

// Read-only canvas for the client page: pan with drag or trackpad, zoom with pinch or the
// buttons, fit to content, a mini-map, and comment pins on items.

export type Pin = { itemId: string; count: number }

export type CanvasStageControls = {
  fitTo: (rect: Rect, padding?: number, smooth?: boolean) => void
  fitItems: (items: Rect[], smooth?: boolean) => void
  zoomAt: (factor: number) => void
  resetView: () => void
}

export function CanvasStage({
  canvas,
  pins = [],
  onPickItem,
  selectedItem,
  onInitControls,
  presentationActive = false,
  activeSlideItemIds = null,
  children,
}: {
  canvas: Canvas
  pins?: Pin[]
  onPickItem?: (item: CanvasItem | null) => void
  selectedItem?: string | null
  onInitControls?: (controls: CanvasStageControls) => void
  presentationActive?: boolean
  activeSlideItemIds?: string[] | null
  children?: ReactNode
}) {
  const { view, setView, ref, zoomAt, fitItems, fitTo, isAnimating, stopAnimation } = useViewport()
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null)
  const items = [...canvas.items].sort((a, b) => a.z - b.z)
  const bounds = boundsOf(canvas.items)

  useEffect(() => {
    fitItems(canvas.items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (onInitControls) {
      onInitControls({
        fitTo,
        fitItems,
        zoomAt,
        resetView: () => fitItems(canvas.items, true),
      })
    }
  }, [onInitControls, fitTo, fitItems, zoomAt, canvas.items])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return

    // Never capture or start dragging when clicking buttons, inputs, links, or overlay controls
    const targetEl = e.target as HTMLElement | null
    if (
      targetEl &&
      (targetEl.closest("button, a, input, textarea, select, [role='button'], [data-control]") ||
        targetEl.closest("[data-prevent-canvas-drag]"))
    ) {
      return
    }

    stopAnimation()
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      // Ignore if element is not capturable
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y
    if (!drag.current.moved && Math.hypot(dx, dy) < 4) return
    drag.current.moved = true
    setDragging(true)
    setView({ ...view, x: drag.current.vx + dx, y: drag.current.vy + dy })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    if (el && el.hasPointerCapture(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {}
    }

    const moved = drag.current?.moved
    const wasDragging = drag.current !== null
    drag.current = null
    setDragging(false)

    if (!wasDragging) return

    // Check if the click target was a UI control or button
    const targetEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    if (
      targetEl &&
      (targetEl.closest("button, a, input, textarea, select, [role='button'], [data-control]") ||
        targetEl.closest("[data-prevent-canvas-drag]"))
    ) {
      return
    }

    if (!moved && onPickItem) {
      // Find what canvas item was clicked under the cursor
      const target = targetEl?.closest<HTMLElement>("[data-item]")
      onPickItem(target ? canvas.items.find((i) => i.id === target.dataset.item) ?? null : null)
    }
  }

  const onPointerCancel = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    if (el && el.hasPointerCapture(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {}
    }
    drag.current = null
    setDragging(false)
  }

  return (
    <div
      ref={ref}
      className={`relative h-full w-full touch-none overflow-hidden bg-background ${
        dragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={backgroundStyle(canvas.background, view)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transition: isAnimating ? "transform 550ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        }}
      >
        <ConnectorLayer canvas={canvas} />
        {items.map((item) => {
          const pin = pins.find((p) => p.itemId === item.id)
          const isFocused =
            !presentationActive ||
            !activeSlideItemIds ||
            activeSlideItemIds.length === 0 ||
            activeSlideItemIds.includes(item.id)

          return (
            <div
              key={item.id}
              data-item={item.id}
              className={`absolute transition-opacity duration-300 ${
                onPickItem ? "cursor-pointer" : ""
              } ${selectedItem === item.id ? "ring-2 ring-foreground ring-offset-2" : ""}`}
              style={{
                left: item.x,
                top: item.y,
                width: item.w,
                height: item.h,
                zIndex: item.z + 1000,
                transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
                opacity: isFocused ? 1 : 0.22,
              }}
            >
              <ItemView item={item} interactive={!dragging} embedLive={selectedItem === item.id} />
              {pin && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-semibold text-background shadow">
                  {pin.count}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <ZoomControls scale={view.scale} onZoom={(f) => zoomAt(f)} onFit={() => fitItems(canvas.items, true)} />
      <MiniMap canvas={canvas} view={view} viewport={ref.current} bounds={bounds} onJump={(x, y) => setView({ ...view, x, y })} />
      {children}
    </div>
  )
}

export function backgroundStyle(background: Canvas["background"], view: View): React.CSSProperties {
  const size = 32 * view.scale
  const pos = `${view.x}px ${view.y}px`
  if (background === "plain") return {}
  if (background === "grid") return { backgroundImage: "linear-gradient(to right, rgba(27,26,22,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,26,22,0.06) 1px, transparent 1px)", backgroundSize: `${size}px ${size}px`, backgroundPosition: pos }
  return { backgroundImage: "radial-gradient(rgba(27,26,22,0.14) 1px, transparent 1px)", backgroundSize: `${size}px ${size}px`, backgroundPosition: pos }
}

// Arrows between items, drawn from the nearest edges.
export function ConnectorLayer({ canvas, selected, onSelect }: { canvas: Canvas; selected?: string | null; onSelect?: (id: string) => void }) {
  if (!canvas.connectors.length) return null
  const byId = new Map(canvas.items.map((i) => [i.id, i]))
  const b = boundsOf(canvas.items)
  const pad = 400
  return (
    <svg className="pointer-events-none absolute overflow-visible" style={{ left: b.x - pad, top: b.y - pad, width: b.w + pad * 2, height: b.h + pad * 2, zIndex: 999 }} viewBox={`${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}`}>
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1B1A16" /></marker></defs>
      {canvas.connectors.map((c) => {
        const a = byId.get(c.from), d = byId.get(c.to)
        if (!a || !d) return null
        const [p, q] = edgePoints(a, d)
        const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2
        const active = selected === c.id
        return (
          <g key={c.id} className={onSelect ? "pointer-events-auto cursor-pointer" : ""} onPointerDown={(e) => { if (onSelect) { e.stopPropagation(); onSelect(c.id) } }}>
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="transparent" strokeWidth={14} />
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#1B1A16" strokeWidth={active ? 2.5 : 1.5} markerEnd="url(#arrow)" />
            {c.label && <text x={mx} y={my - 6} textAnchor="middle" fontSize={12} fill="#45443D" style={{ paintOrder: "stroke", stroke: "#F5F5F3", strokeWidth: 4 }}>{c.label}</text>}
          </g>
        )
      })}
    </svg>
  )
}

function edgePoints(a: CanvasItem, b: CanvasItem) {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
  const clip = (c: { x: number; y: number }, r: CanvasItem, towards: { x: number; y: number }) => {
    const dx = towards.x - c.x, dy = towards.y - c.y
    if (!dx && !dy) return c
    const sx = dx ? (r.w / 2) / Math.abs(dx) : Infinity, sy = dy ? (r.h / 2) / Math.abs(dy) : Infinity
    const t = Math.min(sx, sy)
    return { x: c.x + dx * t, y: c.y + dy * t }
  }
  return [clip(ac, a, bc), clip(bc, b, ac)]
}

export function ZoomControls({ scale, onZoom, onFit }: { scale: number; onZoom: (factor: number) => void; onFit: () => void }) {
  return (
    <div
      data-control="true"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-4 left-4 z-[1020] flex items-center gap-1 rounded-full border border-border bg-background/90 p-1 text-sm shadow-sm backdrop-blur"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onZoom(1 / 1.25)
        }}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-secondary active:scale-95"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onFit()
        }}
        className="min-w-14 cursor-pointer rounded-full px-2 text-xs tabular-nums transition hover:bg-secondary active:scale-95"
        title="Fit to content"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onZoom(1.25)
        }}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition hover:bg-secondary active:scale-95"
        aria-label="Zoom in"
      >
        +
      </button>
    </div>
  )
}

export function MiniMap({ canvas, view, viewport, bounds, onJump }: { canvas: Canvas; view: View; viewport: HTMLDivElement | null; bounds: { x: number; y: number; w: number; h: number }; onJump: (x: number, y: number) => void }) {
  if (!canvas.items.length || !viewport) return null
  const W = 160, H = 110, pad = 200
  const world = { x: bounds.x - pad, y: bounds.y - pad, w: bounds.w + pad * 2, h: bounds.h + pad * 2 }
  const k = Math.min(W / world.w, H / world.h)
  const ox = (W - world.w * k) / 2, oy = (H - world.h * k) / 2
  const vw = viewport.clientWidth / view.scale, vh = viewport.clientHeight / view.scale
  const vx = -view.x / view.scale, vy = -view.y / view.scale
  const jump = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - r.left - ox) / k + world.x, cy = (e.clientY - r.top - oy) / k + world.y
    onJump(-(cx - vw / 2) * view.scale, -(cy - vh / 2) * view.scale)
  }
  return (
    <svg
      data-control="true"
      width={W}
      height={H}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={jump}
      className="absolute bottom-4 right-4 z-[1020] cursor-crosshair rounded-lg border border-border bg-background/90 shadow-sm backdrop-blur"
    >
      {canvas.items.map((i) => <rect key={i.id} x={ox + (i.x - world.x) * k} y={oy + (i.y - world.y) * k} width={Math.max(1, i.w * k)} height={Math.max(1, i.h * k)} fill={i.type === "frame" ? "rgba(27,26,22,0.08)" : "rgba(27,26,22,0.45)"} />)}
      <rect x={ox + (vx - world.x) * k} y={oy + (vy - world.y) * k} width={vw * k} height={vh * k} fill="none" stroke="#1B1A16" strokeWidth={1} />
    </svg>
  )
}
