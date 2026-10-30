import { boundsOf, contains, type Canvas, type CanvasItem, type Rect } from "@/lib/canvas"

export type Slide = {
  id: string
  title: string
  subtitle?: string
  bounds: Rect
  itemIds: string[]
  isOverview?: boolean
  notes?: string
}

export type EmojiReaction = "❤️" | "🔥" | "🤔" | "💡"

export const AVAILABLE_REACTIONS: { emoji: EmojiReaction; label: string; meaning: string }[] = [
  { emoji: "❤️", label: "Love it", meaning: "Direction feels right" },
  { emoji: "🔥", label: "Bold & confident", meaning: "Strong visual impact" },
  { emoji: "💡", label: "Great idea", meaning: "Smart creative approach" },
  { emoji: "🤔", label: "Needs adjustment", meaning: "Explore alternatives" },
]

// Extract slides from the canvas frames or clusters so clients get a guided walkthrough.
export function buildSlides(canvas: Canvas, boardTitle?: string, intro?: string | null): Slide[] {
  const slides: Slide[] = []
  const allBounds = boundsOf(canvas.items)

  // 1. Check for explicit frames
  const frames = canvas.items.filter((item): item is CanvasItem & { type: "frame" } => item.type === "frame")

  if (frames.length > 0) {
    // Sort frames naturally (e.g. "01", "02" or top-to-bottom, left-to-right)
    const sorted = [...frames].sort((a, b) => {
      const numA = parseInt(a.title.match(/^\d+/)?.[0] ?? "", 10)
      const numB = parseInt(b.title.match(/^\d+/)?.[0] ?? "", 10)
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB
      const dy = a.y - b.y
      if (Math.abs(dy) > 120) return dy
      return a.x - b.x
    })

    // Add an initial Overview slide if there are multiple frames
    if (sorted.length > 1 && allBounds.w > 0) {
      slides.push({
        id: "slide-overview",
        title: boardTitle ? `${boardTitle} · Overview` : "Full Direction Overview",
        subtitle: intro ? intro.slice(0, 140) + (intro.length > 140 ? "…" : "") : "Explore the big picture before diving in.",
        bounds: allBounds,
        itemIds: canvas.items.map((i) => i.id),
        isOverview: true,
        notes: intro ?? undefined,
      })
    }

    // Add each frame as a slide
    for (const frame of sorted) {
      const children = canvas.items.filter((i) => i.id !== frame.id && i.type !== "frame" && contains(frame, i))
      const notes = children
        .filter((c) => c.type === "note" || c.type === "sticky")
        .map((c) => ("text" in c ? c.text : ""))
        .filter(Boolean)
        .join("\n\n")

      slides.push({
        id: frame.id,
        title: frame.title || "Direction Frame",
        bounds: { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
        itemIds: [frame.id, ...children.map((c) => c.id)],
        notes: notes || undefined,
      })
    }
  } else if (canvas.items.length > 0) {
    // No frames: create intelligent thematic slides
    slides.push({
      id: "slide-all",
      title: boardTitle || "Creative Moodboard",
      subtitle: intro ? intro.slice(0, 140) + (intro.length > 140 ? "…" : "") : "Visual concepts and design language",
      bounds: allBounds,
      itemIds: canvas.items.map((i) => i.id),
      isOverview: true,
      notes: intro ?? undefined,
    })

    // Group 1: Imagery
    const images = canvas.items.filter((i) => i.type === "image")
    if (images.length > 0) {
      slides.push({
        id: "slide-images",
        title: "Visual Imagery & Mood",
        subtitle: `${images.length} visual reference${images.length === 1 ? "" : "s"} establishing tone and energy`,
        bounds: boundsOf(images),
        itemIds: images.map((i) => i.id),
      })
    }

    // Group 2: Color & Typography
    const styles = canvas.items.filter((i) => i.type === "colour" || i.type === "palette" || i.type === "font")
    if (styles.length > 0) {
      slides.push({
        id: "slide-styles",
        title: "Colour Harmony & Typography",
        subtitle: "Typefaces and curated palette tokens",
        bounds: boundsOf(styles),
        itemIds: styles.map((i) => i.id),
      })
    }

    // Group 3: Notes & Key Takeaways
    const notes = canvas.items.filter((i) => i.type === "note" || i.type === "sticky" || i.type === "link" || i.type === "embed")
    if (notes.length > 0) {
      slides.push({
        id: "slide-notes",
        title: "Creative Rationale & Notes",
        subtitle: "Intentions, external references, and annotations",
        bounds: boundsOf(notes),
        itemIds: notes.map((i) => i.id),
      })
    }
  }

  return slides
}

// Parse emoji counts from comments
export function parseReactions(comments: { body: string; itemId?: string | null }[]) {
  const counts: Record<string, Record<EmojiReaction, number>> = {}

  for (const c of comments) {
    const target = c.itemId || "_board"
    if (!counts[target]) {
      counts[target] = { "❤️": 0, "🔥": 0, "💡": 0, "🤔": 0 }
    }
    for (const { emoji } of AVAILABLE_REACTIONS) {
      if (c.body.includes(emoji)) {
        counts[target][emoji] = (counts[target][emoji] || 0) + 1
      }
    }
  }

  return counts
}
