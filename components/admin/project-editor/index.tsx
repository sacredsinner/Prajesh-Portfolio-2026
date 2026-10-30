"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  Send,
  Upload,
  Crop,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Copy,
  Trash2,
  ChevronDown,
} from "lucide-react"
import type { ProjectData, ProjectBlock, ProjectStatus, ProjectCoverCrop } from "@/lib/project-editor-types"
import { saveProject, updateProjectStatus } from "@/app/actions/cms"
import { uploadToBlob } from "@/lib/upload-client"
import { makeSlug } from "@/lib/utils"
import { BlockToolbar } from "./block-toolbar"
import { BlockItemEditor } from "./block-item-editor"
import { EditorSidebar } from "./editor-sidebar"
import { CropModal } from "./crop-modal"
import { PublishModal } from "./publish-modal"
import { LivePreviewModal } from "./live-preview-modal"

interface BehanceProjectEditorProps {
  initialProject?: Partial<ProjectData> | null
}

const DEFAULT_BLOCKS: ProjectBlock[] = [
  {
    id: "intro-text",
    type: "text",
    content: "<p>Tell the story behind this project: the client, the challenge, the point of view, and the creative solution that brought it to life.</p>",
    align: "left",
    fontSize: "lg",
    width: "boxed",
  },
  {
    id: "hero-visual",
    type: "image",
    url: "",
    caption: "Hero identity system and application",
    width: "wide",
  },
  {
    id: "core-idea",
    type: "heading",
    level: 2,
    content: "The Core Idea",
    subtitle: "A strong concept creates flexible identities that scale.",
    align: "left",
    width: "boxed",
  },
]

export function BehanceProjectEditor({ initialProject }: BehanceProjectEditorProps) {
  const router = useRouter()

  // Project state
  const [project, setProject] = useState<ProjectData>(() => ({
    id: initialProject?.id,
    slug: initialProject?.slug || "",
    title: initialProject?.title || "",
    subtitle: initialProject?.subtitle || "",
    status: (initialProject?.status as ProjectStatus) || "draft",
    scheduledAt: initialProject?.scheduledAt || null,
    category: initialProject?.category || "Brand Identity",
    year: initialProject?.year || String(new Date().getFullYear()),
    thumbnail: initialProject?.thumbnail || "",
    coverCrop: initialProject?.coverCrop || null,
    client: initialProject?.client || "",
    role: initialProject?.role || "",
    overview: initialProject?.overview || "",
    problem: initialProject?.problem || "",
    approach: initialProject?.approach || "",
    solution: initialProject?.solution || "",
    outcome: initialProject?.outcome || "",
    images: initialProject?.images || [],
    creativeFields: initialProject?.creativeFields || ["Brand Identity", "Art Direction"],
    tags: initialProject?.tags || ["Identity", "Typography", "Editorial"],
    toolsUsed: initialProject?.toolsUsed || ["Figma", "Adobe Illustrator"],
    team: initialProject?.team || [],
    industries: initialProject?.industries || [],
    license: initialProject?.license || "All Rights Reserved (Standard)",
    copyright: initialProject?.copyright || "",
    blocks: initialProject?.blocks && initialProject.blocks.length > 0 ? initialProject.blocks : DEFAULT_BLOCKS,
    assets: initialProject?.assets || [],
    analytics: initialProject?.analytics || { views: 0, appreciations: 0, saves: 0, comments: 0 },
    featured: initialProject?.featured ?? false,
    seoTitle: initialProject?.seoTitle || "",
    seoDescription: initialProject?.seoDescription || "",
    ogImage: initialProject?.ogImage || "",
  }))

  // History stack for Undo / Redo
  const [history, setHistory] = useState<ProjectData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isUndoRedoRef = useRef(false)

  // Selected block id
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  // Status & Progress
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved")
  const [saveMessage, setSaveMessage] = useState("Draft saved")
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  // Modals
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  const coverFileRef = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Register undo state
  const pushHistory = useCallback((nextProject: ProjectData) => {
    if (isUndoRedoRef.current) return
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), nextProject].slice(-50))
    setHistoryIndex((prev) => Math.min(prev + 1, 49))
  }, [historyIndex])

  // Update project with undo tracking and autosave debounce
  const updateProject = useCallback((nextProject: ProjectData, recordHistory = true) => {
    setProject(nextProject)
    if (recordHistory) {
      pushHistory(nextProject)
    }

    setSaveStatus("unsaved")
    setSaveMessage("Unsaved changes")

    // Debounced autosave (800ms)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving")
      setSaveMessage("Saving…")
      try {
        const slug = nextProject.slug || makeSlug(nextProject.title || "untitled-project")
        const result = await saveProject({
          ...nextProject,
          id: nextProject.id || undefined,
          slug,
          thumbnail: nextProject.thumbnail || "/placeholder.jpg",
        })

        if (result.ok) {
          setSaveStatus("saved")
          setSaveMessage(nextProject.status === "published" ? "Published" : "Draft saved")
          if (!nextProject.id && result.id) {
            setProject((p) => ({ ...p, id: result.id, slug }))
          }
        } else {
          setSaveStatus("error")
          setSaveMessage(result.error)
        }
      } catch (err) {
        setSaveStatus("error")
        setSaveMessage("Could not autosave")
      }
    }, 800)
  }, [pushHistory])

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return
    isUndoRedoRef.current = true
    const prev = history[historyIndex - 1]
    setHistoryIndex(historyIndex - 1)
    setProject(prev)
    setTimeout(() => {
      isUndoRedoRef.current = false
    }, 50)
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    isUndoRedoRef.current = true
    const next = history[historyIndex + 1]
    setHistoryIndex(historyIndex + 1)
    setProject(next)
    setTimeout(() => {
      isUndoRedoRef.current = false
    }, 50)
  }, [history, historyIndex])

  // Keyboard Shortcuts (Cmd+Z, Cmd+Shift+Z, Cmd+S, Cmd+D, Escape, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      } else if (isMeta && e.key.toLowerCase() === "s") {
        e.preventDefault()
        // Force immediate save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        setSaveStatus("saving")
        setSaveMessage("Saving…")
        void saveProject({
          ...project,
          id: project.id || undefined,
          slug: project.slug || makeSlug(project.title || "untitled-project"),
          thumbnail: project.thumbnail || "/placeholder.jpg",
        }).then((res) => {
          if (res.ok) {
            setSaveStatus("saved")
            setSaveMessage(project.status === "published" ? "Published" : "All changes saved")
          }
        })
      } else if (isMeta && e.key.toLowerCase() === "d" && selectedBlockId) {
        e.preventDefault()
        duplicateBlock(selectedBlockId)
      } else if (e.key === "Escape") {
        setSelectedBlockId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleUndo, handleRedo, project, selectedBlockId])

  // Global Clipboard Image Paste Handler
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile()
          if (file) {
            setUploadStatus("Uploading pasted image…")
            try {
              const res = await uploadToBlob(file, "portfolio")
              const newBlock: ProjectBlock = {
                id: `image-${Date.now()}`,
                type: "image",
                url: res.url,
                caption: "Pasted visual",
                width: "boxed",
              }
              updateProject({
                ...project,
                blocks: [...project.blocks, newBlock],
              })
              setUploadStatus(null)
            } catch (err) {
              setUploadStatus("Failed to paste image")
            }
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [project, updateProject])

  // Cover Image Upload
  const handleCoverUpload = async (file: File) => {
    setUploadStatus("Uploading hero cover…")
    try {
      const res = await uploadToBlob(file, "portfolio")
      updateProject({
        ...project,
        thumbnail: res.url,
        assets: [
          {
            id: `asset-${Date.now()}`,
            url: res.url,
            filename: file.name,
            sizeBytes: file.size,
            contentType: file.type,
            createdAt: new Date().toISOString(),
          },
          ...(project.assets || []),
        ],
      })
      setUploadStatus(null)
    } catch (err) {
      setUploadStatus("Cover upload failed")
    }
  }

  // Block Actions
  const addBlock = (type: ProjectBlock["type"]) => {
    const id = `${type}-${Date.now()}`
    let newBlock: ProjectBlock

    switch (type) {
      case "image":
        newBlock = { id, type: "image", url: "", caption: "", width: "boxed" }
        break
      case "image-grid":
        newBlock = { id, type: "image-grid", images: [], columns: 2, width: "boxed" }
        break
      case "carousel":
        newBlock = { id, type: "carousel", slides: [], width: "boxed" }
        break
      case "full-width-image":
        newBlock = { id, type: "full-width-image", url: "", caption: "" }
        break
      case "video":
        newBlock = { id, type: "video", source: "youtube", url: "", width: "boxed" }
        break
      case "text":
        newBlock = { id, type: "text", content: "<p>Write your project story here...</p>", align: "left", width: "boxed" }
        break
      case "heading":
        newBlock = { id, type: "heading", level: 2, content: "Section Heading", width: "boxed" }
        break
      case "quote":
        newBlock = { id, type: "quote", quote: "A compelling quote from the client.", citation: "Client Name", width: "boxed" }
        break
      case "divider":
        newBlock = { id, type: "divider", style: "line", spacing: "md" }
        break
      case "embed":
        newBlock = { id, type: "embed", url: "", width: "boxed" }
        break
      case "before-after":
        newBlock = { id, type: "before-after", beforeUrl: "", afterUrl: "", beforeLabel: "Before", afterLabel: "After", width: "boxed" }
        break
      case "gif":
        newBlock = { id, type: "gif", url: "", caption: "Animated preview", width: "boxed" }
        break
      case "pdf":
        newBlock = { id, type: "pdf", url: "", filename: "Document.pdf", width: "boxed" }
        break
      case "figma":
        newBlock = { id, type: "figma", embedUrl: "", prototypeTitle: "Interactive Prototype", width: "boxed" }
        break
      case "custom-html":
        newBlock = { id, type: "custom-html", code: "<div class='p-4 text-center'>Custom Component</div>", width: "boxed" }
        break
      default:
        newBlock = { id, type: "text", content: "<p>Content</p>", width: "boxed" }
    }

    updateProject({
      ...project,
      blocks: [...project.blocks, newBlock],
    })
    setSelectedBlockId(id)
  }

  const updateBlock = (updated: ProjectBlock) => {
    updateProject({
      ...project,
      blocks: project.blocks.map((b) => (b.id === updated.id ? updated : b)),
    })
  }

  const duplicateBlock = (id: string) => {
    const idx = project.blocks.findIndex((b) => b.id === id)
    if (idx === -1) return
    const original = project.blocks[idx]
    const clone = { ...original, id: `${original.type}-${Date.now()}` }
    const nextBlocks = [...project.blocks]
    nextBlocks.splice(idx + 1, 0, clone)
    updateProject({ ...project, blocks: nextBlocks })
    setSelectedBlockId(clone.id)
  }

  const deleteBlock = (id: string) => {
    updateProject({
      ...project,
      blocks: project.blocks.filter((b) => b.id !== id),
    })
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= project.blocks.length) return
    const nextBlocks = [...project.blocks]
    const temp = nextBlocks[index]
    nextBlocks[index] = nextBlocks[targetIndex]
    nextBlocks[targetIndex] = temp
    updateProject({ ...project, blocks: nextBlocks })
  }

  // Publish / Schedule action
  const handlePublishStatus = async (status: ProjectStatus, scheduledAt?: string | null) => {
    const slug = project.slug || makeSlug(project.title || "untitled-project")
    const updated = {
      ...project,
      status,
      scheduledAt: scheduledAt || null,
      slug,
      thumbnail: project.thumbnail || "/placeholder.jpg",
    }

    const res = await saveProject({
      ...updated,
      id: updated.id || undefined,
    })

    if (!res.ok) throw new Error(res.error)

    setProject(updated)
    setSaveStatus("saved")
    setSaveMessage(status === "published" ? "Published live" : status === "scheduled" ? "Scheduled" : "Draft saved")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7] text-foreground selection:bg-foreground selection:text-background">
      {/* ─────────────────────────────────────────────────────────────────
          1. STICKY TOP NAVIGATION
      ───────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg border border-border p-2 text-xs font-medium hover:bg-secondary"
            title="Back to Content Studio"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Studio</span>
          </Link>
          <div className="border-l border-border pl-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Project Editor
            </p>
            <h1 className="truncate max-w-[200px] sm:max-w-xs font-medium text-sm">
              {project.title || "Untitled Project"}
            </h1>
          </div>
        </div>

        {/* Autosave status indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`size-2 rounded-full transition-colors ${
              saveStatus === "saved"
                ? "bg-[#1c6538]"
                : saveStatus === "saving"
                ? "bg-amber-500 animate-pulse"
                : saveStatus === "error"
                ? "bg-destructive"
                : "bg-muted-foreground/50"
            }`}
          />
          <span className="hidden font-mono text-[11px] sm:inline">{saveMessage}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="hidden items-center border-r border-border pr-2 sm:flex">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="size-4" />
            </button>
          </div>

          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
          >
            <Eye className="size-3.5" />
            <span>Preview</span>
          </button>

          {/* Publish / Verification Button */}
          <button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90 active:scale-95"
          >
            <Send className="size-3.5" />
            <span>{project.status === "published" ? "Update Project" : "Publish"}</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────
          2. TWO-COLUMN WORKSPACE: CANVAS (LEFT) & SIDEBAR (RIGHT)
      ───────────────────────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-[1540px] gap-8 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* CENTER / LEFT: BEHANCE-STYLE PROJECT CANVAS */}
        <main className="min-w-0 space-y-8">
          {/* ── HERO & COVER SECTION ── */}
          <section className="rounded-2xl border border-border bg-background p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Hero & Cover Section
              </span>
              {project.thumbnail && (
                <button
                  type="button"
                  onClick={() => setCropModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Crop className="size-3.5" /> Focal Point & Crop
                </button>
              )}
            </div>

            {/* Cover Image Upload & Preview */}
            <div className="mt-6">
              {project.thumbnail && !project.thumbnail.startsWith("/placeholder") ? (
                <div className="relative aspect-[16/9] max-h-96 w-full overflow-hidden rounded-xl bg-secondary/50 shadow-inner">
                  <img
                    src={project.thumbnail}
                    alt={project.title || "Cover preview"}
                    className="h-full w-full object-cover"
                    style={
                      project.coverCrop
                        ? {
                            objectPosition: `${project.coverCrop.x}% ${project.coverCrop.y}%`,
                            transform: `scale(${project.coverCrop.zoom})`,
                          }
                        : undefined
                    }
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCropModalOpen(true)}
                      className="rounded-lg bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-background"
                    >
                      Adjust Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => coverFileRef.current?.click()}
                      className="rounded-lg bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-background"
                    >
                      Change Cover
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverFileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) void handleCoverUpload(file)
                  }}
                  className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center transition-colors hover:border-foreground hover:bg-secondary/50"
                >
                  <Upload className="size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Drop a high-resolution hero cover image here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse from your device · Recommended 2400×1350px (16:9)
                  </p>
                </div>
              )}
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleCoverUpload(file)
                }}
              />
            </div>

            {/* Title, Subtitle, Overview Fields */}
            <div className="mt-8 space-y-6">
              <div>
                <input
                  value={project.title}
                  onChange={(e) => {
                    const title = e.target.value
                    updateProject({
                      ...project,
                      title,
                      slug: project.slug ? project.slug : makeSlug(title),
                    })
                  }}
                  placeholder="Project Title (e.g. Aster House — Identity)"
                  className="w-full font-serif text-3xl font-medium tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50 md:text-5xl"
                />
              </div>

              <div>
                <input
                  value={project.subtitle ?? ""}
                  onChange={(e) => updateProject({ ...project, subtitle: e.target.value })}
                  placeholder="Subtitle or single line context (e.g. Visual identity & spatial direction for luxury hospitality)"
                  className="w-full text-base font-normal text-muted-foreground outline-none placeholder:text-muted-foreground/40 md:text-xl"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={project.overview ?? ""}
                  onChange={(e) => updateProject({ ...project, overview: e.target.value })}
                  placeholder="Project overview & narrative: Describe the client, the challenge, and what makes this work distinctive..."
                  className="w-full resize-y rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed outline-none focus:border-foreground placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </section>

          {/* ── CONTENT BUILDER BLOCKS CANVAS ── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Content Canvas ({project.blocks.length} blocks)
              </span>
              <span className="text-xs text-muted-foreground">
                Drag handles to reorder · Click any block to edit
              </span>
            </div>

            {/* Blocks List */}
            <div className="space-y-6">
              {project.blocks.map((block, index) => (
                <BlockItemEditor
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  isFirst={index === 0}
                  isLast={index === project.blocks.length - 1}
                  onSelect={() => setSelectedBlockId(block.id)}
                  onUpdate={updateBlock}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(index, "up")}
                  onMoveDown={() => moveBlock(index, "down")}
                  onUploadProgress={(msg) => setUploadStatus(msg)}
                />
              ))}
            </div>

            {/* Floating Add Block Bar */}
            <BlockToolbar onAddBlock={addBlock} />
          </section>
        </main>

        {/* RIGHT: STICKY SETTINGS SIDEBAR */}
        <aside className="w-full">
          <EditorSidebar
            project={project}
            onUpdate={updateProject}
            onAddBlockFromAsset={(block) => {
              updateProject({ ...project, blocks: [...project.blocks, block] })
              setSelectedBlockId(block.id)
            }}
          />
        </aside>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          3. FLOATING UPLOAD STATUS PILL (BOTTOM)
      ───────────────────────────────────────────────────────────────── */}
      {uploadStatus && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-foreground px-4 py-2 text-xs font-medium text-background shadow-2xl backdrop-blur">
          <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          4. MODALS
      ───────────────────────────────────────────────────────────────── */}
      {cropModalOpen && project.thumbnail && (
        <CropModal
          imageUrl={project.thumbnail}
          crop={project.coverCrop}
          onSave={(crop) => updateProject({ ...project, coverCrop: crop })}
          onClose={() => setCropModalOpen(false)}
        />
      )}

      {publishModalOpen && (
        <PublishModal
          project={project}
          onPublish={handlePublishStatus}
          onClose={() => setPublishModalOpen(false)}
        />
      )}

      {previewModalOpen && (
        <LivePreviewModal
          project={project}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </div>
  )
}
