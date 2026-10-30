export type StylePreset =
  | "Minimal"
  | "Luxury"
  | "Editorial"
  | "Organic"
  | "Futuristic"
  | "Brutalist"
  | "Contemporary"

export type PhotographyStyle =
  | "Macro Studio"
  | "Environmental Editorial"
  | "Cinematic 35mm"
  | "Architectural Minimal"
  | "Dramatic Chiaroscuro"

export type MoodAtmosphere =
  | "Warm & Artisanal"
  | "Obsidian Noir"
  | "High-Key Studio"
  | "Ethereal & Muted"
  | "Vibrant & Bold"

export type LayoutMode = "freeform" | "grid" | "masonry" | "editorial"

export type CanvasBackground =
  | "obsidian-dots"
  | "charcoal-grid"
  | "studio-paper"
  | "plain-dark"

export interface VisualDirection {
  id: string
  title: string
  description: string
  palette: string[]
  keywords: string[]
  seedPrompts: string[]
}

export type AspectRatio = "16:9" | "1:1" | "4:5" | "3:2"

export interface DesignerItemBase {
  id: string
  x: number
  y: number
  w: number
  h: number
  z: number
  rotation?: number
  locked?: boolean
}

export type DesignerCanvasItem = DesignerItemBase &
  (
    | {
        type: "image"
        url: string
        caption?: string
        aspectRatio?: AspectRatio
        prompt?: string
        focal?: { x: number; y: number }
        palette?: string[]
      }
    | {
        type: "color"
        hex: string
        name?: string
        note?: string
      }
    | {
        type: "palette"
        name?: string
        colors: string[]
      }
    | {
        type: "typography"
        family: string
        sample: string
        heading: string
        category?: "Serif" | "Sans" | "Display" | "Mono"
      }
    | {
        type: "note"
        text: string
        tone?: "sand" | "sage" | "ink" | "gold"
      }
    | {
        type: "frame"
        title: string
        tone?: "light" | "dark"
      }
  )

export interface VisualSettings {
  mood: MoodAtmosphere
  photoStyle: PhotographyStyle
  saturation: number // 0 - 100
  contrast: number // 0 - 100
  warmth: number // 0 - 100
  filmGrain: boolean
}

export interface ReferenceItem {
  id: string
  url: string
  name: string
  extractedPalette?: string[]
  aspectRatio?: AspectRatio
}

export interface DesignerProject {
  id: string
  name: string
  brief: string
  stylePreset: StylePreset
  selectedDirectionId?: string
  directions: VisualDirection[]
  items: DesignerCanvasItem[]
  visualSettings: VisualSettings
  layoutMode: LayoutMode
  canvasBackground: CanvasBackground
  references: ReferenceItem[]
  createdAt: string
  updatedAt: string
}
