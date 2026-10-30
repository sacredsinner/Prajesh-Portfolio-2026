"use client"

import { useState } from "react"
import { X, Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react"
import type { ProjectData } from "@/lib/project-editor-types"
import { BlockCaseStudy } from "@/components/projects/block-case-study"

interface LivePreviewModalProps {
  project: ProjectData
  onClose: () => void
}

type DeviceMode = "desktop" | "tablet" | "mobile"

export function LivePreviewModal({ project, onClose }: LivePreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop")

  const previewProject = {
    ...project,
    images: project.images || [],
    blocks: project.blocks || [],
    team: project.team || [],
    toolsUsed: project.toolsUsed || [],
    creativeFields: project.creativeFields || [],
    tags: project.tags || [],
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md">
      {/* Top Bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Preview Mode
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-medium">{project.title || "Untitled Project"}</span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              device === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="size-3.5" /> Desktop
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              device === "tablet" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tablet className="size-3.5" /> Tablet
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              device === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="size-3.5" /> Mobile
          </button>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close preview"
        >
          <X className="size-5" />
        </button>
      </header>

      {/* Frame Container */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-secondary/40 p-4 sm:p-6">
        <div
          className={`h-full overflow-y-auto rounded-2xl bg-background shadow-2xl transition-all duration-300 ${
            device === "desktop"
              ? "w-full max-w-6xl"
              : device === "tablet"
              ? "w-[768px] border border-border"
              : "w-[390px] border border-border"
          }`}
          style={{ minHeight: "85vh" }}
        >
          <BlockCaseStudy project={previewProject as any} />
        </div>
      </div>
    </div>
  )
}
