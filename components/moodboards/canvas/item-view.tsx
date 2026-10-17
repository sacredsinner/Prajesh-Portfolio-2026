"use client"

import { memo } from "react"
import { STICKY_COLOURS, parseEmbed, type CanvasItem } from "@/lib/canvas"
import { aspectStyle, paletteExports, textOn } from "@/lib/moodboards"

// How each canvas item looks. Pure: the same component draws the editor and the client
// page. `interactive` turns on links and iframes (off while dragging in the editor).

// `embedLive` lets the iframe take the pointer (the item is selected, or the viewer tapped it).
export const ItemView = memo(function ItemView({ item, interactive, embedLive, onEditText }: { item: CanvasItem; interactive: boolean; embedLive?: boolean; onEditText?: (text: string) => void }) {
  switch (item.type) {
    case "image": {
      const focal = item.focal ?? { x: 0.5, y: 0.5 }
      return (
        <figure className="h-full w-full overflow-hidden rounded-xl border border-border bg-white">
          {item.url ? <img src={item.url} alt={item.caption || ""} draggable={false} className="h-full w-full select-none object-cover" style={{ objectPosition: `${focal.x * 100}% ${focal.y * 100}%`, ...aspectStyle(item.aspect) }} /> : <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Add an image</div>}
          {item.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-xs text-white">{item.caption}</figcaption>}
          {item.palette && item.palette.length > 0 && <div className="absolute left-2 top-2 flex gap-0.5 rounded-full bg-white/80 p-1">{item.palette.map((hex) => <span key={hex} className="h-3 w-3 rounded-full" style={{ background: hex }} />)}</div>}
        </figure>
      )
    }
    case "note": {
      const size = item.size === "l" ? "text-2xl" : item.size === "s" ? "text-sm" : "text-base"
      return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-white p-5">
          {onEditText ? (
            <textarea value={item.text} onChange={(e) => onEditText(e.target.value)} placeholder="Write a note…" className={`h-full w-full resize-none bg-transparent font-serif leading-snug outline-none ${size}`} />
          ) : (
            <p className={`whitespace-pre-wrap font-serif leading-snug ${size}`}>{item.text || <span className="text-muted-foreground">Empty note</span>}</p>
          )}
        </div>
      )
    }
    case "sticky": {
      const c = STICKY_COLOURS[item.colour]
      return (
        <div className="h-full w-full overflow-hidden rounded-sm p-4 shadow-[0_8px_24px_rgba(27,26,22,0.12)]" style={{ background: c.bg, color: c.text, transform: "rotate(-0.6deg)" }}>
          {onEditText ? (
            <textarea value={item.text} onChange={(e) => onEditText(e.target.value)} placeholder="Sticky note" className="h-full w-full resize-none bg-transparent text-base leading-snug outline-none placeholder:text-current/50" />
          ) : (
            <p className="whitespace-pre-wrap text-base leading-snug">{item.text}</p>
          )}
        </div>
      )
    }
    case "colour":
      return (
        <div className="flex h-full w-full flex-col justify-end rounded-xl border border-border p-4" style={{ background: item.hex, color: textOn(item.hex) }}>
          <p className="text-sm font-semibold">{item.name || item.hex.toUpperCase()}</p>
          <p className="text-xs opacity-80">{item.hex.toUpperCase()}{item.note ? ` · ${item.note}` : ""}</p>
        </div>
      )
    case "palette":
      return (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex min-h-0 flex-1">{item.colours.map((hex, i) => <div key={`${hex}-${i}`} className="flex-1" style={{ background: hex }} title={hex} />)}</div>
          <div className="px-3 py-2"><p className="truncate text-xs font-semibold">{item.name || "Palette"}</p><p className="truncate text-[10px] text-muted-foreground">{paletteExports(item.colours).hex}</p></div>
        </div>
      )
    case "font":
      return (
        <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-white p-5">
          <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(item.family).replace(/%20/g, "+")}:ital,wght@0,400;0,600;1,400&display=swap`} />
          <p className="text-3xl leading-tight" style={{ fontFamily: `'${item.family}', serif` }}>{item.sample || "Aa Bb Cc 0123"}</p>
          <div><p className="text-sm font-semibold">{item.family}</p>{item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}</div>
        </div>
      )
    case "link": {
      const host = item.url ? item.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] : ""
      const body = (
        <>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{host || "Link"} ↗</p>
          <p className="mt-2 line-clamp-2 font-serif text-lg leading-tight">{item.title || item.url || "Add a link"}</p>
          {item.note && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.note}</p>}
        </>
      )
      return interactive && item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full w-full overflow-hidden rounded-xl border border-border bg-white p-5 hover:bg-secondary/40">{body}</a>
      ) : (
        <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-white p-5">{body}</div>
      )
    }
    case "embed": {
      const { src, title } = parseEmbed(item.url)
      return (
        <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-white">
          {src && interactive ? (
            <>
              <iframe src={src} title={item.title || title} className={`h-full w-full ${embedLive ? "" : "pointer-events-none"}`} allow="autoplay; fullscreen; clipboard-write" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" loading="lazy" />
              {!embedLive && <span className="absolute bottom-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground">Select to interact</span>}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{title || "Embed"}</p>
              <p className="line-clamp-2 text-sm">{item.title || (item.url ? item.url.replace(/^https?:\/\//, "") : "Paste a Figma, Pinterest, Behance, Canva, YouTube or Vimeo link")}</p>
              {item.url && !src && <p className="text-xs text-muted-foreground">This link can't be embedded; it opens in a new tab.</p>}
            </div>
          )}
        </div>
      )
    }
    case "frame":
      return (
        <div className={`h-full w-full rounded-2xl border ${item.tone === "dark" ? "border-foreground bg-foreground/[0.04]" : "border-border bg-white/40"}`}>
          <p className="absolute -top-6 left-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{item.title}</p>
        </div>
      )
    case "shape":
      return (
        <div className={`flex h-full w-full items-center justify-center border border-foreground/60 ${item.shape === "ellipse" ? "rounded-full" : "rounded-xl"}`} style={{ background: item.fill ?? "transparent", color: item.fill ? textOn(item.fill) : undefined }}>
          {item.label && <p className="px-3 text-center text-sm">{item.label}</p>}
        </div>
      )
  }
})
