"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink, Download, FileText, Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react"
import type { ProjectBlock, BlockWidth } from "@/lib/project-editor-types"
import type { Project } from "@/components/project-card"
import { ShareLinks, type ShareLinksProps } from "@/components/share-links"

function getWidthClass(width?: BlockWidth) {
  switch (width) {
    case "wide":
      return "max-w-6xl mx-auto px-4 sm:px-6"
    case "full":
      return "w-full px-0"
    case "boxed":
    default:
      return "max-w-4xl mx-auto px-4 sm:px-6"
  }
}

export function BlockCaseStudy({ project, nextProject, share }: { project: Project; nextProject?: Project; share?: ShareLinksProps }) {
  const blocks = project.blocks ?? []
  const team = project.team ?? []
  const tools = project.toolsUsed ?? []
  const creativeFields = project.creativeFields ?? []

  return (
    <article className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Cover / Hero */}
      <header className="page-container pb-12 pt-16 md:pb-20 md:pt-28">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>{project.category}</span>
          <span>·</span>
          <span>{project.year}</span>
          {project.client && (
            <>
              <span>·</span>
              <span>{project.client}</span>
            </>
          )}
        </div>
        <h1 className="mt-6 max-w-6xl font-serif text-[clamp(2.75rem,8vw,7.5rem)] uppercase leading-[0.9] tracking-[-0.05em]">
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="mt-4 max-w-3xl font-serif text-xl text-muted-foreground md:text-3xl">
            {project.subtitle}
          </p>
        )}
      </header>

      {/* Hero Cover Image */}
      {project.thumbnail && !project.thumbnail.startsWith("/placeholder") && (
        <div className="relative mb-16 aspect-[16/9] max-h-[82vh] w-full overflow-hidden bg-muted md:mb-24">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Project Metadata Details */}
      {(project.overview || project.role || team.length > 0 || tools.length > 0) && (
        <section className="page-container mb-20 grid gap-12 border-y border-border py-12 md:grid-cols-[0.8fr_1.6fr] md:py-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            [ Project Overview ]
          </div>
          <div className="space-y-12">
            {project.overview && (
              <p className="font-serif text-2xl leading-relaxed text-foreground md:text-4xl">
                {project.overview}
              </p>
            )}

            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
              {project.client && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Client</dt>
                  <dd className="mt-1 text-sm font-medium">{project.client}</dd>
                </div>
              )}
              {project.role && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Role</dt>
                  <dd className="mt-1 text-sm font-medium">{project.role}</dd>
                </div>
              )}
              {project.year && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Year</dt>
                  <dd className="mt-1 text-sm font-medium">{project.year}</dd>
                </div>
              )}
              {project.category && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Discipline</dt>
                  <dd className="mt-1 text-sm font-medium">{project.category}</dd>
                </div>
              )}
              {tools.length > 0 && (
                <div className="col-span-2 sm:col-span-3 md:col-span-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tools & Software</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <span key={tool} className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs">
                        {tool}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}

      {/* Dynamic Content Blocks */}
      <div className="space-y-16 md:space-y-24">
        {blocks.map((block) => (
          <BlockItem key={block.id} block={block} />
        ))}
      </div>

      {/* Team & Credits */}
      {team.length > 0 && (
        <section className="page-container mt-24 border-t border-border pt-16">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            [ Team & Credits ]
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {team.map((member, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
                {member.url && (
                  <a
                    href={member.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs underline"
                  >
                    Portfolio <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Share Section */}
      {share && (
        <section className="page-container mt-20 grid gap-8 border-t border-border py-14 md:grid-cols-[0.8fr_1.6fr] md:items-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            [ Share Project ]
          </div>
          <ShareLinks {...share} />
        </section>
      )}

      {/* Next Project Footer */}
      {nextProject && (
        <Link
          href={`/projects/${nextProject.slug}`}
          className="group block border-t border-border py-20 transition-colors hover:bg-secondary/30 md:py-32"
        >
          <div className="page-container">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              [ Next Project ]
            </p>
            <p className="mt-6 max-w-5xl font-serif text-[clamp(2.5rem,7vw,6.5rem)] uppercase leading-[0.88] tracking-[-0.05em] transition-transform duration-500 group-hover:translate-x-3">
              {nextProject.title}
            </p>
          </div>
        </Link>
      )}
    </article>
  )
}

function BlockItem({ block }: { block: ProjectBlock }) {
  switch (block.type) {
    case "image":
      return <SingleImageBlock block={block} />
    case "image-grid":
      return <ImageGridBlockView block={block} />
    case "carousel":
      return <CarouselBlockView block={block} />
    case "full-width-image":
      return <FullWidthImageBlockView block={block} />
    case "video":
      return <VideoBlockView block={block} />
    case "text":
      return <TextBlockView block={block} />
    case "heading":
      return <HeadingBlockView block={block} />
    case "quote":
      return <QuoteBlockView block={block} />
    case "divider":
      return <DividerBlockView block={block} />
    case "embed":
      return <EmbedBlockView block={block} />
    case "before-after":
      return <BeforeAfterBlockView block={block} />
    case "gif":
      return <GifBlockView block={block} />
    case "pdf":
      return <PdfBlockView block={block} />
    case "figma":
      return <FigmaBlockView block={block} />
    case "custom-html":
      return <CustomHtmlBlockView block={block} />
    default:
      return null
  }
}

function SingleImageBlock({ block }: { block: Extract<ProjectBlock, { type: "image" }> }) {
  if (!block.url) return null
  return (
    <figure className={getWidthClass(block.width)}>
      <div className="relative overflow-hidden rounded-xl bg-secondary/50 shadow-sm">
        <img
          src={block.url}
          alt={block.alt || block.caption || "Project imagery"}
          className="h-auto w-full object-cover"
          loading="lazy"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-3 text-center text-xs text-muted-foreground">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function ImageGridBlockView({ block }: { block: Extract<ProjectBlock, { type: "image-grid" }> }) {
  const images = block.images || []
  if (images.length === 0) return null

  const gridCols =
    block.columns === 4
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
      : block.columns === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2"

  const gapClass = block.gap === "lg" ? "gap-6 md:gap-8" : block.gap === "sm" ? "gap-2" : "gap-4"

  return (
    <div className={getWidthClass(block.width)}>
      <div className={`grid ${gridCols} ${gapClass}`}>
        {images.map((img) => (
          <figure key={img.id} className="group relative overflow-hidden rounded-xl bg-secondary/50">
            <img
              src={img.url}
              alt={img.alt || img.caption || "Grid detail"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            {img.caption && (
              <figcaption className="p-2 text-center text-xs text-muted-foreground">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}

function CarouselBlockView({ block }: { block: Extract<ProjectBlock, { type: "carousel" }> }) {
  const slides = block.slides || []
  const [index, setIndex] = useState(0)

  if (slides.length === 0) return null

  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1))
  const next = () => setIndex((i) => (i === slides.length - 1 ? 0 : i + 1))

  return (
    <div className={getWidthClass(block.width)}>
      <div className="relative overflow-hidden rounded-xl bg-secondary/50 shadow-sm">
        <div className="relative aspect-[16/10] w-full">
          <img
            src={slides[index].url}
            alt={slides[index].title || slides[index].caption || "Carousel slide"}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        </div>
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2.5 shadow backdrop-blur transition-all hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2.5 shadow backdrop-blur transition-all hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`size-2 rounded-full transition-all ${
                    index === i ? "w-5 bg-foreground" : "bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {(slides[index].title || slides[index].caption) && (
        <div className="mt-3 text-center">
          {slides[index].title && <p className="text-sm font-medium">{slides[index].title}</p>}
          {slides[index].caption && (
            <p className="text-xs text-muted-foreground">{slides[index].caption}</p>
          )}
        </div>
      )}
    </div>
  )
}

function FullWidthImageBlockView({ block }: { block: Extract<ProjectBlock, { type: "full-width-image" }> }) {
  if (!block.url) return null
  return (
    <figure className="relative w-full overflow-hidden">
      <img
        src={block.url}
        alt={block.alt || block.caption || "Full width display"}
        className="h-auto max-h-[90vh] w-full object-cover"
        loading="lazy"
      />
      {block.caption && (
        <figcaption className="page-container mt-3 text-center text-xs text-muted-foreground">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function VideoBlockView({ block }: { block: Extract<ProjectBlock, { type: "video" }> }) {
  if (!block.url) return null
  const isEmbed = block.source !== "upload" && (block.url.includes("youtube") || block.url.includes("vimeo") || block.url.includes("loom"))

  return (
    <div className={getWidthClass(block.width)}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary/50 shadow-sm">
        {isEmbed ? (
          <iframe
            src={getEmbedUrl(block.url)}
            title={block.caption || "Project video"}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={block.url}
            controls={block.controls ?? true}
            autoPlay={block.autoplay ?? false}
            loop={block.loop ?? false}
            muted={block.muted ?? true}
            playsInline
            className="h-full w-full object-cover"
          />
        )}
      </div>
      {block.caption && (
        <p className="mt-2 text-center text-xs text-muted-foreground">{block.caption}</p>
      )}
    </div>
  )
}

function getEmbedUrl(rawUrl: string) {
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    const id = rawUrl.includes("youtu.be/") ? rawUrl.split("youtu.be/")[1]?.split("?")[0] : new URLSearchParams(rawUrl.split("?")[1]).get("v")
    return `https://www.youtube.com/embed/${id}?rel=0`
  }
  if (rawUrl.includes("vimeo.com")) {
    const id = rawUrl.split("vimeo.com/")[1]?.split("?")[0]
    return `https://player.vimeo.com/video/${id}`
  }
  if (rawUrl.includes("loom.com")) {
    const id = rawUrl.split("loom.com/share/")[1]?.split("?")[0]
    return `https://www.loom.com/embed/${id}`
  }
  return rawUrl
}

function TextBlockView({ block }: { block: Extract<ProjectBlock, { type: "text" }> }) {
  const alignClass =
    block.align === "center"
      ? "text-center"
      : block.align === "right"
      ? "text-right"
      : block.align === "justify"
      ? "text-justify"
      : "text-left"

  const sizeClass =
    block.fontSize === "xl"
      ? "text-2xl md:text-3xl font-serif"
      : block.fontSize === "lg"
      ? "text-lg md:text-xl"
      : block.fontSize === "sm"
      ? "text-sm"
      : "text-base md:text-lg"

  return (
    <div className={getWidthClass(block.width)}>
      <div
        className={`leading-relaxed text-foreground/90 ${alignClass} ${sizeClass}`}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  )
}

function HeadingBlockView({ block }: { block: Extract<ProjectBlock, { type: "heading" }> }) {
  const alignClass =
    block.align === "center" ? "text-center" : block.align === "right" ? "text-right" : "text-left"

  return (
    <div className={getWidthClass(block.width)}>
      <div className={alignClass}>
        {block.level === 1 && (
          <h2 className="font-serif text-4xl uppercase tracking-tight md:text-6xl">{block.content}</h2>
        )}
        {block.level === 2 && (
          <h3 className="font-serif text-3xl uppercase tracking-tight md:text-5xl">{block.content}</h3>
        )}
        {block.level === 3 && (
          <h4 className="font-serif text-2xl tracking-tight md:text-3xl">{block.content}</h4>
        )}
        {block.level === 4 && (
          <h5 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{block.content}</h5>
        )}
        {block.subtitle && (
          <p className="mt-3 font-serif text-lg text-muted-foreground md:text-xl">{block.subtitle}</p>
        )}
      </div>
    </div>
  )
}

function QuoteBlockView({ block }: { block: Extract<ProjectBlock, { type: "quote" }> }) {
  return (
    <div className={getWidthClass(block.width)}>
      <blockquote className="relative my-8 border-l-2 border-foreground/40 pl-6 md:pl-10">
        <p className="font-serif text-2xl italic leading-relaxed md:text-4xl">
          “{block.quote}”
        </p>
        {(block.citation || block.role) && (
          <footer className="mt-4 flex items-center gap-3">
            {block.avatarUrl && (
              <img
                src={block.avatarUrl}
                alt={block.citation || "Avatar"}
                className="size-8 rounded-full object-cover"
              />
            )}
            <div>
              {block.citation && <cite className="block text-sm font-medium not-italic">{block.citation}</cite>}
              {block.role && <span className="block text-xs text-muted-foreground">{block.role}</span>}
            </div>
          </footer>
        )}
      </blockquote>
    </div>
  )
}

function DividerBlockView({ block }: { block: Extract<ProjectBlock, { type: "divider" }> }) {
  const spacingClass =
    block.spacing === "xl" ? "my-24" : block.spacing === "lg" ? "my-16" : block.spacing === "sm" ? "my-6" : "my-12"

  if (block.style === "blank") return <div className={spacingClass} />
  if (block.style === "dash")
    return (
      <div className={`mx-auto max-w-4xl px-4 ${spacingClass}`}>
        <hr className="border-t border-dashed border-border" />
      </div>
    )
  if (block.style === "dots")
    return (
      <div className={`flex items-center justify-center gap-2 ${spacingClass}`}>
        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
      </div>
    )

  return (
    <div className={`mx-auto max-w-4xl px-4 ${spacingClass}`}>
      <hr className="border-t border-border" />
    </div>
  )
}

function EmbedBlockView({ block }: { block: Extract<ProjectBlock, { type: "embed" }> }) {
  return (
    <div className={getWidthClass(block.width)}>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-secondary/30">
        {block.html ? (
          <div
            className="h-full w-full"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        ) : (
          <iframe
            src={block.url}
            title={block.title || "Embedded media"}
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}
      </div>
      {block.title && <p className="mt-2 text-center text-xs text-muted-foreground">{block.title}</p>}
    </div>
  )
}

function BeforeAfterBlockView({ block }: { block: Extract<ProjectBlock, { type: "before-after" }> }) {
  const [sliderPos, setSliderPos] = useState(block.initialPosition ?? 50)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  return (
    <div className={getWidthClass(block.width)}>
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="group relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-xl bg-secondary/50 shadow-sm"
      >
        {/* After image (background) */}
        <img
          src={block.afterUrl}
          alt={block.afterLabel || "After"}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        {block.afterLabel && (
          <span className="absolute bottom-4 right-4 rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {block.afterLabel}
          </span>
        )}

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={block.beforeUrl}
            alt={block.beforeLabel || "Before"}
            className="pointer-events-none absolute inset-0 h-full max-w-none object-cover"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%" }}
          />
          {block.beforeLabel && (
            <span className="absolute bottom-4 left-4 rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
              {block.beforeLabel}
            </span>
          )}
        </div>

        {/* Slider dividing line & handle */}
        <div
          className="absolute bottom-0 top-0 w-0.5 bg-background shadow-lg"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background p-2 shadow-xl">
            <div className="flex size-4 items-center justify-between text-muted-foreground">
              <ChevronLeft className="size-3" />
              <ChevronRight className="size-3" />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">Drag to compare Before and After</p>
    </div>
  )
}

function GifBlockView({ block }: { block: Extract<ProjectBlock, { type: "gif" }> }) {
  if (!block.url) return null
  return (
    <figure className={getWidthClass(block.width)}>
      <div className="relative overflow-hidden rounded-xl bg-secondary/50 shadow-sm">
        <img
          src={block.url}
          alt={block.alt || block.caption || "Animated sequence"}
          className="h-auto w-full object-cover"
          loading="lazy"
        />
        <div className="absolute bottom-3 left-3 rounded bg-background/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur">
          GIF
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function PdfBlockView({ block }: { block: Extract<ProjectBlock, { type: "pdf" }> }) {
  return (
    <div className={getWidthClass(block.width)}>
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-secondary/20 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-foreground text-background">
            <FileText className="size-6" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{block.filename || "Project Document.pdf"}</h4>
            <p className="text-xs text-muted-foreground">
              {[block.fileSize, block.description].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
          download
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <Download className="size-4" /> Download PDF
        </a>
      </div>
    </div>
  )
}

function FigmaBlockView({ block }: { block: Extract<ProjectBlock, { type: "figma" }> }) {
  if (!block.embedUrl) return null
  const encodedUrl = encodeURIComponent(block.embedUrl)
  const iframeSrc = `https://www.figma.com/embed?embed_host=share&url=${encodedUrl}`

  return (
    <div className={getWidthClass(block.width)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-secondary/30 shadow-sm">
        <iframe
          src={iframeSrc}
          title={block.prototypeTitle || "Figma Prototype"}
          className="h-full w-full border-0"
          allowFullScreen={block.allowFullscreen ?? true}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{block.prototypeTitle || "Interactive Figma Prototype"}</span>
        <a
          href={block.embedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline"
        >
          Open in Figma <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  )
}

function CustomHtmlBlockView({ block }: { block: Extract<ProjectBlock, { type: "custom-html" }> }) {
  if (!block.code) return null
  return (
    <div className={getWidthClass(block.width)}>
      <div
        className="overflow-hidden rounded-xl"
        dangerouslySetInnerHTML={{ __html: block.code }}
      />
      {block.caption && (
        <p className="mt-2 text-center text-xs text-muted-foreground">{block.caption}</p>
      )}
    </div>
  )
}
