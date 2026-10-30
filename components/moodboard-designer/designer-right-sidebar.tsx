"use client"

import { useState } from "react"
import {
  Sliders,
  Paintbrush,
  Maximize2,
  Trash2,
  Sparkles,
  Palette,
  RotateCw,
  Crop,
  Layers,
  LayoutGrid,
  SunMedium,
  Film,
  Type,
  AlignLeft,
} from "lucide-react"
import type {
  DesignerCanvasItem,
  VisualSettings,
  LayoutMode,
  CanvasBackground,
  MoodAtmosphere,
  PhotographyStyle,
  AspectRatio,
} from "./types"
import { toast } from "sonner"

interface DesignerRightSidebarProps {
  selectedItem: DesignerCanvasItem | null
  onUpdateSelectedItem: (updates: Partial<DesignerCanvasItem>) => void
  onDeleteItem: (itemId: string) => void
  onRegenerateItem: (item: DesignerCanvasItem) => void
  onExtractPaletteFromItem: (item: DesignerCanvasItem) => void
  visualSettings: VisualSettings
  onUpdateVisualSettings: (settings: Partial<VisualSettings>) => void
  layoutMode: LayoutMode
  onChangeLayoutMode: (mode: LayoutMode) => void
  canvasBackground: CanvasBackground
  onChangeBackground: (bg: CanvasBackground) => void
  onSmartArrange: () => void
  isOpen: boolean
  onClose: () => void
}

const MOODS: MoodAtmosphere[] = [
  "Warm & Artisanal",
  "Obsidian Noir",
  "High-Key Studio",
  "Ethereal & Muted",
  "Vibrant & Bold",
]

const PHOTO_STYLES: PhotographyStyle[] = [
  "Macro Studio",
  "Environmental Editorial",
  "Cinematic 35mm",
  "Architectural Minimal",
  "Dramatic Chiaroscuro",
]

export function DesignerRightSidebar({
  selectedItem,
  onUpdateSelectedItem,
  onDeleteItem,
  onRegenerateItem,
  onExtractPaletteFromItem,
  visualSettings,
  onUpdateVisualSettings,
  layoutMode,
  onChangeLayoutMode,
  canvasBackground,
  onChangeBackground,
  onSmartArrange,
  isOpen,
  onClose,
}: DesignerRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<"inspector" | "controls" | "canvas">("inspector")

  if (!isOpen) return null

  return (
    <aside className="relative flex h-[calc(100vh-3.5rem)] w-72 min-w-72 flex-col border-l border-[#262624] bg-[#141413] text-[#E6E6E3] md:w-80 md:min-w-80">
      {/* Top Tabs */}
      <div className="flex border-b border-[#262624] bg-[#111110] px-2 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("inspector")}
          className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-medium transition ${
            activeTab === "inspector"
              ? "border-amber-500 text-white"
              : "border-transparent text-[#8E8E88] hover:text-[#CCC]"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Inspector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("controls")}
          className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-medium transition ${
            activeTab === "controls"
              ? "border-amber-500 text-white"
              : "border-transparent text-[#8E8E88] hover:text-[#CCC]"
          }`}
        >
          <Paintbrush className="h-3.5 w-3.5" />
          <span>Atmosphere</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("canvas")}
          className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-medium transition ${
            activeTab === "canvas"
              ? "border-amber-500 text-white"
              : "border-transparent text-[#8E8E88] hover:text-[#CCC]"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Layout</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tab 1: Selected Item Inspector */}
        {activeTab === "inspector" && (
          <div className="space-y-4">
            {!selectedItem ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2E2E2A] p-8 text-center">
                <Sliders className="h-8 w-8 text-[#5E5E58]" />
                <p className="mt-3 text-xs font-medium text-[#A6A6A0]">No Item Selected</p>
                <p className="mt-1 text-[11px] text-[#6E6E68]">
                  Click any image, color swatch, note, or frame on canvas to modify its properties.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#262624] pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E88]">
                    {selectedItem.type.toUpperCase()} ELEMENT
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(selectedItem.id)}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-red-400 hover:bg-red-500/20"
                    title="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Dimensions & Coordinates */}
                <div>
                  <label className="text-[11px] font-medium text-[#A6A6A0]">Transform</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 rounded border border-[#2A2A26] bg-[#1A1A18] px-2 py-1">
                      <span className="text-[10px] font-mono text-[#7E7E78]">W:</span>
                      <input
                        type="number"
                        value={selectedItem.w}
                        onChange={(e) =>
                          onUpdateSelectedItem({ w: Math.max(80, parseInt(e.target.value) || 80) })
                        }
                        className="w-full bg-transparent text-right text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 rounded border border-[#2A2A26] bg-[#1A1A18] px-2 py-1">
                      <span className="text-[10px] font-mono text-[#7E7E78]">H:</span>
                      <input
                        type="number"
                        value={selectedItem.h}
                        onChange={(e) =>
                          onUpdateSelectedItem({ h: Math.max(80, parseInt(e.target.value) || 80) })
                        }
                        className="w-full bg-transparent text-right text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 rounded border border-[#2A2A26] bg-[#1A1A18] px-2 py-1">
                      <span className="text-[10px] font-mono text-[#7E7E78]">X:</span>
                      <input
                        type="number"
                        value={Math.round(selectedItem.x)}
                        onChange={(e) => onUpdateSelectedItem({ x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-transparent text-right text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 rounded border border-[#2A2A26] bg-[#1A1A18] px-2 py-1">
                      <span className="text-[10px] font-mono text-[#7E7E78]">Y:</span>
                      <input
                        type="number"
                        value={Math.round(selectedItem.y)}
                        onChange={(e) => onUpdateSelectedItem({ y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-transparent text-right text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Specific controls for IMAGE type */}
                {selectedItem.type === "image" && (
                  <div className="space-y-3 pt-2 border-t border-[#262624]">
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Caption</label>
                      <input
                        type="text"
                        value={selectedItem.caption || ""}
                        onChange={(e) => onUpdateSelectedItem({ caption: e.target.value })}
                        placeholder="Image description..."
                        className="mt-1 w-full rounded border border-[#2A2A26] bg-[#1A1A18] px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Aspect Ratio</label>
                      <div className="mt-1 flex gap-1">
                        {(["16:9", "1:1", "4:5", "3:2"] as AspectRatio[]).map((aspect) => (
                          <button
                            key={aspect}
                            type="button"
                            onClick={() => {
                              let newH = selectedItem.h
                              if (aspect === "1:1") newH = selectedItem.w
                              if (aspect === "16:9") newH = Math.round(selectedItem.w * (9 / 16))
                              if (aspect === "4:5") newH = Math.round(selectedItem.w * (5 / 4))
                              if (aspect === "3:2") newH = Math.round(selectedItem.w * (2 / 3))
                              onUpdateSelectedItem({ aspectRatio: aspect, h: newH })
                            }}
                            className={`flex-1 rounded py-1 text-[10px] font-mono transition ${
                              selectedItem.aspectRatio === aspect
                                ? "bg-amber-500 font-bold text-black"
                                : "bg-[#222220] text-[#8E8E88] hover:text-white"
                            }`}
                          >
                            {aspect}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AI Actions */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => onRegenerateItem(selectedItem)}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#3E3E38] bg-[#1E1E1C] py-2 text-xs font-medium text-white transition hover:border-amber-500/60 hover:bg-[#25231D]"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>Remix / Alternative Concept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onExtractPaletteFromItem(selectedItem)}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#3E3E38] bg-[#1E1E1C] py-2 text-xs font-medium text-white transition hover:border-[#55554D] hover:bg-[#262624]"
                      >
                        <Palette className="h-3.5 w-3.5 text-[#A6A6A0]" />
                        <span>Extract Palette Card</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Specific controls for COLOR / PALETTE */}
                {selectedItem.type === "color" && (
                  <div className="space-y-3 pt-2 border-t border-[#262624]">
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">HEX Token</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedItem.hex}
                          onChange={(e) => onUpdateSelectedItem({ hex: e.target.value })}
                          className="h-8 w-10 cursor-pointer rounded border border-[#2E2E2A] bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          value={selectedItem.hex}
                          onChange={(e) => onUpdateSelectedItem({ hex: e.target.value })}
                          className="w-full rounded border border-[#2A2A26] bg-[#1A1A18] px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Swatch Name</label>
                      <input
                        type="text"
                        value={selectedItem.name || ""}
                        onChange={(e) => onUpdateSelectedItem({ name: e.target.value })}
                        placeholder="e.g. Amber Nitro Lacquer"
                        className="mt-1 w-full rounded border border-[#2A2A26] bg-[#1A1A18] px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Specific controls for TYPOGRAPHY */}
                {selectedItem.type === "typography" && (
                  <div className="space-y-3 pt-2 border-t border-[#262624]">
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Heading Text</label>
                      <input
                        type="text"
                        value={selectedItem.heading}
                        onChange={(e) => onUpdateSelectedItem({ heading: e.target.value })}
                        className="mt-1 w-full rounded border border-[#2A2A26] bg-[#1A1A18] px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Font Family</label>
                      <input
                        type="text"
                        value={selectedItem.family}
                        onChange={(e) => onUpdateSelectedItem({ family: e.target.value })}
                        className="mt-1 w-full rounded border border-[#2A2A26] bg-[#1A1A18] px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Sample Copy</label>
                      <textarea
                        rows={2}
                        value={selectedItem.sample}
                        onChange={(e) => onUpdateSelectedItem({ sample: e.target.value })}
                        className="mt-1 w-full rounded border border-[#2A2A26] bg-[#1A1A18] p-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Specific controls for NOTE */}
                {selectedItem.type === "note" && (
                  <div className="space-y-3 pt-2 border-t border-[#262624]">
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Note Body</label>
                      <textarea
                        rows={3}
                        value={selectedItem.text}
                        onChange={(e) => onUpdateSelectedItem({ text: e.target.value })}
                        className="mt-1 w-full rounded border border-[#2A2A26] bg-[#1A1A18] p-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#A6A6A0]">Accent Tone</label>
                      <div className="mt-1 flex gap-1.5">
                        {(["gold", "sand", "sage", "ink"] as const).map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => onUpdateSelectedItem({ tone })}
                            className={`flex-1 rounded py-1 text-[10px] capitalize transition ${
                              selectedItem.tone === tone
                                ? "bg-amber-500 font-bold text-black"
                                : "bg-[#222220] text-[#A6A6A0] hover:text-white"
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Atmosphere & Creative Controls */}
        {activeTab === "controls" && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
                Atmosphere & Mood
              </label>
              <div className="mt-2 space-y-1">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onUpdateVisualSettings({ mood: m })}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                      visualSettings.mood === m
                        ? "bg-amber-500/20 font-medium text-amber-400"
                        : "text-[#8E8E88] hover:bg-[#1E1E1C] hover:text-white"
                    }`}
                  >
                    <span>{m}</span>
                    {visualSettings.mood === m && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
                Photography Style
              </label>
              <div className="mt-2 space-y-1">
                {PHOTO_STYLES.map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => onUpdateVisualSettings({ photoStyle: ps })}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                      visualSettings.photoStyle === ps
                        ? "bg-amber-500/20 font-medium text-amber-400"
                        : "text-[#8E8E88] hover:bg-[#1E1E1C] hover:text-white"
                    }`}
                  >
                    <span>{ps}</span>
                    {visualSettings.photoStyle === ps && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Sliders */}
            <div className="space-y-3 pt-2 border-t border-[#262624]">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8E8E88]">Warmth</span>
                  <span className="font-mono text-white">{visualSettings.warmth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={visualSettings.warmth}
                  onChange={(e) =>
                    onUpdateVisualSettings({ warmth: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1.5 w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8E8E88]">Contrast</span>
                  <span className="font-mono text-white">{visualSettings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={visualSettings.contrast}
                  onChange={(e) =>
                    onUpdateVisualSettings({ contrast: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1.5 w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8E8E88]">Saturation</span>
                  <span className="font-mono text-white">{visualSettings.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={visualSettings.saturation}
                  onChange={(e) =>
                    onUpdateVisualSettings({ saturation: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1.5 w-full accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#8E8E88]">Film Grain</span>
                <input
                  type="checkbox"
                  checked={visualSettings.filmGrain}
                  onChange={(e) => onUpdateVisualSettings({ filmGrain: e.target.checked })}
                  className="h-4 w-4 rounded accent-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Layout & Canvas Settings */}
        {activeTab === "canvas" && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
                Canvas Layout Mode
              </label>
              <div className="mt-2 grid grid-cols-1 gap-1.5">
                {(
                  [
                    { id: "freeform", label: "Freeform Canvas", desc: "Drag & drop freely at any angle" },
                    { id: "grid", label: "Structured Grid", desc: "Evenly spaced rows and columns" },
                    { id: "masonry", label: "Editorial Masonry", desc: "Pinterest-style cascading flow" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChangeLayoutMode(m.id)}
                    className={`flex flex-col rounded-lg border p-2.5 text-left transition ${
                      layoutMode === m.id
                        ? "border-amber-500/60 bg-[#252219] text-white"
                        : "border-[#262624] bg-[#181816] text-[#8E8E88] hover:border-[#383834] hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-medium">{m.label}</span>
                    <span className="text-[10px] text-[#6E6E68]">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Arrange */}
            <div className="pt-2 border-t border-[#262624]">
              <button
                type="button"
                onClick={onSmartArrange}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#222220] py-2.5 text-xs font-medium text-white transition hover:bg-[#2C2C28] active:scale-98"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-amber-400" />
                <span>Smart Arrange Layout</span>
              </button>
            </div>

            {/* Background Texture */}
            <div className="pt-2 border-t border-[#262624]">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
                Canvas Atmosphere
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "obsidian-dots", label: "Obsidian Noir", bg: "#11110F" },
                    { id: "charcoal-grid", label: "Charcoal Grid", bg: "#161615" },
                    { id: "studio-paper", label: "Studio Paper", bg: "#F5F5F3", darkText: true },
                    { id: "plain-dark", label: "Pure Ink", bg: "#080808" },
                  ] as { id: CanvasBackground; label: string; bg: string; darkText?: boolean }[]
                ).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onChangeBackground(b.id)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2 transition ${
                      canvasBackground === b.id
                        ? "border-amber-500 ring-1 ring-amber-500/30"
                        : "border-[#2A2A26] hover:border-[#40403A]"
                    }`}
                    style={{ backgroundColor: b.bg }}
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        b.darkText ? "text-neutral-900" : "text-white"
                      }`}
                    >
                      {b.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
