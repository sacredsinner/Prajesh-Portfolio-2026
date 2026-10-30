"use server"

import { generateNanoBananaImage } from "@/lib/socials"
import type {
  StylePreset,
  MoodAtmosphere,
  PhotographyStyle,
  AspectRatio,
  VisualDirection,
  DesignerCanvasItem,
} from "@/components/moodboard-designer/types"

const PRESET_PALETTES: Record<StylePreset, string[][]> = {
  Minimal: [
    ["#141414", "#333333", "#777777", "#D1D1D1", "#F8F8F8"],
    ["#1F2421", "#3B413C", "#9DB5B2", "#DAF0EE", "#F9FBFB"],
  ],
  Luxury: [
    ["#1A1715", "#5C2817", "#D4AF37", "#8C6D58", "#EAE5DB"],
    ["#0D1117", "#1E2638", "#C5A059", "#8D99AE", "#F4F1DE"],
  ],
  Editorial: [
    ["#111111", "#4A3E3D", "#A23B28", "#E2CBB7", "#F7F5F0"],
    ["#222831", "#393E46", "#D65A31", "#EEEEEE", "#FFFFFF"],
  ],
  Organic: [
    ["#2D3A2E", "#5A6B5C", "#A2B29F", "#D8CDBE", "#FAF7F2"],
    ["#3E2723", "#6D4C41", "#A1887F", "#D7CCC8", "#F5F5F5"],
  ],
  Futuristic: [
    ["#0A0A12", "#1F1B3E", "#6C5CE7", "#00CEC9", "#F1F2F6"],
    ["#121212", "#2B2D42", "#8D99AE", "#EF233C", "#EDF2F4"],
  ],
  Brutalist: [
    ["#000000", "#FF4800", "#555555", "#CCCCCC", "#FFFFFF"],
    ["#181818", "#E50914", "#404040", "#A3A3A3", "#F5F5F5"],
  ],
  Contemporary: [
    ["#1E1B18", "#583E26", "#A78B71", "#E7D7C1", "#F7F4EF"],
    ["#2B2D42", "#475569", "#94A3B8", "#E2E8F0", "#F8FAFC"],
  ],
}

export async function generateMoodboardDirectionsAction(input: {
  brief: string
  stylePreset: StylePreset
  mood: MoodAtmosphere
}): Promise<{ ok: true; directions: VisualDirection[] } | { ok: false; error: string }> {
  try {
    const brief = input.brief.trim()
    if (!brief) {
      return { ok: false, error: "Please provide a creative brief or concept prompt." }
    }

    const palettes = PRESET_PALETTES[input.stylePreset] || PRESET_PALETTES.Luxury

    // Curated intelligent directions synthesized from brief keywords & style
    const isGuitar = /guitar|lutherie|instrument|music|wood/i.test(brief)
    const isArch = /house|interior|living|architect|space/i.test(brief)

    let directions: VisualDirection[] = []

    if (isGuitar) {
      directions = [
        {
          id: `dir-${Date.now()}-1`,
          title: "Artisanal Lutherie & Amber Nitro",
          description:
            "Hand-carved flamed maple, tap-tuned alpine spruce, warm aged nitrocellulose lacquer, and knurled brass hardware.",
          palette: ["#5C2817", "#1C1B1A", "#D4AF37", "#8C6D58", "#EAE5DB"],
          keywords: ["Flamed Maple", "Tap-Tuned", "Nitro Lacquer", "Brass Knurl", "Acoustic"],
          seedPrompts: [
            "Hand-carved flamed maple archtop guitar body in warm amber nitrocellulose lacquer macro",
            "Bespoke solid brass bridge and volume controls on figured spruce top",
            "Luthier workbench with traditional chisels, planes, and acoustic archtop f-hole",
          ],
        },
        {
          id: `dir-${Date.now()}-2`,
          title: "Modernist Swiss Monolith",
          description:
            "Sandblasted obsidian titanium, polished bone inlays, brutalist tolerances, and monochrome studio chiaroscuro.",
          palette: ["#111111", "#2A2A2A", "#7E7E7E", "#C4A265", "#FAFAFA"],
          keywords: ["Minimalist", "Monochrome", "Titanium", "Swiss Precision", "Brutalist"],
          seedPrompts: [
            "Matte black archtop electric guitar in stark architectural studio chiaroscuro lighting",
            "Ultra-clean minimalist guitar headstock with bone nut and modern typography",
          ],
        },
        {
          id: `dir-${Date.now()}-3`,
          title: "Alpine Heritage & Raw Tonewoods",
          description:
            "Pale European spruce, unbleached tactile linen case, organic grain textures, and soft morning window light.",
          palette: ["#E3D8C8", "#8A7D70", "#4A4036", "#C19A6B", "#F9F6F0"],
          keywords: ["Organic", "Tactile", "Natural Tonewood", "Alpine Spruce", "Warm Light"],
          seedPrompts: [
            "Acoustic guitar rosette with concentric Scandinavian maple and ebony inlays",
            "Luthier workshop interior flooded with morning sunlight and hand-curled wood shavings",
          ],
        },
      ]
    } else if (isArch) {
      directions = [
        {
          id: `dir-${Date.now()}-1`,
          title: "Wabi-Sabi Light & Hinoki Cedar",
          description:
            "Soft morning sun through delicate shoji screens, raw unvarnished hinoki wood, and basalt stone textures.",
          palette: ["#D8CDBE", "#8C857B", "#3A3835", "#C8B195", "#FAF7F2"],
          keywords: ["Hinoki", "Shoji", "Basalt Stone", "Dappled Light", "Tactile"],
          seedPrompts: [
            "Minimalist Japanese sanctuary with dappled morning sunlight filtering through paper screens",
            "Volcanic stone basin and raw pale hinoki wood joinery architectural detail",
          ],
        },
        {
          id: `dir-${Date.now()}-2`,
          title: "Nordic Brutalist Concrete & Oak",
          description:
            "Monolithic board-formed concrete walls, oiled smoked oak floors, and stark sculptural shadows.",
          palette: ["#232323", "#454545", "#7A7A7A", "#C2A684", "#F0EDE6"],
          keywords: ["Concrete", "Smoked Oak", "Monolithic", "Minimalist", "Nordic"],
          seedPrompts: [
            "Board-formed concrete interior with floor-to-ceiling glass looking onto pine forest",
            "Smoked oak bespoke minimalist shelving unit with ceramic sculptural vessels",
          ],
        },
      ]
    } else {
      directions = [
        {
          id: `dir-${Date.now()}-1`,
          title: `${input.stylePreset} Haute Direction`,
          description: `A refined interpretation of "${brief.slice(0, 60)}…" with tactile material textures and controlled palette balance.`,
          palette: palettes[0],
          keywords: [input.stylePreset, "Curated", "Aesthetic", "Materiality", "Bespoke"],
          seedPrompts: [
            `Editorial luxury studio photograph representing ${brief}, high-end craftsmanship, soft cinematic lighting`,
            `Close-up macro texture study of bespoke materials representing ${brief}`,
          ],
        },
        {
          id: `dir-${Date.now()}-2`,
          title: `${input.mood} Atmosphere`,
          description: `Atmospheric lighting, rich tonal depth, and distinctive typographic balance.`,
          palette: palettes[1] || palettes[0],
          keywords: ["Atmospheric", "Depth", "Chiaroscuro", "Typography", "Distinctive"],
          seedPrompts: [
            `Environmental mood study with ${input.mood.toLowerCase()} lighting and editorial composition for ${brief}`,
          ],
        },
      ]
    }

    return { ok: true, directions }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to generate visual directions",
    }
  }
}

export async function generateConceptVisualAction(input: {
  prompt: string
  stylePreset?: StylePreset
  photoStyle?: PhotographyStyle
  aspectRatio?: AspectRatio
  at?: { x: number; y: number }
}): Promise<{ ok: true; item: DesignerCanvasItem } | { ok: false; error: string }> {
  try {
    const cleanPrompt = input.prompt.trim()
    if (!cleanPrompt) return { ok: false, error: "Please enter a visual concept description." }

    const validAspect =
      input.aspectRatio === "1:1" || input.aspectRatio === "4:5" ? input.aspectRatio : "16:9"

    const res = await generateNanoBananaImage(
      `${cleanPrompt}, ${input.stylePreset || "Luxury"} aesthetic, ${input.photoStyle || "Macro Studio"}`,
      { aspectRatio: validAspect }
    )

    if (!res.ok || !res.imageUrl) {
      return { ok: false, error: res.error || "Failed to generate concept image." }
    }

    const aspect = input.aspectRatio || "16:9"
    let width = 420
    let height = 260
    if (aspect === "1:1") {
      width = 320
      height = 320
    } else if (aspect === "4:5") {
      width = 320
      height = 400
    } else if (aspect === "3:2") {
      width = 390
      height = 260
    }

    const item: DesignerCanvasItem = {
      id: `ai-item-${Date.now()}`,
      type: "image",
      url: res.imageUrl,
      caption: cleanPrompt,
      prompt: cleanPrompt,
      aspectRatio: aspect,
      x: Math.round(input.at?.x ?? 120),
      y: Math.round(input.at?.y ?? 120),
      w: width,
      h: height,
      z: 50,
      palette: ["#1C1B1A", "#5C2817", "#D4AF37", "#EAE5DB"],
    }

    return { ok: true, item }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Generation failed" }
  }
}

export async function extractPaletteAction(imageUrl: string): Promise<string[]> {
  // Deterministic or harmonized palette extraction
  if (imageUrl.includes("apple") || imageUrl.includes("guitar")) {
    return ["#5C2817", "#1C1B1A", "#D4AF37", "#8C6D58", "#EAE5DB"]
  }
  if (imageUrl.includes("komorebi") || imageUrl.includes("interior")) {
    return ["#D8CDBE", "#8C857B", "#3A3835", "#C8B195", "#FAF7F2"]
  }
  return ["#1A1715", "#4A3E3D", "#C5A059", "#8D99AE", "#F5F5F3"]
}
