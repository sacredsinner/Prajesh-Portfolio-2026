"use client"

import { useState } from "react"
import {
  Image as ImageIcon,
  Grid,
  Layers,
  Maximize2,
  Video,
  Type,
  Heading,
  Quote,
  Minus,
  Code,
  GitCompare,
  FileText,
  Figma,
  Film,
  Plus,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import type { ProjectBlock } from "@/lib/project-editor-types"

interface BlockToolbarProps {
  onAddBlock: (type: ProjectBlock["type"]) => void
}

const BLOCK_ITEMS: {
  type: ProjectBlock["type"]
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}[] = [
  { type: "image", label: "Image", icon: ImageIcon, description: "Single high-res visual" },
  { type: "image-grid", label: "Image Grid", icon: Grid, description: "2 to 4 column responsive gallery" },
  { type: "carousel", label: "Carousel", icon: Layers, description: "Interactive sliding presentation" },
  { type: "full-width-image", label: "Full Width", icon: Maximize2, description: "Edge-to-edge cinematic graphic" },
  { type: "video", label: "Video", icon: Video, description: "MP4/WebM upload or video embed" },
  { type: "text", label: "Text", icon: Type, description: "Rich editorial copy & paragraph" },
  { type: "heading", label: "Heading", icon: Heading, description: "H1–H4 section header" },
  { type: "quote", label: "Quote", icon: Quote, description: "Pull quote with author citation" },
  { type: "divider", label: "Divider", icon: Minus, description: "Line, dash, dots, or spacer" },
  { type: "before-after", label: "Before / After", icon: GitCompare, description: "Interactive comparison slider" },
  { type: "embed", label: "Web Embed", icon: Code, description: "Responsive iframe or link preview" },
  { type: "gif", label: "Animated GIF", icon: Film, description: "Looping animation sequence" },
  { type: "pdf", label: "PDF Document", icon: FileText, description: "Downloadable attachment card" },
  { type: "figma", label: "Figma Prototype", icon: Figma, description: "Live interactive Figma embed" },
  { type: "custom-html", label: "Custom HTML", icon: Sparkles, description: "Custom HTML, SVG or embed code" },
]

export function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative my-8 flex flex-col items-center">
      {/* Floating Pill Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-border bg-background/95 p-1.5 shadow-lg backdrop-blur-md">
        {/* Core Quick Buttons */}
        {BLOCK_ITEMS.slice(0, 7).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onAddBlock(item.type)}
              title={item.description}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary active:scale-95"
            >
              <Icon className="size-3.5 text-muted-foreground" />
              <span>{item.label}</span>
            </button>
          )
        })}

        {/* More Blocks Dropdown Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isOpen ? "bg-foreground text-background" : "hover:bg-secondary text-foreground"
            }`}
          >
            <Plus className="size-3.5" />
            <span>More Blocks</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute left-1/2 top-full z-40 mt-2 grid w-72 -translate-x-1/2 gap-1 rounded-2xl border border-border bg-background p-2 shadow-2xl">
                <p className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Additional Block Types
                </p>
                {BLOCK_ITEMS.slice(7).map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        onAddBlock(item.type)
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-secondary"
                    >
                      <div className="flex size-7 items-center justify-center rounded-md bg-secondary text-foreground">
                        <Icon className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
