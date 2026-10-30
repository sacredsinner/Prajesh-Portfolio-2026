"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { INITIAL_PROJECTS } from "./initial-projects"
import type {
  DesignerProject,
  DesignerCanvasItem,
  StylePreset,
  VisualDirection,
  ReferenceItem,
  LayoutMode,
  CanvasBackground,
  VisualSettings,
} from "./types"
import { DesignerTopToolbar } from "./designer-top-toolbar"
import { DesignerLeftSidebar } from "./designer-left-sidebar"
import { DesignerCanvas } from "./designer-canvas"
import { DesignerRightSidebar } from "./designer-right-sidebar"
import { DesignerExportModal } from "./designer-export-modal"
import { generateConceptVisualAction } from "@/app/actions/moodboard-designer"
import { toast } from "sonner"

export function MoodboardDesignerApp() {
  const [allProjects, setAllProjects] = useState<DesignerProject[]>(INITIAL_PROJECTS)
  const [project, setProject] = useState<DesignerProject>(INITIAL_PROJECTS[0])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // Undo / Redo History Stack
  const [history, setHistory] = useState<DesignerCanvasItem[][]>([])
  const [future, setFuture] = useState<DesignerCanvasItem[][]>([])

  // UI state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Push state to undo history
  const pushHistory = useCallback((newItems: DesignerCanvasItem[]) => {
    setHistory((prev) => [...prev.slice(-30), project.items])
    setFuture([])
  }, [project.items])

  const handleUndo = useCallback(() => {
    if (history.length === 0) return
    const previous = history[history.length - 1]
    const newHistory = history.slice(0, -1)
    setFuture((prev) => [project.items, ...prev])
    setHistory(newHistory)
    setProject((prev) => ({ ...prev, items: previous }))
    toast("Undo", { duration: 1000 })
  }, [history, project.items])

  const handleRedo = useCallback(() => {
    if (future.length === 0) return
    const next = future[0]
    const newFuture = future.slice(1)
    setHistory((prev) => [...prev, project.items])
    setFuture(newFuture)
    setProject((prev) => ({ ...prev, items: next }))
    toast("Redo", { duration: 1000 })
  }, [future, project.items])

  // Hotkeys (Ctrl+Z, Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault()
          handleRedo()
        } else {
          e.preventDefault()
          handleUndo()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleUndo, handleRedo])

  // Project Title
  const handleUpdateProjectName = (name: string) => {
    setProject((prev) => ({ ...prev, name }))
  }

  // Creative Brief
  const handleUpdateBrief = (brief: string) => {
    setProject((prev) => ({ ...prev, brief }))
  }

  // Style Preset
  const handleUpdateStylePreset = (preset: StylePreset) => {
    setProject((prev) => ({ ...prev, stylePreset: preset }))
    toast.success(`Style preset updated to ${preset}`)
  }

  // Select Direction
  const handleSelectDirection = (direction: VisualDirection) => {
    setProject((prev) => ({
      ...prev,
      selectedDirectionId: direction.id,
      visualSettings: {
        ...prev.visualSettings,
        mood:
          direction.title.includes("Amber") || direction.title.includes("Lutherie")
            ? "Warm & Artisanal"
            : direction.title.includes("Swiss") || direction.title.includes("Titanium")
            ? "Obsidian Noir"
            : "Ethereal & Muted",
      },
    }))
    toast.success(`Direction applied: ${direction.title}`)
  }

  // Add concept image to canvas
  const handleAddConceptImage = (item: DesignerCanvasItem) => {
    pushHistory([...project.items, item])
    setProject((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }))
    setSelectedItemId(item.id)
  }

  // Visual References
  const handleAddReference = (ref: ReferenceItem) => {
    setProject((prev) => ({
      ...prev,
      references: [ref, ...prev.references],
    }))
  }

  const handleRemoveReference = (refId: string) => {
    setProject((prev) => ({
      ...prev,
      references: prev.references.filter((r) => r.id !== refId),
    }))
  }

  // Switch / Create Projects
  const handleSwitchProject = (newProj: DesignerProject) => {
    setProject(newProj)
    setSelectedItemId(null)
    setHistory([])
    setFuture([])
    toast.success(`Switched to ${newProj.name}`)
  }

  const handleCreateNewProject = () => {
    const newProj: DesignerProject = {
      id: `proj-${Date.now()}`,
      name: "Untitled Creative Direction",
      brief: "A bespoke creative exploration exploring modern aesthetics, typography, and palette balance.",
      stylePreset: "Luxury",
      directions: [],
      items: [],
      visualSettings: {
        mood: "Warm & Artisanal",
        photoStyle: "Macro Studio",
        saturation: 70,
        contrast: 80,
        warmth: 75,
        filmGrain: true,
      },
      layoutMode: "freeform",
      canvasBackground: "obsidian-dots",
      references: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAllProjects((prev) => [newProj, ...prev])
    setProject(newProj)
    setSelectedItemId(null)
    setHistory([])
    setFuture([])
    toast.success("Created new creative workspace project!")
  }

  // Canvas Item Updates
  const handleUpdateItemPosition = (id: string, x: number, y: number) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, x, y } : i)),
    }))
  }

  const handleUpdateItemSize = (id: string, w: number, h: number) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, w, h } : i)),
    }))
  }

  const handleUpdateSelectedItem = (updates: Partial<DesignerCanvasItem>) => {
    if (!selectedItemId) return
    pushHistory(project.items)
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === selectedItemId ? ({ ...i, ...updates } as DesignerCanvasItem) : i
      ),
    }))
  }

  const handleDeleteItem = (id: string) => {
    pushHistory(project.items)
    setProject((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }))
    if (selectedItemId === id) setSelectedItemId(null)
    toast.success("Item removed from canvas")
  }

  // AI Remix Item
  const handleRemixItem = async (item: DesignerCanvasItem) => {
    if (item.type !== "image") return
    toast.info("Generating AI variation...")
    try {
      const res = await generateConceptVisualAction({
        prompt: `${item.caption || "Luxury concept"} alternative artistic remix in ${project.stylePreset} aesthetic`,
        stylePreset: project.stylePreset,
        photoStyle: project.visualSettings.photoStyle,
        aspectRatio: item.aspectRatio || "16:9",
        at: { x: item.x + item.w + 40, y: item.y },
      })
      if (res.ok) {
        handleAddConceptImage(res.item)
        toast.success("Remixed concept added adjacent to source!")
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Remix failed. Please try again.")
    }
  }

  // Extract Palette from Item
  const handleExtractPaletteFromItem = (item: DesignerCanvasItem) => {
    const colors =
      item.type === "image" && item.palette && item.palette.length > 0
        ? item.palette
        : item.type === "color"
        ? [item.hex]
        : ["#5C2817", "#1C1B1A", "#D4AF37", "#8C6D58", "#EAE5DB"]

    const paletteCard: DesignerCanvasItem = {
      id: `palette-${Date.now()}`,
      type: "palette",
      name: `${item.type === "image" ? item.caption?.slice(0, 24) || "Extracted" : "Curated"} Palette`,
      colors,
      x: item.x,
      y: item.y + item.h + 24,
      w: 320,
      h: 160,
      z: 80,
    }

    pushHistory([...project.items, paletteCard])
    setProject((prev) => ({
      ...prev,
      items: [...prev.items, paletteCard],
    }))
    setSelectedItemId(paletteCard.id)
    toast.success("Color palette extracted to canvas!")
  }

  // Visual Settings
  const handleUpdateVisualSettings = (settings: Partial<VisualSettings>) => {
    setProject((prev) => ({
      ...prev,
      visualSettings: { ...prev.visualSettings, ...settings },
    }))
  }

  // Layout Mode
  const handleChangeLayoutMode = (mode: LayoutMode) => {
    setProject((prev) => ({ ...prev, layoutMode: mode }))
    if (mode === "grid" || mode === "masonry") {
      handleSmartArrange()
    }
  }

  // Background
  const handleChangeBackground = (bg: CanvasBackground) => {
    setProject((prev) => ({ ...prev, canvasBackground: bg }))
  }

  // Smart Arrange
  const handleSmartArrange = () => {
    pushHistory(project.items)
    const items = [...project.items]
    const frames = items.filter((i) => i.type === "frame")

    let arranged: DesignerCanvasItem[] = []

    if (frames.length > 0) {
      // Group items inside frames
      const frameChildren = new Map<string, DesignerCanvasItem[]>()
      const loose: DesignerCanvasItem[] = []

      for (const it of items) {
        if (it.type === "frame") continue
        const cx = it.x + it.w / 2
        const cy = it.y + it.h / 2
        const parent = frames.find(
          (f) => cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h
        )
        if (parent) {
          const list = frameChildren.get(parent.id) || []
          list.push(it)
          frameChildren.set(parent.id, list)
        } else {
          loose.push(it)
        }
      }

      let startX = 60
      let startY = 60
      let rowMaxH = 0
      let maxOverallY = 60

      frames.forEach((f, idx) => {
        if (idx > 0 && idx % 2 === 0) {
          startX = 60
          startY += rowMaxH + 80
          rowMaxH = 0
        }
        const dx = startX - f.x
        const dy = startY - f.y

        arranged.push({ ...f, x: startX, y: startY })
        const kids = frameChildren.get(f.id) || []
        for (const kid of kids) {
          arranged.push({ ...kid, x: kid.x + dx, y: kid.y + dy })
        }

        rowMaxH = Math.max(rowMaxH, f.h)
        startX += f.w + 64
        maxOverallY = Math.max(maxOverallY, startY + f.h)
      })

      // Arrange loose items below
      if (loose.length > 0) {
        let looseX = 60
        let looseY = maxOverallY + 80
        let looseRowH = 0

        for (const it of loose) {
          if (looseX + it.w > 1800 && looseX > 60) {
            looseX = 60
            looseY += looseRowH + 32
            looseRowH = 0
          }
          arranged.push({ ...it, x: looseX, y: looseY })
          looseRowH = Math.max(looseRowH, it.h)
          looseX += it.w + 32
        }
      }
    } else {
      // Grid arrange
      let currX = 60
      let currY = 60
      let rowH = 0

      for (const it of items) {
        if (currX + it.w > 1800 && currX > 60) {
          currX = 60
          currY += rowH + 32
          rowH = 0
        }
        arranged.push({ ...it, x: currX, y: currY })
        rowH = Math.max(rowH, it.h)
        currX += it.w + 32
      }
    }

    setProject((prev) => ({ ...prev, items: arranged }))
    toast.success("Board organized with Smart Arrange!")
  }

  const selectedItem = project.items.find((i) => i.id === selectedItemId) || null

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#111110] text-[#E6E6E3]">
      {/* Top Toolbar */}
      <DesignerTopToolbar
        projectName={project.name}
        onUpdateProjectName={handleUpdateProjectName}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.1))}
        onZoomOut={() => setZoom((z) => Math.max(0.25, z - 0.1))}
        onFitCanvas={() => setZoom(1)}
        layoutMode={project.layoutMode}
        onChangeLayoutMode={handleChangeLayoutMode}
        onOpenGenerator={() => setLeftSidebarOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
        onOpenProjects={() => setLeftSidebarOpen(true)}
        onToggleLeftSidebar={() => setLeftSidebarOpen((prev) => !prev)}
        onToggleRightSidebar={() => setRightSidebarOpen((prev) => !prev)}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <DesignerLeftSidebar
          project={project}
          onUpdateBrief={handleUpdateBrief}
          onUpdateStylePreset={handleUpdateStylePreset}
          onSelectDirection={handleSelectDirection}
          onAddConceptImage={handleAddConceptImage}
          onAddReference={handleAddReference}
          onRemoveReference={handleRemoveReference}
          onSwitchProject={handleSwitchProject}
          allProjects={allProjects}
          onCreateNewProject={handleCreateNewProject}
          isOpen={leftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
        />

        {/* Large Central Canvas */}
        <main className="relative flex-1 overflow-hidden">
          <DesignerCanvas
            items={project.items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onUpdateItemPosition={handleUpdateItemPosition}
            onUpdateItemSize={handleUpdateItemSize}
            onDeleteItem={handleDeleteItem}
            onRemixItem={handleRemixItem}
            onExtractPalette={handleExtractPaletteFromItem}
            layoutMode={project.layoutMode}
            canvasBackground={project.canvasBackground}
            visualSettings={project.visualSettings}
            zoom={zoom}
            onZoomChange={setZoom}
            canvasRef={canvasRef}
          />
        </main>

        {/* Right Sidebar */}
        <DesignerRightSidebar
          selectedItem={selectedItem}
          onUpdateSelectedItem={handleUpdateSelectedItem}
          onDeleteItem={handleDeleteItem}
          onRegenerateItem={handleRemixItem}
          onExtractPaletteFromItem={handleExtractPaletteFromItem}
          visualSettings={project.visualSettings}
          onUpdateVisualSettings={handleUpdateVisualSettings}
          layoutMode={project.layoutMode}
          onChangeLayoutMode={handleChangeLayoutMode}
          canvasBackground={project.canvasBackground}
          onChangeBackground={handleChangeBackground}
          onSmartArrange={handleSmartArrange}
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
        />
      </div>

      {/* Export Modal */}
      <DesignerExportModal
        project={project}
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        canvasElement={canvasRef.current}
      />
    </div>
  )
}
