// Moodboards: curated boards of sections (Mood, Colour, Type, References…) shared with a
// client through a private link. Shared by the admin editor, the public page and the server.

// Image extras: focal point (0–1, where the crop centres), aspect ratio for the tile, tags
// and a palette pulled from the image. A "palette" item is a saved set of swatches.
export type ImageAspect = "auto" | "1:1" | "4:5" | "3:2" | "16:9"
export const IMAGE_ASPECTS: { value: ImageAspect; label: string }[] = [
  { value: "auto", label: "Original" },
  { value: "1:1", label: "Square" },
  { value: "4:5", label: "Portrait 4:5" },
  { value: "3:2", label: "Landscape 3:2" },
  { value: "16:9", label: "Wide 16:9" },
]
export const aspectStyle = (aspect?: ImageAspect) => (aspect && aspect !== "auto" ? { aspectRatio: aspect.replace(":", " / ") } : undefined)

export type MoodboardItem =
  | { id: string; type: "image"; url: string; caption?: string; wide?: boolean; focal?: { x: number; y: number }; aspect?: ImageAspect; tags?: string[]; palette?: string[] }
  | { id: string; type: "colour"; hex: string; name?: string; note?: string }
  | { id: string; type: "palette"; name?: string; colours: string[]; sourceUrl?: string }
  | { id: string; type: "type"; family: string; sample?: string; note?: string }
  | { id: string; type: "note"; text: string }
  | { id: string; type: "link"; url: string; title?: string; note?: string }

export type MoodboardItemType = MoodboardItem["type"]

export type MoodboardSection = { id: string; title: string; note?: string; items: MoodboardItem[] }

export type MoodboardStatus = "draft" | "shared" | "changes" | "approved"

export const MOODBOARD_STATUS_LABELS: Record<MoodboardStatus, string> = {
  draft: "Draft",
  shared: "Shared",
  changes: "Changes requested",
  approved: "Approved",
}

export const ITEM_LABELS: Record<MoodboardItemType, string> = { image: "Image", colour: "Colour", palette: "Palette", type: "Typeface", note: "Note", link: "Link" }

export const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

export const defaultSections = (): MoodboardSection[] =>
  ["Mood", "Colour", "Type", "References"].map((title) => ({ id: newId(), title, items: [] }))

// #1b1a16 → readable text colour on top of it.
export function textOn(hex: string) {
  const value = hex.replace("#", "")
  if (!/^[0-9a-f]{6}$/i.test(value)) return "#1b1a16"
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.55 ? "#1b1a16" : "#f5f5f3"
}

// Palette exports for the client page and the studio.
export function hexToRgb(hex: string) {
  const v = hex.replace("#", "")
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)) as [number, number, number]
}
export function paletteExports(colours: string[], name = "palette") {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "palette"
  return {
    hex: colours.map((c) => c.toUpperCase()).join(", "),
    rgb: colours.map((c) => `rgb(${hexToRgb(c).join(", ")})`).join(", "),
    css: `:root {\n${colours.map((c, i) => `  --${slug}-${i + 1}: ${c.toUpperCase()};`).join("\n")}\n}`,
    tailwind: `${slug}: {\n${colours.map((c, i) => `  ${(i + 1) * 100}: "${c.toUpperCase()}",`).join("\n")}\n}`,
  }
}
