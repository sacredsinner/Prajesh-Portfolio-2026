"use client"

import { useState, useRef } from "react"
import { X, Check, ZoomIn, ZoomOut, Move, RotateCcw } from "lucide-react"
import type { ProjectCoverCrop } from "@/lib/project-editor-types"

interface CropModalProps {
  imageUrl: string
  crop?: ProjectCoverCrop | null
  onSave: (crop: ProjectCoverCrop) => void
  onClose: () => void
}

export function CropModal({ imageUrl, crop, onSave, onClose }: CropModalProps) {
  const [zoom, setZoom] = useState(crop?.zoom ?? 1)
  const [focalX, setFocalX] = useState(crop?.x ?? 50)
  const [focalY, setFocalY] = useState(crop?.y ?? 50)
  const [aspectRatio, setAspectRatio] = useState(crop?.aspectRatio ?? "16/9")
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)))
    setFocalX(x)
    setFocalY(y)
  }

  const handleReset = () => {
    setZoom(1)
    setFocalX(50)
    setFocalY(50)
    setAspectRatio("16/9")
  }

  const handleApply = () => {
    onSave({
      zoom,
      x: focalX,
      y: focalY,
      aspectRatio,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="font-serif text-xl font-medium">Cover & Focal Point Tool</h3>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the image to set the focal anchor point for responsive cropping.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Workspace Canvas */}
        <div className="relative flex min-h-[380px] flex-1 items-center justify-center overflow-hidden bg-secondary/60 p-6">
          <div
            ref={containerRef}
            onClick={handlePointerDown}
            className="group relative cursor-crosshair overflow-hidden rounded-xl shadow-lg ring-1 ring-border"
            style={{
              width: "100%",
              maxWidth: "600px",
              aspectRatio: aspectRatio.replace("/", " / "),
            }}
          >
            <img
              src={imageUrl}
              alt="Crop preview"
              className="pointer-events-none h-full w-full object-cover transition-transform"
              style={{
                transform: `scale(${zoom})`,
                objectPosition: `${focalX}% ${focalY}%`,
              }}
            />

            {/* Crosshair target indicator */}
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${focalX}%`, top: `${focalY}%` }}
            >
              <div className="relative flex size-8 items-center justify-center">
                <div className="size-4 rounded-full border-2 border-white bg-black/40 shadow-md ring-2 ring-black/40" />
                <div className="absolute h-8 w-0.5 bg-white/80" />
                <div className="absolute h-0.5 w-8 bg-white/80" />
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-mono text-white backdrop-blur">
              Focal: {focalX}%, {focalY}%
            </div>
          </div>
        </div>

        {/* Controls footer */}
        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2">
              <ZoomOut className="size-4 text-muted-foreground" />
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="h-1.5 w-24 cursor-pointer accent-foreground"
              />
              <ZoomIn className="size-4 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-1 text-xs">
              {(["16/9", "4/3", "1/1", "3/2"] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`rounded px-2 py-1 font-mono transition-colors ${
                    aspectRatio === ratio ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              <Check className="size-4" /> Save Crop & Focal Point
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
