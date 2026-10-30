"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Download,
  Share2,
  ChevronLeft,
  LayoutGrid,
  Move,
  Columns3,
  SlidersHorizontal,
  FolderOpen,
} from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import type { LayoutMode } from "./types"

interface DesignerTopToolbarProps {
  projectName: string
  onUpdateProjectName: (name: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitCanvas: () => void
  layoutMode: LayoutMode
  onChangeLayoutMode: (mode: LayoutMode) => void
  onOpenGenerator: () => void
  onOpenExport: () => void
  onOpenProjects: () => void
  onToggleLeftSidebar: () => void
  onToggleRightSidebar: () => void
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
}

export function DesignerTopToolbar({
  projectName,
  onUpdateProjectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitCanvas,
  layoutMode,
  onChangeLayoutMode,
  onOpenGenerator,
  onOpenExport,
  onOpenProjects,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  leftSidebarOpen,
  rightSidebarOpen,
}: DesignerTopToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(projectName)

  const handleFinishEditing = () => {
    setIsEditingTitle(false)
    if (titleInput.trim()) {
      onUpdateProjectName(titleInput.trim())
    } else {
      setTitleInput(projectName)
    }
  }

  return (
    <header className="relative z-50 flex h-14 w-full items-center justify-between border-b border-[#262624] bg-[#121211] px-4 text-[#E6E6E3]">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/moodboards"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#2E2E2A] text-muted-foreground transition hover:border-[#45453F] hover:bg-[#1E1E1C] hover:text-[#FAFAFA]"
          title="Back to Studio Moodboards"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-2">
          <BrandMark className="h-5 w-5 text-amber-400" />
          <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E8E88] md:inline">
            Firefly Studio
          </span>
          <span className="text-[#3E3E38]">/</span>
        </div>

        {/* Project Name Editable Field */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishEditing()
                if (e.key === "Escape") {
                  setTitleInput(projectName)
                  setIsEditingTitle(false)
                }
              }}
              className="h-7 rounded border border-amber-500/50 bg-[#1A1A18] px-2 text-xs font-medium text-white outline-none ring-1 ring-amber-500/30"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleInput(projectName)
                setIsEditingTitle(true)
              }}
              className="group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[#FAFAFA] transition hover:bg-[#1E1E1C]"
              title="Click to rename project"
            >
              <span className="max-w-[200px] truncate md:max-w-[320px]">{projectName}</span>
              <span className="text-[10px] text-[#6E6E68] opacity-0 group-hover:opacity-100">✎</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenProjects}
            className="flex h-7 cursor-pointer items-center gap-1 rounded-md border border-[#2A2A26] px-2 text-[11px] text-[#A6A6A0] transition hover:border-[#3D3D36] hover:bg-[#1A1A18] hover:text-white"
            title="Switch project"
          >
            <FolderOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Projects</span>
          </button>
        </div>
      </div>

      {/* Center: Undo/Redo & Layout Controls & Zoom */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Toggle Left Sidebar */}
        <button
          type="button"
          onClick={onToggleLeftSidebar}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs transition ${
            leftSidebarOpen
              ? "border-[#3E3E38] bg-[#222220] text-amber-400"
              : "border-[#262624] text-[#8E8E88] hover:bg-[#1E1E1C] hover:text-white"
          }`}
          title="Toggle Left Tool Panel (Brief, Visual Directions, References)"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center rounded-lg border border-[#262624] bg-[#161615] p-0.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#B0B0AA] transition hover:bg-[#222220] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#B0B0AA] transition hover:bg-[#222220] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Layout Modes */}
        <div className="hidden items-center rounded-lg border border-[#262624] bg-[#161615] p-0.5 sm:flex">
          <button
            type="button"
            onClick={() => onChangeLayoutMode("freeform")}
            className={`flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-medium transition ${
              layoutMode === "freeform"
                ? "bg-[#282824] text-white shadow-sm"
                : "text-[#8E8E88] hover:text-white"
            }`}
            title="Freeform Drag & Drop Canvas"
          >
            <Move className="h-3 w-3" />
            <span>Freeform</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeLayoutMode("grid")}
            className={`flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-medium transition ${
              layoutMode === "grid"
                ? "bg-[#282824] text-white shadow-sm"
                : "text-[#8E8E88] hover:text-white"
            }`}
            title="Auto-aligned Grid"
          >
            <LayoutGrid className="h-3 w-3" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeLayoutMode("masonry")}
            className={`flex h-7 items-center gap-1.5 rounded px-2 text-[11px] font-medium transition ${
              layoutMode === "masonry"
                ? "bg-[#282824] text-white shadow-sm"
                : "text-[#8E8E88] hover:text-white"
            }`}
            title="Editorial Masonry Flow"
          >
            <Columns3 className="h-3 w-3" />
            <span>Masonry</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden items-center rounded-lg border border-[#262624] bg-[#161615] p-0.5 lg:flex">
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#B0B0AA] transition hover:bg-[#222220] hover:text-white"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onFitCanvas}
            className="px-2 text-[11px] font-mono text-[#8E8E88] transition hover:text-white"
            title="Reset to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#B0B0AA] transition hover:bg-[#222220] hover:text-white"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onFitCanvas}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-[#B0B0AA] transition hover:bg-[#222220] hover:text-white"
            title="Fit Canvas to Viewport"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Right: Primary Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Generate Visuals CTA */}
        <button
          type="button"
          onClick={onOpenGenerator}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-semibold text-[#111110] shadow-md transition hover:brightness-110 active:scale-95"
          title="Generate AI Concepts & Visuals"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Generate</span>
        </button>

        {/* Export CTA */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#3E3E38] bg-[#1E1E1C] px-3 py-1.5 text-xs font-medium text-white transition hover:border-[#55554D] hover:bg-[#262624] active:scale-95"
          title="Export Moodboard as PNG, JPG, or PDF"
        >
          <Download className="h-3.5 w-3.5 text-[#B0B0AA]" />
          <span>Export</span>
        </button>

        {/* Toggle Right Sidebar */}
        <button
          type="button"
          onClick={onToggleRightSidebar}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs transition ${
            rightSidebarOpen
              ? "border-[#3E3E38] bg-[#222220] text-amber-400"
              : "border-[#262624] text-[#8E8E88] hover:bg-[#1E1E1C] hover:text-white"
          }`}
          title="Toggle Right Panel (Inspector, Visual Settings, Atmosphere)"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  )
}
