// Moodboards: curated boards of sections (Mood, Colour, Type, References…) shared with a
// client through a private link. Shared by the admin editor, the public page and the server.

export type MoodboardItem =
  | { id: string; type: "image"; url: string; caption?: string; wide?: boolean }
  | { id: string; type: "colour"; hex: string; name?: string; note?: string }
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

export const ITEM_LABELS: Record<MoodboardItemType, string> = { image: "Image", colour: "Colour", type: "Typeface", note: "Note", link: "Link" }

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
