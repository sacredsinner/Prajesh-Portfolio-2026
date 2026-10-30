"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Sparkles,
  Palette,
  Trash2,
  Move,
  Layers,
  ZoomIn,
  Copy,
  Check,
  Type,
  FileText,
} from "lucide-react"
import type {
  DesignerCanvasItem,
  LayoutMode,
  CanvasBackground,
  VisualSettings,
} from "./types"
import { toast } from "sonner"

interface DesignerCanvasProps {
  items: DesignerCanvasItem[]
  selectedItemId: string | null
  onSelectItem: (id: string | null) => void
  onUpdateItemPosition: (id: string, x: number, y: number) => void
  onUpdateItemSize: (id: string, w: number, h: number) => void
  onDeleteItem: (id: string) => void
  onRemixItem: (item: DesignerCanvasItem) => void
  onExtractPalette: (item: DesignerCanvasItem) => void
  layoutMode: LayoutMode
  canvasBackground: CanvasBackground
  visualSettings: VisualSettings
  zoom: number
  onZoomChange: (newZoom: number) => void
  canvasRef?: React.RefObject<HTMLDivElement | null>
}

export function DesignerCanvas({
  items,
  selectedItemId,
  onSelectItem,
  onUpdateItemPosition,
  onUpdateItemSize,
  onDeleteItem,
  onRemixItem,
  onExtractPalette,
  layoutMode,
  canvasBackground,
  visualSettings,
  zoom,
  onZoomChange,
  canvasRef,
}: DesignerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 })

  // Dragging item
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Resizing item
  const [resizingItemId, setResizingItemId] = useState<string | null>(null)
  const resizeStart = useRef({ x: 0, y: 0, initialW: 0, initialH: 0 })

  const selectedItem = items.find((i) => i.id === selectedItemId) || null

  // Canvas background style
  const getCanvasBgStyle = (): React.CSSProperties => {
    const dotSize = 32 * zoom
    const posX = `${pan.x}px ${pan.y}px`

    switch (canvasBackground) {
      case "obsidian-dots":
        return {
          backgroundColor: "#11110F",
          backgroundImage: "radial-gradient(rgba(212,175,55,0.22) 1.2px, transparent 1.2px)",
          backgroundSize: `${dotSize}px ${dotSize}px`,
          backgroundPosition: posX,
        }
      case "charcoal-grid":
        return {
          backgroundColor: "#161615",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: `${dotSize}px ${dotSize}px`,
          backgroundPosition: posX,
        }
      case "studio-paper":
        return {
          backgroundColor: "#F5F5F3",
          backgroundImage: "radial-gradient(rgba(27,26,22,0.12) 1px, transparent 1px)",
          backgroundSize: `${dotSize}px ${dotSize}px`,
          backgroundPosition: posX,
        }
      case "plain-dark":
      default:
        return {
          backgroundColor: "#0A0A0A",
        }
    }
  }

  // Handle Wheel / Pinch zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.05 : -0.05
      const newZoom = Math.min(2.5, Math.max(0.25, zoom + delta))
      onZoomChange(newZoom)
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
    }
  }

  // Pan start (mouse down on empty background)
  const handlePointerDownBackground = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest("[data-canvas-item]") || target.closest("[data-control]")) return

    setIsPanning(true)
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: pan.x,
      initialY: pan.y,
    }
    onSelectItem(null)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Pan canvas
    if (isPanning) {
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setPan({
        x: panStart.current.initialX + dx,
        y: panStart.current.initialY + dy,
      })
      return
    }

    // 2. Drag item (freeform mode only)
    if (draggingItemId && layoutMode === "freeform") {
      const item = items.find((i) => i.id === draggingItemId)
      if (!item) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom

      const newX = Math.round(mouseCanvasX - dragOffset.current.x)
      const newY = Math.round(mouseCanvasY - dragOffset.current.y)

      onUpdateItemPosition(draggingItemId, newX, newY)
      return
    }

    // 3. Resize item
    if (resizingItemId) {
      const dx = (e.clientX - resizeStart.current.x) / zoom
      const dy = (e.clientY - resizeStart.current.y) / zoom
      const newW = Math.max(120, Math.round(resizeStart.current.initialW + dx))
      const newH = Math.max(80, Math.round(resizeStart.current.initialH + dy))
      onUpdateItemSize(resizingItemId, newW, newH)
    }
  }

  const handlePointerUp = () => {
    setIsPanning(false)
    setDraggingItemId(null)
    setResizingItemId(null)
  }

  // Copy color chip HEX
  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(hex)
    toast.success(`Copied ${hex} to clipboard!`)
  }

  // Sorted items: frames on bottom (lowest Z), rest in order
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === "frame" && b.type !== "frame") return -1
    if (b.type === "frame" && a.type !== "frame") return 1
    return a.z - b.z
  })

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDownBackground}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={getCanvasBgStyle()}
      className={`relative h-[calc(100vh-3.5rem)] w-full overflow-hidden select-none touch-none ${
        isPanning ? "cursor-grabbing" : "cursor-default"
      }`}
    >
      {/* Visual Film Grain Overlay if enabled */}
      {visualSettings.filmGrain && (
        <div className="pointer-events-none absolute inset-0 z-40 opacity-[0.03] mix-blend-screen bg-repeat bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:3px_3px]" />
      )}

      {/* Canvas Workspace World Plane */}
      <div
        ref={canvasRef as any}
        className="absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isPanning || draggingItemId || resizingItemId ? "none" : "transform 0.15s ease-out",
        }}
      >
        {/* Empty State */}
        {items.length === 0 && (
          <div className="absolute left-[300px] top-[240px] flex w-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#383834] bg-[#141413]/80 p-10 text-center backdrop-blur-md">
            <Sparkles className="h-10 w-10 text-amber-400" />
            <h3 className="mt-4 font-serif text-xl font-medium text-white">Your Canvas is Ready</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#8E8E88]">
              Enter a creative brief in the left panel to generate visual directions, or upload client
              reference images to begin weaving your moodboard.
            </p>
          </div>
        )}

        {/* Canvas Items */}
        {sortedItems.map((item) => {
          const isSelected = selectedItemId === item.id

          return (
            <div
              key={item.id}
              data-canvas-item="true"
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                width: item.w,
                height: item.h,
                zIndex: isSelected ? 100 : item.z,
                transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
                onSelectItem(item.id)

                if (layoutMode === "freeform" && e.button === 0) {
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (!rect) return
                  const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom
                  const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom

                  dragOffset.current = {
                    x: mouseCanvasX - item.x,
                    y: mouseCanvasY - item.y,
                  }
                  setDraggingItemId(item.id)
                }
              }}
              className={`group transition-shadow ${
                isSelected
                  ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black/60 shadow-2xl"
                  : "hover:ring-1 hover:ring-white/40"
              }`}
            >
              {/* Selected Micro-HUD */}
              {isSelected && (
                <div
                  data-control="true"
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute -top-11 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#3E3E38] bg-[#161615]/95 px-2 py-1 shadow-2xl backdrop-blur-md animate-in fade-in"
                >
                  {item.type === "image" && (
                    <button
                      type="button"
                      onClick={() => onRemixItem(item)}
                      className="flex cursor-pointer items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold text-black hover:brightness-110 active:scale-95"
                      title="AI Remix / Variation"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Remix</span>
                    </button>
                  )}

                  {item.type === "image" && (
                    <button
                      type="button"
                      onClick={() => onExtractPalette(item)}
                      className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-[#D4D4CE] hover:bg-[#282824] hover:text-white"
                      title="Extract Palette"
                    >
                      <Palette className="h-3 w-3 text-amber-400" />
                      <span>Palette</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#8E8E88] hover:bg-red-500/20 hover:text-red-400"
                    title="Delete item"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Resize Handle (bottom-right) */}
              {isSelected && (
                <div
                  data-control="true"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    setResizingItemId(item.id)
                    resizeStart.current = {
                      x: e.clientX,
                      y: e.clientY,
                      initialW: item.w,
                      initialH: item.h,
                    }
                  }}
                  className="absolute -bottom-1.5 -right-1.5 z-50 h-3.5 w-3.5 cursor-se-resize rounded-full border-2 border-black bg-amber-400 shadow"
                />
              )}

              {/* Render Type-specific item */}
              {item.type === "image" && (
                <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#1A1A18] shadow-lg">
                  <img
                    src={item.url}
                    alt={item.caption || "Moodboard concept"}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-6">
                      <p className="text-xs font-medium text-white line-clamp-2 leading-tight">
                        {item.caption}
                      </p>
                    </div>
                  )}
                  {item.palette && item.palette.length > 0 && (
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                      {item.palette.map((hex, i) => (
                        <div
                          key={`${hex}-${i}`}
                          className="h-2.5 w-2.5 rounded-full border border-black/40"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {item.type === "color" && (
                <div
                  className="flex h-full w-full cursor-pointer flex-col justify-end rounded-xl border border-white/10 p-4 shadow-md transition hover:brightness-105"
                  style={{ backgroundColor: item.hex }}
                  onClick={(e) => handleCopyHex(item.hex, e)}
                  title={`Click to copy ${item.hex}`}
                >
                  <p className="text-xs font-bold drop-shadow-md text-white">
                    {item.name || item.hex.toUpperCase()}
                  </p>
                  <p className="font-mono text-[10px] text-white/80 drop-shadow-sm">
                    {item.hex.toUpperCase()}
                  </p>
                </div>
              )}

              {item.type === "palette" && (
                <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#161615] shadow-lg">
                  <div className="flex flex-1 min-h-0">
                    {item.colors.map((hex, i) => (
                      <div
                        key={`${hex}-${i}`}
                        className="flex-1 cursor-pointer transition hover:opacity-85"
                        style={{ backgroundColor: hex }}
                        onClick={(e) => handleCopyHex(hex, e)}
                        title={`Click to copy ${hex}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between bg-[#1A1A18] px-3 py-2 text-xs">
                    <span className="font-medium text-white">{item.name || "Curated Palette"}</span>
                    <span className="font-mono text-[10px] text-[#8E8E88]">
                      {item.colors.length} tokens
                    </span>
                  </div>
                </div>
              )}

              {item.type === "typography" && (
                <div className="flex h-full w-full flex-col justify-between rounded-xl border border-white/10 bg-[#1A1A18] p-5 shadow-lg">
                  <div>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-amber-400">
                      {item.category || "Typeface"}
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-medium tracking-tight text-white">
                      {item.heading}
                    </h3>
                  </div>
                  <div>
                    <p className="font-serif text-sm italic leading-relaxed text-[#D4D4CE]">
                      &ldquo;{item.sample}&rdquo;
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-[#7E7E78]">
                      {item.family}
                    </p>
                  </div>
                </div>
              )}

              {item.type === "note" && (
                <div
                  className={`h-full w-full rounded-xl p-4 shadow-md leading-relaxed text-xs font-serif ${
                    item.tone === "gold"
                      ? "border border-amber-500/30 bg-[#282216] text-[#EADFCB]"
                      : item.tone === "sand"
                      ? "border border-[#8C7D6B]/30 bg-[#2C2824] text-[#EAE5DE]"
                      : item.tone === "sage"
                      ? "border border-[#5E6B5C]/30 bg-[#1F2620] text-[#DCE5DC]"
                      : "border border-white/10 bg-[#1E1E1C] text-[#E0E0DC]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.text}</p>
                </div>
              )}

              {item.type === "frame" && (
                <div className="pointer-events-none relative h-full w-full rounded-2xl border-2 border-dashed border-[#383834] bg-white/[0.01]">
                  <div className="absolute -top-3.5 left-4 rounded-md border border-[#3E3E38] bg-[#161615] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    {item.title}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
