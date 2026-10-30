"use client"

import { useState } from "react"
import {
  Sparkles,
  Image as ImageIcon,
  Layers,
  Upload,
  Palette,
  ArrowRight,
  Plus,
  Loader2,
  Check,
  FolderOpen,
  Wand2,
  Trash2,
} from "lucide-react"
import type {
  StylePreset,
  MoodAtmosphere,
  AspectRatio,
  VisualDirection,
  ReferenceItem,
  DesignerProject,
} from "./types"
import { generateMoodboardDirectionsAction, generateConceptVisualAction } from "@/app/actions/moodboard-designer"
import { toast } from "sonner"

const STYLE_PRESETS: { id: StylePreset; label: string; desc: string }[] = [
  { id: "Luxury", label: "Luxury", desc: "Gold, warm wood, polished textures & serif elegance" },
  { id: "Minimal", label: "Minimal", desc: "Monochrome, negative space & Swiss typography" },
  { id: "Editorial", label: "Editorial", desc: "High fashion, magazine layouts & bold crops" },
  { id: "Organic", label: "Organic", desc: "Raw earth, wood grains, linen & tactile serenity" },
  { id: "Futuristic", label: "Futuristic", desc: "Obsidian titanium, neon luminescence & tech" },
  { id: "Brutalist", label: "Brutalist", desc: "Raw concrete, hyper-contrast & industrial forms" },
  { id: "Contemporary", label: "Contemporary", desc: "Balanced modernism, warm neutrals & clean lines" },
]

interface DesignerLeftSidebarProps {
  project: DesignerProject
  onUpdateBrief: (brief: string) => void
  onUpdateStylePreset: (preset: StylePreset) => void
  onSelectDirection: (direction: VisualDirection) => void
  onAddConceptImage: (item: any) => void
  onAddReference: (ref: ReferenceItem) => void
  onRemoveReference: (refId: string) => void
  onSwitchProject: (proj: DesignerProject) => void
  allProjects: DesignerProject[]
  onCreateNewProject: () => void
  isOpen: boolean
  onClose: () => void
}

export function DesignerLeftSidebar({
  project,
  onUpdateBrief,
  onUpdateStylePreset,
  onSelectDirection,
  onAddConceptImage,
  onAddReference,
  onRemoveReference,
  onSwitchProject,
  allProjects,
  onCreateNewProject,
  isOpen,
  onClose,
}: DesignerLeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "references" | "projects">("ai")
  const [briefInput, setBriefInput] = useState(project.brief)
  const [isGeneratingDirections, setIsGeneratingDirections] = useState(false)
  const [conceptPrompt, setConceptPrompt] = useState("")
  const [conceptAspect, setConceptAspect] = useState<AspectRatio>("16:9")
  const [isGeneratingConcept, setIsGeneratingConcept] = useState(false)

  // Handle generating visual directions
  const handleGenerateDirections = async () => {
    if (!briefInput.trim()) {
      toast.error("Please enter a creative brief or concept prompt.")
      return
    }
    setIsGeneratingDirections(true)
    try {
      const res = await generateMoodboardDirectionsAction({
        brief: briefInput,
        stylePreset: project.stylePreset,
        mood: project.visualSettings.mood,
      })
      if (res.ok) {
        project.directions = res.directions
        onUpdateBrief(briefInput)
        toast.success(`Generated ${res.directions.length} visual directions!`)
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Failed to generate directions. Please try again.")
    } finally {
      setIsGeneratingDirections(false)
    }
  }

  // Handle generating a single concept image
  const handleGenerateConcept = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const clean = conceptPrompt.trim()
    if (!clean || isGeneratingConcept) return

    setIsGeneratingConcept(true)
    try {
      const res = await generateConceptVisualAction({
        prompt: clean,
        stylePreset: project.stylePreset,
        photoStyle: project.visualSettings.photoStyle,
        aspectRatio: conceptAspect,
        at: { x: 300, y: 300 },
      })
      if (res.ok) {
        onAddConceptImage(res.item)
        setConceptPrompt("")
        toast.success("Concept image added to canvas!")
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Failed to generate image. Please try again.")
    } finally {
      setIsGeneratingConcept(false)
    }
  }

  // File drop/upload for references
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      if (url) {
        const newRef: ReferenceItem = {
          id: `ref-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          url,
          extractedPalette: ["#1C1B1A", "#5C2817", "#D4AF37", "#EAE5DB"],
          aspectRatio: "16:9",
        }
        onAddReference(newRef)
        toast.success("Reference image uploaded!")
      }
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  return (
    <aside className="relative flex h-[calc(100vh-3.5rem)] w-80 min-w-80 flex-col border-r border-[#262624] bg-[#141413] text-[#E6E6E3] md:w-96 md:min-w-96">
      {/* Top Nav Tabs */}
      <div className="flex border-b border-[#262624] bg-[#111110] px-3 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-xs font-medium transition ${
            activeTab === "ai"
              ? "border-amber-500 text-white"
              : "border-transparent text-[#8E8E88] hover:text-[#CCC]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>AI Generator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("references")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-xs font-medium transition ${
            activeTab === "references"
              ? "border-amber-500 text-white"
              : "border-transparent text-[#8E8E88] hover:text-[#CCC]"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>References ({project.references.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-xs font-medium transition ${
            activeTab === "projects"
              ? "border-amber-500 text-white"
              : "border-transparent text-[#8E8E88] hover:text-[#CCC]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Projects</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "ai" && (
          <>
            {/* Step 1: Creative Brief */}
            <div>
              <div className="flex items-center justify-between pb-1.5">
                <label className="text-xs font-medium text-[#A6A6A0]">1. Creative Brief & Prompt</label>
                <span className="text-[10px] text-[#6E6E68]">Adobe Firefly Engine</span>
              </div>
              <textarea
                rows={3}
                value={briefInput}
                onChange={(e) => setBriefInput(e.target.value)}
                placeholder="Describe your design direction, brand vibe, tonewoods, architecture, materials, mood..."
                className="w-full rounded-xl border border-[#2E2E2A] bg-[#1A1A18] p-3 text-xs leading-relaxed text-[#FAFAFA] placeholder:text-[#5E5E58] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            {/* Step 2: Style Presets */}
            <div>
              <label className="mb-2 block text-xs font-medium text-[#A6A6A0]">2. Aesthetic Style Preset</label>
              <div className="grid grid-cols-2 gap-1.5">
                {STYLE_PRESETS.map((p) => {
                  const isSelected = project.stylePreset === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onUpdateStylePreset(p.id)}
                      className={`flex flex-col rounded-lg border p-2 text-left transition ${
                        isSelected
                          ? "border-amber-500/60 bg-[#252219] text-white shadow-sm"
                          : "border-[#262624] bg-[#181816] text-[#A6A6A0] hover:border-[#383834] hover:bg-[#1E1E1C]"
                      }`}
                    >
                      <span className="text-xs font-semibold">{p.label}</span>
                      <span className="mt-0.5 truncate text-[10px] text-[#7A7A74]">{p.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Generate Directions Trigger Button */}
            <button
              type="button"
              disabled={isGeneratingDirections}
              onClick={handleGenerateDirections}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-semibold text-[#111110] shadow-lg transition hover:brightness-110 active:scale-98 disabled:opacity-50"
            >
              {isGeneratingDirections ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Synthesizing Creative Directions…</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Generate Visual Directions</span>
                </>
              )}
            </button>

            {/* Generated Visual Directions List */}
            {project.directions.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[#262624]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
                    Curated Directions ({project.directions.length})
                  </h4>
                  <span className="text-[10px] text-amber-400">Select to explore</span>
                </div>

                {project.directions.map((dir) => {
                  const isSelected = project.selectedDirectionId === dir.id
                  return (
                    <div
                      key={dir.id}
                      onClick={() => onSelectDirection(dir)}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        isSelected
                          ? "border-amber-500/80 bg-[#1F1D17] ring-1 ring-amber-500/30"
                          : "border-[#262624] bg-[#181816] hover:border-[#3E3E38] hover:bg-[#1C1C1A]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-white">{dir.title}</h5>
                        {isSelected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-[#111110]">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-[#9A9A94]">{dir.description}</p>

                      {/* Color Palette Chips */}
                      <div className="mt-2.5 flex items-center gap-1">
                        {dir.palette.map((hex, i) => (
                          <div
                            key={`${hex}-${i}`}
                            className="h-3.5 w-6 rounded-sm border border-black/30"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>

                      {/* Keyword tags */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {dir.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="rounded bg-[#262624] px-1.5 py-0.5 text-[9px] text-[#A6A6A0]"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quick Text-to-Image Generation Studio */}
            <div className="space-y-3 pt-3 border-t border-[#262624]">
              <label className="text-xs font-medium text-[#A6A6A0]">
                Generate Visual Concept Image
              </label>

              <form onSubmit={handleGenerateConcept} className="space-y-2">
                <input
                  type="text"
                  value={conceptPrompt}
                  onChange={(e) => setConceptPrompt(e.target.value)}
                  placeholder="e.g. Carved archtop spruce guitar body macro in warm light..."
                  className="w-full rounded-lg border border-[#2E2E2A] bg-[#1A1A18] px-3 py-2 text-xs text-white placeholder:text-[#5E5E58] focus:border-amber-500/50 focus:outline-none"
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {(["16:9", "1:1", "4:5", "3:2"] as AspectRatio[]).map((aspect) => (
                      <button
                        key={aspect}
                        type="button"
                        onClick={() => setConceptAspect(aspect)}
                        className={`rounded px-1.5 py-1 text-[10px] font-mono transition ${
                          conceptAspect === aspect
                            ? "bg-amber-500 text-black font-semibold"
                            : "bg-[#222220] text-[#8E8E88] hover:text-white"
                        }`}
                      >
                        {aspect}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingConcept || !conceptPrompt.trim()}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#282824] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#343430] disabled:opacity-40"
                  >
                    {isGeneratingConcept ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-amber-400" />
                    )}
                    <span>Weave</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* References Tab */}
        {activeTab === "references" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
                Upload Visual References
              </h4>
              <p className="mt-1 text-[11px] text-[#7E7E78]">
                Drag and drop your client brand assets, mood photos, or Pinterest inspiration.
              </p>
            </div>

            {/* Drop Zone */}
            <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#3E3E38] bg-[#181816] p-6 text-center cursor-pointer transition hover:border-amber-500/50 hover:bg-[#1E1E1C]">
              <Upload className="h-6 w-6 text-[#8E8E88]" />
              <span className="mt-2 text-xs font-medium text-white">Click or drop image to upload</span>
              <span className="mt-1 text-[10px] text-[#6E6E68]">PNG, JPG, WEBP up to 10MB</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* References List */}
            <div className="space-y-3">
              {project.references.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#7E7E78]">
                  No references uploaded yet. Upload images above or add them from AI generation.
                </p>
              ) : (
                project.references.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center gap-3 rounded-xl border border-[#262624] bg-[#181816] p-2.5 transition hover:border-[#383834]"
                  >
                    <img
                      src={ref.url}
                      alt={ref.name}
                      className="h-14 w-14 rounded-lg object-cover border border-black/40"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-white">{ref.name}</p>
                      {ref.extractedPalette && (
                        <div className="mt-1.5 flex gap-1">
                          {ref.extractedPalette.map((hex, i) => (
                            <span
                              key={`${hex}-${i}`}
                              className="h-2.5 w-4 rounded-sm border border-black/20"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onAddConceptImage({
                            id: `ref-canvas-${Date.now()}`,
                            type: "image",
                            url: ref.url,
                            caption: ref.name,
                            aspectRatio: ref.aspectRatio || "16:9",
                            x: 200,
                            y: 200,
                            w: 360,
                            h: 240,
                            z: 10,
                            palette: ref.extractedPalette,
                          })
                        }
                        className="flex h-7 cursor-pointer items-center gap-1 rounded bg-[#282824] px-2 text-[10px] font-medium text-white hover:bg-[#363630]"
                        title="Add to Canvas"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveReference(ref.id)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#8E8E88] hover:bg-red-500/20 hover:text-red-400"
                        title="Delete reference"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
                Workspace Projects
              </h4>
              <button
                type="button"
                onClick={onCreateNewProject}
                className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20"
              >
                <Plus className="h-3 w-3" />
                <span>New Project</span>
              </button>
            </div>

            <div className="space-y-2">
              {allProjects.map((p) => {
                const isCurrent = p.id === project.id
                return (
                  <div
                    key={p.id}
                    onClick={() => onSwitchProject(p)}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      isCurrent
                        ? "border-amber-500/80 bg-[#1F1D17]"
                        : "border-[#262624] bg-[#181816] hover:border-[#383834] hover:bg-[#1C1C1A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">{p.name}</p>
                      {isCurrent && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-[#8E8E88]">{p.brief}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#6E6E68]">
                      <span>{p.items.length} canvas items</span>
                      <span className="capitalize">{p.stylePreset}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
