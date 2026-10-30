"use client"

import { useState, useRef } from "react"
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  Sparkles,
  ExternalLink,
  FileText,
} from "lucide-react"
import type { ProjectBlock, BlockWidth } from "@/lib/project-editor-types"
import { uploadToBlob } from "@/lib/upload-client"

interface BlockItemEditorProps {
  block: ProjectBlock
  isSelected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  onUpdate: (updatedBlock: ProjectBlock) => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onUploadProgress?: (status: string) => void
}

export function BlockItemEditor({
  block,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUploadProgress,
}: BlockItemEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const setWidth = (width: BlockWidth) => {
    onUpdate({ ...block, width } as ProjectBlock)
  }

  const handleFileUpload = async (file: File, callback: (url: string) => void) => {
    setUploading(true)
    setUploadError("")
    onUploadProgress?.(`Uploading ${file.name}…`)
    try {
      const res = await uploadToBlob(file, "portfolio")
      callback(res.url)
      onUploadProgress?.("Upload complete")
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.")
      onUploadProgress?.("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isSelected
          ? "border-foreground bg-background shadow-md ring-1 ring-foreground/20"
          : "border-border/60 bg-background/60 hover:border-border hover:bg-background hover:shadow-sm"
      }`}
    >
      {/* Floating Context Toolbar */}
      <div className="absolute -top-3.5 right-4 z-20 hidden items-center gap-1 rounded-full border border-border bg-background px-2 py-1 shadow-md group-hover:flex">
        {/* Width Switcher (if block supports width) */}
        {"width" in block && (
          <div className="flex items-center gap-0.5 border-r border-border pr-1">
            <button
              type="button"
              title="Standard Boxed Width"
              onClick={(e) => {
                e.stopPropagation()
                setWidth("boxed")
              }}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                block.width === "boxed" ? "bg-secondary font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Boxed
            </button>
            <button
              type="button"
              title="Wide Width"
              onClick={(e) => {
                e.stopPropagation()
                setWidth("wide")
              }}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                block.width === "wide" ? "bg-secondary font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wide
            </button>
            <button
              type="button"
              title="Full-Bleed 100%"
              onClick={(e) => {
                e.stopPropagation()
                setWidth("full")
              }}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase ${
                block.width === "full" ? "bg-secondary font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation()
            onMoveUp()
          }}
          title="Move Up"
          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation()
            onMoveDown()
          }}
          title="Move Down"
          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          title="Duplicate Block (Cmd+D)"
          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Copy className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete Block"
          className="rounded p-1 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Block Type Tag & Drag Handle */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
        <div className="flex items-center gap-2">
          <GripVertical className="size-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {block.type.replace("-", " ")}
          </span>
        </div>
        {uploading && <span className="text-xs text-muted-foreground">Uploading media…</span>}
        {uploadError && <span className="text-xs text-destructive">{uploadError}</span>}
      </div>

      {/* Block Content Editor */}
      <div className="p-4 md:p-6">
        {block.type === "image" && (
          <ImageEditor
            block={block}
            onUpdate={onUpdate}
            onUpload={(file) => handleFileUpload(file, (url) => onUpdate({ ...block, url }))}
          />
        )}
        {block.type === "image-grid" && (
          <ImageGridEditor
            block={block}
            onUpdate={onUpdate}
            onUpload={(file) =>
              handleFileUpload(file, (url) =>
                onUpdate({
                  ...block,
                  images: [...block.images, { id: `grid-${Date.now()}`, url }],
                })
              )
            }
          />
        )}
        {block.type === "carousel" && (
          <CarouselEditor
            block={block}
            onUpdate={onUpdate}
            onUpload={(file) =>
              handleFileUpload(file, (url) =>
                onUpdate({
                  ...block,
                  slides: [...block.slides, { id: `slide-${Date.now()}`, url }],
                })
              )
            }
          />
        )}
        {block.type === "full-width-image" && (
          <FullWidthImageEditor
            block={block}
            onUpdate={onUpdate}
            onUpload={(file) => handleFileUpload(file, (url) => onUpdate({ ...block, url }))}
          />
        )}
        {block.type === "video" && <VideoEditor block={block} onUpdate={onUpdate} onUpload={handleFileUpload} />}
        {block.type === "text" && <TextEditor block={block} onUpdate={onUpdate} />}
        {block.type === "heading" && <HeadingEditor block={block} onUpdate={onUpdate} />}
        {block.type === "quote" && <QuoteEditor block={block} onUpdate={onUpdate} />}
        {block.type === "divider" && <DividerEditor block={block} onUpdate={onUpdate} />}
        {block.type === "embed" && <EmbedEditor block={block} onUpdate={onUpdate} />}
        {block.type === "before-after" && (
          <BeforeAfterEditor block={block} onUpdate={onUpdate} onUpload={handleFileUpload} />
        )}
        {block.type === "gif" && (
          <GifEditor
            block={block}
            onUpdate={onUpdate}
            onUpload={(file) => handleFileUpload(file, (url) => onUpdate({ ...block, url }))}
          />
        )}
        {block.type === "pdf" && (
          <PdfEditor block={block} onUpdate={onUpdate} onUpload={handleFileUpload} />
        )}
        {block.type === "figma" && <FigmaEditor block={block} onUpdate={onUpdate} />}
        {block.type === "custom-html" && <CustomHtmlEditor block={block} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   INDIVIDUAL BLOCK EDITORS
───────────────────────────────────────────────────────────────────────── */

function ImageEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "image" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-4">
      {block.url ? (
        <div className="relative overflow-hidden rounded-xl bg-secondary/30">
          <img src={block.url} alt={block.alt || "Preview"} className="max-h-96 w-full object-contain" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-3 right-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur hover:bg-background"
          >
            Replace Image
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) onUpload(file)
          }}
          className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center transition-colors hover:border-foreground"
        >
          <Upload className="size-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Click to upload or drag image here</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP or SVG up to 2400px</p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-muted-foreground">
          Caption (Optional)
          <input
            value={block.caption ?? ""}
            onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
            placeholder="e.g. Identity system packaging detail"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-foreground"
          />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Alt Text (Accessibility & SEO)
          <input
            value={block.alt ?? ""}
            onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
            placeholder="Describe visual for screen readers"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-foreground"
          />
        </label>
      </div>
    </div>
  )
}

function ImageGridEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "image-grid" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Columns:</span>
          {([2, 3, 4] as const).map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => onUpdate({ ...block, columns: col })}
              className={`rounded px-2 py-1 text-xs font-mono ${
                block.columns === col ? "bg-foreground text-background font-bold" : "border border-border text-foreground hover:bg-secondary"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          <Plus className="size-3.5" /> Add Image to Grid
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          files.forEach(onUpload)
        }}
      />

      {block.images.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-center"
        >
          <Upload className="size-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium">Add photos to populate this grid</p>
        </div>
      ) : (
        <div className={`grid gap-3 ${block.columns === 4 ? "grid-cols-4" : block.columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {block.images.map((img, i) => (
            <div key={img.id} className="group/item relative aspect-square overflow-hidden rounded-lg bg-secondary/40">
              <img src={img.url} alt={img.caption || `Grid item ${i}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    ...block,
                    images: block.images.filter((x) => x.id !== img.id),
                  })
                }
                className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 text-destructive shadow backdrop-blur hover:bg-background"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CarouselEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "carousel" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Slides ({block.slides.length})
        </span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          <Plus className="size-3.5" /> Add Slide
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          files.forEach(onUpload)
        }}
      />

      {block.slides.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-center"
        >
          <Upload className="size-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium">Add slides to populate carousel</p>
        </div>
      ) : (
        <div className="space-y-2">
          {block.slides.map((slide, i) => (
            <div key={slide.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
              <img src={slide.url} alt="Slide preview" className="size-12 rounded object-cover" />
              <div className="flex-1 space-y-1">
                <input
                  value={slide.title ?? ""}
                  onChange={(e) => {
                    const next = [...block.slides]
                    next[i] = { ...slide, title: e.target.value }
                    onUpdate({ ...block, slides: next })
                  }}
                  placeholder="Slide title (optional)"
                  className="w-full text-xs font-medium outline-none"
                />
                <input
                  value={slide.caption ?? ""}
                  onChange={(e) => {
                    const next = [...block.slides]
                    next[i] = { ...slide, caption: e.target.value }
                    onUpdate({ ...block, slides: next })
                  }}
                  placeholder="Slide caption (optional)"
                  className="w-full text-[11px] text-muted-foreground outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    ...block,
                    slides: block.slides.filter((x) => x.id !== slide.id),
                  })
                }
                className="text-destructive hover:opacity-80"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FullWidthImageEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "full-width-image" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-4">
      {block.url ? (
        <div className="relative overflow-hidden rounded-xl bg-secondary/30">
          <img src={block.url} alt={block.alt || "Full width"} className="max-h-80 w-full object-cover" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-3 right-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur"
          >
            Change Image
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center"
        >
          <Upload className="size-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">Upload cinematic full-bleed graphic</p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
      <input
        value={block.caption ?? ""}
        onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
      />
    </div>
  )
}

function VideoEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "video" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File, cb: (url: string) => void) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">Source:</label>
        <select
          value={block.source}
          onChange={(e) => onUpdate({ ...block, source: e.target.value as any })}
          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs outline-none"
        >
          <option value="upload">Direct MP4 Upload</option>
          <option value="youtube">YouTube Embed</option>
          <option value="vimeo">Vimeo Embed</option>
          <option value="loom">Loom Embed</option>
        </select>
      </div>

      {block.source === "upload" ? (
        <div>
          <div className="flex gap-2">
            <input
              value={block.url}
              onChange={(e) => onUpdate({ ...block, url: e.target.value })}
              placeholder="https://.../video.mp4"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
            >
              Upload MP4
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file, (url) => onUpdate({ ...block, url }))
            }}
          />
        </div>
      ) : (
        <input
          value={block.url}
          onChange={(e) => onUpdate({ ...block, url: e.target.value })}
          placeholder={`Paste ${block.source} video URL...`}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
        />
      )}

      {/* Playback Toggles */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={block.autoplay ?? false}
            onChange={(e) => onUpdate({ ...block, autoplay: e.target.checked })}
          />
          Autoplay
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={block.loop ?? false}
            onChange={(e) => onUpdate({ ...block, loop: e.target.checked })}
          />
          Loop
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={block.muted ?? true}
            onChange={(e) => onUpdate({ ...block, muted: e.target.checked })}
          />
          Muted
        </label>
      </div>
    </div>
  )
}

function TextEditor({
  block,
  onUpdate,
}: {
  block: Extract<ProjectBlock, { type: "text" }>
  onUpdate: (b: ProjectBlock) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wrapSelection = (before: string, after: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = el.value.substring(start, end)
    const nextVal = el.value.substring(0, start) + before + selected + after + el.value.substring(end)
    onUpdate({ ...block, content: nextVal })
  }

  return (
    <div className="space-y-3">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/50 pb-2">
        <button
          type="button"
          onClick={() => wrapSelection("<strong>", "</strong>")}
          className="rounded p-1 hover:bg-secondary text-foreground"
          title="Bold"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("<em>", "</em>")}
          className="rounded p-1 hover:bg-secondary text-foreground"
          title="Italic"
        >
          <Italic className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("<u>", "</u>")}
          className="rounded p-1 hover:bg-secondary text-foreground"
          title="Underline"
        >
          <Underline className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection('<a href="https://" target="_blank" class="underline">', "</a>")}
          className="rounded p-1 hover:bg-secondary text-foreground"
          title="Link"
        >
          <LinkIcon className="size-3.5" />
        </button>
        <div className="mx-1 h-3.5 w-px bg-border" />
        <button
          type="button"
          onClick={() => onUpdate({ ...block, align: "left" })}
          className={`rounded p-1 ${block.align === "left" || !block.align ? "bg-secondary" : ""}`}
        >
          <AlignLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ ...block, align: "center" })}
          className={`rounded p-1 ${block.align === "center" ? "bg-secondary" : ""}`}
        >
          <AlignCenter className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ ...block, align: "right" })}
          className={`rounded p-1 ${block.align === "right" ? "bg-secondary" : ""}`}
        >
          <AlignRight className="size-3.5" />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={5}
        value={block.content}
        onChange={(e) => onUpdate({ ...block, content: e.target.value })}
        placeholder="Write your editorial copy here (supports HTML or rich formatting)..."
        className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm leading-relaxed outline-none focus:border-foreground"
      />
    </div>
  )
}

function HeadingEditor({
  block,
  onUpdate,
}: {
  block: Extract<ProjectBlock, { type: "heading" }>
  onUpdate: (b: ProjectBlock) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {([1, 2, 3, 4] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => onUpdate({ ...block, level: lvl })}
            className={`rounded px-2.5 py-1 text-xs font-mono font-medium ${
              block.level === lvl ? "bg-foreground text-background" : "border border-border text-foreground hover:bg-secondary"
            }`}
          >
            H{lvl}
          </button>
        ))}
      </div>
      <input
        value={block.content}
        onChange={(e) => onUpdate({ ...block, content: e.target.value })}
        placeholder="Heading text..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-serif text-2xl outline-none focus:border-foreground"
      />
      <input
        value={block.subtitle ?? ""}
        onChange={(e) => onUpdate({ ...block, subtitle: e.target.value })}
        placeholder="Subtitle / Context line (optional)..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground outline-none focus:border-foreground"
      />
    </div>
  )
}

function QuoteEditor({
  block,
  onUpdate,
}: {
  block: Extract<ProjectBlock, { type: "quote" }>
  onUpdate: (b: ProjectBlock) => void
}) {
  return (
    <div className="space-y-3">
      <textarea
        rows={3}
        value={block.quote}
        onChange={(e) => onUpdate({ ...block, quote: e.target.value })}
        placeholder="“A clear, memorable brand identity built to grow with the business.”"
        className="w-full resize-y rounded-lg border border-border bg-background p-3 font-serif text-lg italic outline-none focus:border-foreground"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={block.citation ?? ""}
          onChange={(e) => onUpdate({ ...block, citation: e.target.value })}
          placeholder="Author / Client name"
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground"
        />
        <input
          value={block.role ?? ""}
          onChange={(e) => onUpdate({ ...block, role: e.target.value })}
          placeholder="Role or Company (e.g. Founder & CEO)"
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-foreground"
        />
      </div>
    </div>
  )
}

function DividerEditor({
  block,
  onUpdate,
}: {
  block: Extract<ProjectBlock, { type: "divider" }>
  onUpdate: (b: ProjectBlock) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-muted-foreground">Style:</span>
        {(["line", "dash", "dots", "blank"] as const).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => onUpdate({ ...block, style })}
            className={`rounded px-2 py-1 capitalize ${
              block.style === style ? "bg-foreground text-background" : "border border-border hover:bg-secondary"
            }`}
          >
            {style}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-muted-foreground">Spacing:</span>
        {(["sm", "md", "lg", "xl"] as const).map((sp) => (
          <button
            key={sp}
            type="button"
            onClick={() => onUpdate({ ...block, spacing: sp })}
            className={`rounded px-2 py-1 uppercase ${
              block.spacing === sp ? "bg-foreground text-background" : "border border-border hover:bg-secondary"
            }`}
          >
            {sp}
          </button>
        ))}
      </div>
    </div>
  )
}

function EmbedEditor({
  block,
  onUpdate,
}: {
  block: Extract<ProjectBlock, { type: "embed" }>
  onUpdate: (b: ProjectBlock) => void
}) {
  return (
    <div className="space-y-3">
      <input
        value={block.url}
        onChange={(e) => onUpdate({ ...block, url: e.target.value })}
        placeholder="https://... (URL to embed)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
      />
      <textarea
        rows={3}
        value={block.html ?? ""}
        onChange={(e) => onUpdate({ ...block, html: e.target.value })}
        placeholder="Or paste <iframe> embed code..."
        className="w-full font-mono text-xs rounded-lg border border-border bg-background p-2.5 outline-none focus:border-foreground"
      />
    </div>
  )
}

function BeforeAfterEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "before-after" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File, cb: (url: string) => void) => void
}) {
  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Before Image:</span>
          {block.beforeUrl ? (
            <img src={block.beforeUrl} alt="Before" className="h-32 w-full rounded object-cover" />
          ) : (
            <div
              onClick={() => beforeRef.current?.click()}
              className="flex h-32 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-border"
            >
              <Upload className="size-4 text-muted-foreground" />
              <span className="mt-1 text-xs">Upload Before</span>
            </div>
          )}
          <input
            ref={beforeRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file, (url) => onUpdate({ ...block, beforeUrl: url }))
            }}
          />
          <input
            value={block.beforeLabel ?? ""}
            onChange={(e) => onUpdate({ ...block, beforeLabel: e.target.value })}
            placeholder="Label (e.g. Original)"
            className="w-full rounded border border-border px-2 py-1 text-xs"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">After Image:</span>
          {block.afterUrl ? (
            <img src={block.afterUrl} alt="After" className="h-32 w-full rounded object-cover" />
          ) : (
            <div
              onClick={() => afterRef.current?.click()}
              className="flex h-32 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-border"
            >
              <Upload className="size-4 text-muted-foreground" />
              <span className="mt-1 text-xs">Upload After</span>
            </div>
          )}
          <input
            ref={afterRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file, (url) => onUpdate({ ...block, afterUrl: url }))
            }}
          />
          <input
            value={block.afterLabel ?? ""}
            onChange={(e) => onUpdate({ ...block, afterLabel: e.target.value })}
            placeholder="Label (e.g. Redesign)"
            className="w-full rounded border border-border px-2 py-1 text-xs"
          />
        </div>
      </div>
    </div>
  )
}

function GifEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "gif" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-3">
      {block.url ? (
        <div className="relative overflow-hidden rounded-xl bg-secondary/30">
          <img src={block.url} alt="GIF Preview" className="max-h-72 w-full object-contain" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-3 right-3 rounded bg-background/90 px-2.5 py-1 text-xs"
          >
            Change GIF
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center"
        >
          <Upload className="size-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-medium">Upload Animated GIF</p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
      <input
        value={block.caption ?? ""}
        onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none"
      />
    </div>
  )
}

function PdfEditor({
  block,
  onUpdate,
  onUpload,
}: {
  block: Extract<ProjectBlock, { type: "pdf" }>
  onUpdate: (b: ProjectBlock) => void
  onUpload: (file: File, cb: (url: string) => void) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <FileText className="size-6 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <input
            value={block.filename}
            onChange={(e) => onUpdate({ ...block, filename: e.target.value })}
            placeholder="Document filename (e.g. Brand-Guidelines.pdf)"
            className="w-full text-xs font-medium outline-none"
          />
          <input
            value={block.description ?? ""}
            onChange={(e) => onUpdate({ ...block, description: e.target.value })}
            placeholder="Brief description (e.g. 48 pages · 12 MB)"
            className="w-full text-[11px] text-muted-foreground outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          Upload PDF
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            onUpload(file, (url) =>
              onUpdate({
                ...block,
                url,
                filename: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              })
            )
          }
        }}
      />
    </div>
  )
}

function FigmaEditor({
  block,
  onUpdate,
}: {
  block: Extract<ProjectBlock, { type: "figma" }>
  onUpdate: (b: ProjectBlock) => void
}) {
  return (
    <div className="space-y-3">
      <input
        value={block.embedUrl}
        onChange={(e) => onUpdate({ ...block, embedUrl: e.target.value })}
        placeholder="https://www.figma.com/proto/... or /design/..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground"
      />
      <input
        value={block.prototypeTitle ?? ""}
        onChange={(e) => onUpdate({ ...block, prototypeTitle: e.target.value })}
        placeholder="Prototype title (e.g. iOS App Navigation Flow)"
        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none"
      />
    </div>
  )
}

function CustomHtmlEditor({
  block,
  onUpdate,
}: {
  block: Extract<ProjectBlock, { type: "custom-html" }>
  onUpdate: (b: ProjectBlock) => void
}) {
  return (
    <div className="space-y-3">
      <textarea
        rows={5}
        value={block.code}
        onChange={(e) => onUpdate({ ...block, code: e.target.value })}
        placeholder="<div class='custom-animation'>...</div> or SVG markup"
        className="w-full font-mono text-xs rounded-lg border border-border bg-background p-3 outline-none focus:border-foreground"
      />
      <input
        value={block.caption ?? ""}
        onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
        placeholder="Caption / Notes (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none"
      />
    </div>
  )
}
