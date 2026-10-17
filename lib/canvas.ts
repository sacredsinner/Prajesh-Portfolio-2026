import { newId, type ImageAspect, type MoodboardSection } from "@/lib/moodboards"

// The infinite-canvas moodboard. Shared by the studio editor (components/moodboards/canvas)
// and the client page. Positions are in canvas units (1 unit = 1 CSS px at 100% zoom).

export type CanvasItemBase = { id: string; x: number; y: number; w: number; h: number; z: number; locked?: boolean; group?: string; rotation?: number }

export type CanvasItem = CanvasItemBase &
  (
    | { type: "image"; url: string; caption?: string; focal?: { x: number; y: number }; aspect?: ImageAspect; tags?: string[]; palette?: string[] }
    | { type: "note"; text: string; size?: "s" | "m" | "l" }
    | { type: "sticky"; text: string; colour: StickyColour }
    | { type: "colour"; hex: string; name?: string; note?: string }
    | { type: "palette"; name?: string; colours: string[] }
    | { type: "font"; family: string; sample?: string; note?: string }
    | { type: "link"; url: string; title?: string; note?: string }
    | { type: "embed"; url: string; provider: EmbedProvider; title?: string }
    | { type: "frame"; title: string; tone?: "light" | "dark" }
    | { type: "shape"; shape: "rect" | "ellipse"; fill?: string; label?: string }
  )

export type CanvasItemType = CanvasItem["type"]
export type StickyColour = "sand" | "sage" | "sky" | "rose" | "ink"
export type EmbedProvider = "figma" | "pinterest" | "behance" | "canva" | "youtube" | "vimeo" | "other"

export type Connector = { id: string; from: string; to: string; label?: string }

export type Canvas = { items: CanvasItem[]; connectors: Connector[]; background?: "grid" | "dots" | "plain" }

export const STICKY_COLOURS: Record<StickyColour, { bg: string; text: string; label: string }> = {
  sand: { bg: "#F1E7CF", text: "#1B1A16", label: "Sand" },
  sage: { bg: "#DCE5D6", text: "#1B1A16", label: "Sage" },
  sky: { bg: "#D9E4EC", text: "#1B1A16", label: "Sky" },
  rose: { bg: "#EFD9D6", text: "#1B1A16", label: "Rose" },
  ink: { bg: "#1B1A16", text: "#F5F5F3", label: "Ink" },
}

export const ITEM_NAMES: Record<CanvasItemType, string> = { image: "Image", note: "Note", sticky: "Sticky note", colour: "Colour", palette: "Palette", font: "Typeface", link: "Link", embed: "Embed", frame: "Frame", shape: "Shape" }

export const GRID = 8
export const MIN_SIZE = 40

export const emptyCanvas = (): Canvas => ({ items: [], connectors: [], background: "dots" })

export const snap = (value: number, grid = GRID) => Math.round(value / grid) * grid

export type Rect = { x: number; y: number; w: number; h: number }

export function boundsOf(items: Pick<CanvasItem, "x" | "y" | "w" | "h">[]): Rect {
  if (!items.length) return { x: 0, y: 0, w: 0, h: 0 }
  const x1 = Math.min(...items.map((i) => i.x)), y1 = Math.min(...items.map((i) => i.y))
  const x2 = Math.max(...items.map((i) => i.x + i.w)), y2 = Math.max(...items.map((i) => i.y + i.h))
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

export const intersects = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
export const contains = (outer: Rect, inner: Rect) => inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.w <= outer.x + outer.w && inner.y + inner.h <= outer.y + outer.h

// Items inside a frame move with it (the frame "owns" everything its box contains).
export function frameChildren(items: CanvasItem[], frame: CanvasItem) {
  return items.filter((item) => item.id !== frame.id && item.type !== "frame" && contains(frame, item))
}

// Default sizes for new items.
export const DEFAULT_SIZE: Record<CanvasItemType, { w: number; h: number }> = {
  image: { w: 320, h: 240 },
  note: { w: 280, h: 160 },
  sticky: { w: 200, h: 200 },
  colour: { w: 160, h: 200 },
  palette: { w: 360, h: 140 },
  font: { w: 320, h: 180 },
  link: { w: 280, h: 140 },
  embed: { w: 480, h: 360 },
  frame: { w: 720, h: 480 },
  shape: { w: 200, h: 200 },
}

export function makeItem(type: CanvasItemType, at: { x: number; y: number }, z: number): CanvasItem {
  const base = { id: newId(), x: snap(at.x), y: snap(at.y), ...DEFAULT_SIZE[type], z }
  switch (type) {
    case "image": return { ...base, type, url: "" }
    case "note": return { ...base, type, text: "" }
    case "sticky": return { ...base, type, text: "", colour: "sand" }
    case "colour": return { ...base, type, hex: "#1B1A16" }
    case "palette": return { ...base, type, colours: ["#1B1A16", "#45443D", "#8B897F", "#D9D7CD", "#F5F5F3"] }
    case "font": return { ...base, type, family: "Instrument Serif", sample: "Designed with intention." }
    case "link": return { ...base, type, url: "" }
    case "embed": return { ...base, type, url: "", provider: "other" }
    case "frame": return { ...base, type, title: "Frame", z: -1 }
    case "shape": return { ...base, type, shape: "rect" }
  }
}

// Turns a pasted link into an embeddable iframe URL, when the service allows it.
export function parseEmbed(input: string): { provider: EmbedProvider; src: string | null; title: string } {
  const url = input.trim()
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")
    if (host.endsWith("figma.com")) return { provider: "figma", src: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`, title: "Figma" }
    if (host.endsWith("pinterest.com") || host === "pin.it") {
      const pin = u.pathname.match(/\/pin\/(\d+)/)?.[1]
      return { provider: "pinterest", src: pin ? `https://assets.pinterest.com/ext/embed.html?id=${pin}` : null, title: "Pinterest" }
    }
    if (host.endsWith("behance.net")) {
      const id = u.pathname.match(/\/(?:gallery|embed\/project)\/(\d+)/)?.[1]
      return { provider: "behance", src: id ? `https://www.behance.net/embed/project/${id}?ilo0=1` : null, title: "Behance" }
    }
    if (host.endsWith("canva.com")) {
      const id = u.pathname.match(/\/design\/([^/]+)/)?.[1]
      return { provider: "canva", src: id ? `https://www.canva.com/design/${id}/view?embed` : null, title: "Canva" }
    }
    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      const id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") || u.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]
      return { provider: "youtube", src: id ? `https://www.youtube-nocookie.com/embed/${id}` : null, title: "YouTube" }
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.match(/(\d{6,})/)?.[1]
      return { provider: "vimeo", src: id ? `https://player.vimeo.com/video/${id}` : null, title: "Vimeo" }
    }
    return { provider: "other", src: null, title: host }
  } catch {
    return { provider: "other", src: null, title: "" }
  }
}

// Lays items out in a masonry-style grid inside a region (used by Auto layout and the
// conversion of old section boards). Keeps each item's size.
export function autoLayout(items: CanvasItem[], origin: { x: number; y: number }, width = 1200, gap = 24): CanvasItem[] {
  const columns = Math.max(1, Math.floor((width + gap) / (320 + gap)))
  const colWidth = (width - gap * (columns - 1)) / columns
  const heights = new Array(columns).fill(0)
  return items.map((item) => {
    const span = Math.min(columns, Math.max(1, Math.round((item.w + gap) / (colWidth + gap))))
    let best = 0
    let bestTop = Infinity
    for (let c = 0; c + span <= columns; c++) {
      const top = Math.max(...heights.slice(c, c + span))
      if (top < bestTop) {
        bestTop = top
        best = c
      }
    }
    const w = span * colWidth + (span - 1) * gap
    const h = Math.round(item.h * (w / item.w))
    const placed = { ...item, x: snap(origin.x + best * (colWidth + gap)), y: snap(origin.y + bestTop), w: snap(w), h: snap(h) }
    for (let c = best; c < best + span; c++) heights[c] = bestTop + h + gap
    return placed
  })
}

// Old boards (sections of items) become frames side by side, one per section.
export function sectionsToCanvas(sections: MoodboardSection[]): Canvas {
  const items: CanvasItem[] = []
  let x = 0
  let z = 1
  for (const section of sections) {
    const pad = 32
    const inner: CanvasItem[] = section.items.map((item) => {
      const base = { id: item.id, x: 0, y: 0, z: z++ }
      switch (item.type) {
        case "image": return { ...base, type: "image", url: item.url, caption: item.caption, focal: item.focal, aspect: item.aspect, tags: item.tags, palette: item.palette, w: item.wide ? 664 : 320, h: item.aspect === "1:1" ? 320 : item.aspect === "4:5" ? 400 : item.aspect === "16:9" ? 180 : 240 }
        case "colour": return { ...base, type: "colour", hex: item.hex, name: item.name, note: item.note, ...DEFAULT_SIZE.colour }
        case "palette": return { ...base, type: "palette", name: item.name, colours: item.colours, ...DEFAULT_SIZE.palette }
        case "type": return { ...base, type: "font", family: item.family, sample: item.sample, note: item.note, ...DEFAULT_SIZE.font }
        case "note": return { ...base, type: "note", text: item.text, ...DEFAULT_SIZE.note }
        case "link": return { ...base, type: "link", url: item.url, title: item.title, note: item.note, ...DEFAULT_SIZE.link }
      }
    })
    const width = 1000
    const laid = autoLayout(inner, { x: x + pad, y: pad + 48 }, width - pad * 2)
    const b = laid.length ? boundsOf(laid) : { x: x + pad, y: pad + 48, w: width - pad * 2, h: 200 }
    const frame: CanvasItem = { id: section.id, type: "frame", title: section.title, x, y: 0, w: width, h: snap(b.y + b.h + pad), z: 0 }
    items.push(frame, ...laid)
    x += width + 80
  }
  return { items, connectors: [], background: "dots" }
}

export function describeItem(item: CanvasItem) {
  switch (item.type) {
    case "image": return item.caption || "Image"
    case "note": return item.text.slice(0, 40) || "Note"
    case "sticky": return item.text.slice(0, 40) || "Sticky note"
    case "colour": return item.name || item.hex
    case "palette": return item.name || "Palette"
    case "font": return item.family
    case "link": return item.title || item.url || "Link"
    case "embed": return item.title || item.provider
    case "frame": return item.title || "Frame"
    case "shape": return item.label || (item.shape === "rect" ? "Rectangle" : "Ellipse")
  }
}
