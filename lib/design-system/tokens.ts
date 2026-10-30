/**
 * Prajesh Shakya Design System — Design Tokens (2026 Edition)
 * Pure minimal mono, editorial restraint, typographic precision, and purposeful motion.
 */

export interface ColorToken {
  name: string
  cssVar: string
  hex: string
  darkHex: string
  role: string
  contrastOnGround: string
  wcagGround: "AAA" | "AA" | "Fail"
  contrastOnInk: string
  wcagInk: "AAA" | "AA" | "Fail"
  description: string
}

export const COLOR_TOKENS: ColorToken[] = [
  {
    name: "Ground",
    cssVar: "--background",
    hex: "#F5F5F3",
    darkHex: "#1B1A16",
    role: "Page canvas, card backgrounds, and surface ground",
    contrastOnGround: "1.0:1",
    wcagGround: "Fail",
    contrastOnInk: "14.2:1",
    wcagInk: "AAA",
    description: "Warm tactile parchment paper ground. Gives the studio its distinctive editorial editorial feel without the harshness of pure digital white.",
  },
  {
    name: "Ink",
    cssVar: "--foreground",
    hex: "#1B1A16",
    darkHex: "#F5F5F3",
    role: "Primary text, brand mark, active borders, and emphasis",
    contrastOnGround: "14.2:1",
    wcagGround: "AAA",
    contrastOnInk: "1.0:1",
    wcagInk: "Fail",
    description: "Deep obsidian carbon ink with warm undertones. Used for all primary typography, active elements, and the PS monogram.",
  },
  {
    name: "Ink Soft",
    cssVar: "--accent",
    hex: "#45443D",
    darkHex: "#C7C5BA",
    role: "Secondary body paragraphs, subtitles, and subtle copy",
    contrastOnGround: "8.6:1",
    wcagGround: "AAA",
    contrastOnInk: "1.6:1",
    wcagInk: "Fail",
    description: "Soft charcoal ink for comfortable long-form reading, balancing high readability with gentle editorial contrast.",
  },
  {
    name: "Kicker",
    cssVar: "--muted-foreground",
    hex: "#6F6D63",
    darkHex: "#A3A196",
    role: "Section kickers, micro-labels, metadata, and timestamps",
    contrastOnGround: "4.8:1",
    wcagGround: "AA",
    contrastOnInk: "2.9:1",
    wcagInk: "Fail",
    description: "Editorial tracking labels and category kickers. Meets WCAG AA contrast against Ground for text at all sizes.",
  },
  {
    name: "Muted / Neutral",
    cssVar: "--secondary",
    hex: "#ECEBE5",
    darkHex: "#2C2B25",
    role: "Badge backgrounds, subtle chips, and inactive pills",
    contrastOnGround: "1.1:1",
    wcagGround: "Fail",
    contrastOnInk: "12.8:1",
    wcagInk: "AAA",
    description: "Tonal parchment tint used for pill chips, tags, and understated elevated panels.",
  },
  {
    name: "Hairline",
    cssVar: "--border",
    hex: "#D9D7CD",
    darkHex: "#3A3932",
    role: "1px structural dividers, card borders, and table rules",
    contrastOnGround: "1.4:1",
    wcagGround: "Fail",
    contrastOnInk: "10.1:1",
    wcagInk: "AAA",
    description: "Crisp 1px hairline border defining space with quiet restraint rather than heavy dropped shadows.",
  },
  {
    name: "Input Stroke",
    cssVar: "--input",
    hex: "#8B897F",
    darkHex: "#8B897F",
    role: "Form field outlines, underline borders, and UI borders",
    contrastOnGround: "3.2:1",
    wcagGround: "AA",
    contrastOnInk: "4.4:1",
    wcagInk: "AA",
    description: "Guaranteed 3:1+ contrast against Ground for form field visibility complying with WCAG 1.4.11.",
  },
  {
    name: "Destructive",
    cssVar: "--destructive",
    hex: "#B42318",
    darkHex: "#E05252",
    role: "Error feedback, destructive actions, and critical alerts",
    contrastOnGround: "5.1:1",
    wcagGround: "AA",
    contrastOnInk: "2.8:1",
    wcagInk: "Fail",
    description: "Deep crimson pigment calibrated specifically to pass WCAG AA contrast over parchment ground.",
  },
  {
    name: "Playground Accent",
    cssVar: "--playground-accent",
    hex: "#2447FF",
    darkHex: "#4E6BFF",
    role: "Interactive prototype highlight, accent link, and focus markers",
    contrastOnGround: "5.8:1",
    wcagGround: "AA",
    contrastOnInk: "2.4:1",
    wcagInk: "Fail",
    description: "Vibrant electric cobalt used sparingly for interactive highlights and prototype previews.",
  },
]

export interface TypographyToken {
  name: string
  family: "Instrument Serif" | "Instrument Sans" | "Geist Mono"
  fontClass: string
  sizePx: number
  sizeRem: string
  lineHeight: string
  letterSpacing: string
  weight: string
  usage: string
  sample: string
}

export const TYPOGRAPHY_SCALE: TypographyToken[] = [
  {
    name: "Display 2XL",
    family: "Instrument Serif",
    fontClass: "font-serif text-6xl md:text-8xl tracking-tight",
    sizePx: 96,
    sizeRem: "6rem",
    lineHeight: "0.95",
    letterSpacing: "-0.03em",
    weight: "400",
    usage: "Hero statements, homepage manifesto, project titles in Behance view",
    sample: "Intention & Truth",
  },
  {
    name: "Display XL",
    family: "Instrument Serif",
    fontClass: "font-serif text-5xl md:text-7xl tracking-tight",
    sizePx: 72,
    sizeRem: "4.5rem",
    lineHeight: "1.0",
    letterSpacing: "-0.025em",
    weight: "400",
    usage: "Case study hero headlines, editorial section openers",
    sample: "Distinctive Brands",
  },
  {
    name: "Display LG",
    family: "Instrument Serif",
    fontClass: "font-serif text-4xl md:text-5xl tracking-tight",
    sizePx: 48,
    sizeRem: "3rem",
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
    weight: "400",
    usage: "Section headers, featured project titles, testimonial headlines",
    sample: "Design with Intention",
  },
  {
    name: "Heading 1",
    family: "Instrument Serif",
    fontClass: "font-serif text-3xl md:text-4xl tracking-tight",
    sizePx: 36,
    sizeRem: "2.25rem",
    lineHeight: "1.2",
    letterSpacing: "-0.015em",
    weight: "400",
    usage: "Modal titles, article titles, service card headlines",
    sample: "Brand Identity Systems",
  },
  {
    name: "Heading 2",
    family: "Instrument Sans",
    fontClass: "font-sans text-2xl font-medium tracking-tight",
    sizePx: 24,
    sizeRem: "1.5rem",
    lineHeight: "1.3",
    letterSpacing: "-0.01em",
    weight: "500",
    usage: "Sub-headings, form section headers, admin panel cards",
    sample: "Creative Direction & Strategy",
  },
  {
    name: "Heading 3",
    family: "Instrument Sans",
    fontClass: "font-sans text-xl font-medium tracking-tight",
    sizePx: 20,
    sizeRem: "1.25rem",
    lineHeight: "1.4",
    letterSpacing: "normal",
    weight: "500",
    usage: "Card titles, accordion headers, dropdown group labels",
    sample: "Digital Experience Systems",
  },
  {
    name: "Body Large",
    family: "Instrument Sans",
    fontClass: "font-sans text-[19px] leading-relaxed",
    sizePx: 19,
    sizeRem: "1.1875rem",
    lineHeight: "1.65",
    letterSpacing: "normal",
    weight: "400",
    usage: "Lead paragraphs, about story intro, client proposals",
    sample: "I believe that great brands are built on truth. Every identity begins with deep understanding.",
  },
  {
    name: "Body Base",
    family: "Instrument Sans",
    fontClass: "font-sans text-base leading-relaxed",
    sizePx: 16,
    sizeRem: "1rem",
    lineHeight: "1.6",
    letterSpacing: "normal",
    weight: "400",
    usage: "Standard body copy, form labels, long articles",
    sample: "A complete visual identity system designed to create recognition, consistency, and trust across all platforms.",
  },
  {
    name: "Body Small",
    family: "Instrument Sans",
    fontClass: "font-sans text-sm leading-normal",
    sizePx: 14,
    sizeRem: "0.875rem",
    lineHeight: "1.5",
    letterSpacing: "normal",
    weight: "400",
    usage: "Secondary copy, table contents, input fields, captions",
    sample: "All deliverables include vector assets, design guides, and license rights.",
  },
  {
    name: "Kicker / Eyebrow",
    family: "Instrument Sans",
    fontClass: "font-sans text-xs uppercase tracking-[0.25em] font-medium text-muted-foreground",
    sizePx: 12,
    sizeRem: "0.75rem",
    lineHeight: "1.0",
    letterSpacing: "0.25em",
    weight: "500",
    usage: "Category kickers, status pills, micro metadata, breadcrumbs",
    sample: "CASE STUDY · 2026",
  },
  {
    name: "Monospace Spec",
    family: "Geist Mono",
    fontClass: "font-mono text-xs tracking-wide",
    sizePx: 12,
    sizeRem: "0.75rem",
    lineHeight: "1.5",
    letterSpacing: "0.05em",
    weight: "400",
    usage: "Code snippets, token values, invoice numbering, technical specs",
    sample: "INV-2026-084 · HEX #1B1A16",
  },
]

export const SPACING_SCALE = [
  { name: "1", px: 4, rem: "0.25rem", role: "Micro gap, inline icon offset" },
  { name: "2", px: 8, rem: "0.5rem", role: "Button inner padding, badge gap" },
  { name: "3", px: 12, rem: "0.75rem", role: "Card inner padding (compact)" },
  { name: "4", px: 16, rem: "1rem", role: "Default stack spacing, standard padding" },
  { name: "6", px: 24, rem: "1.5rem", role: "Card body padding, page container gutter" },
  { name: "8", px: 32, rem: "2rem", role: "Section column gap, desktop container gutter" },
  { name: "12", px: 48, rem: "3rem", role: "Major block spacing, card group separation" },
  { name: "16", px: 64, rem: "4rem", role: "Section vertical padding (mobile)" },
  { name: "24", px: 96, rem: "6rem", role: "Standard section vertical padding (desktop)" },
  { name: "32", px: 128, rem: "8rem", role: "Hero vertical breathing room, footer buffer" },
]

export const RADIUS_TOKENS = [
  { name: "None", value: "0px", class: "rounded-none", usage: "Editorial images, full-bleed blocks, divider cuts" },
  { name: "Small", value: "2px", class: "rounded-xs", usage: "Tags, inline badges, hairline cards" },
  { name: "Default (Base)", value: "4px (0.25rem)", class: "rounded-sm", usage: "Buttons, input fields, dropdown menus, cards" },
  { name: "Medium", value: "6px", class: "rounded-md", usage: "Interactive modals, popovers" },
  { name: "Large", value: "12px", class: "rounded-xl", usage: "Floating sheets, admin drawer panels" },
  { name: "Full", value: "9999px", class: "rounded-full", usage: "Pill tags, category chips, circular avatars" },
]

export const MOTION_TOKENS = [
  {
    name: "Editorial Fade-Up",
    duration: "0.6s",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    usage: "Section entrances, hero text reveals, project card viewport appearances",
    description: "Starts with slight upward momentum and gently eases into place without bounce.",
  },
  {
    name: "Micro Hover",
    duration: "0.2s",
    easing: "ease-out",
    usage: "Button hover, link underline transitions, color shifts",
    description: "Immediate, responsive feedback to pointer interactions.",
  },
  {
    name: "Drawer / Dialog Spring",
    duration: "0.4s",
    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
    usage: "Sheet panels, command palette modals, toast announcements",
    description: "Crisp physical entrance mimicking fine editorial stationery gliding.",
  },
  {
    name: "Reduced Motion",
    duration: "0s",
    easing: "instant",
    usage: "Triggered whenever prefers-reduced-motion is active",
    description: "Instant cut without transform transitions to preserve vestibular comfort.",
  },
]

export const BRAND_MARK_RULES = {
  name: "PS Monogram",
  gridAngle: "45°",
  geometry: "Rounded continuous strokes set on a strict 45° isometric grid; the P loops seamlessly over the S.",
  clearSpaceRatio: "1x stroke width on all four sides",
  minimumSizeDigital: "18px × 18px",
  minimumSizePrint: "6mm × 6mm",
  lightModeTreatment: "Fill: #1B1A16 (Ink) on #F5F5F3 (Ground)",
  darkModeTreatment: "Fill: #F5F5F3 (Ground) on #1B1A16 (Ink)",
  dos: [
    "Always preserve the 1:1 square aspect ratio.",
    "Render in solid Ink (#1B1A16) or Ground (#F5F5F3).",
    "Maintain clear space equal to the stroke width.",
    "Pair with uppercase tracking text: 'PRAJESH SHAKYA'.",
  ],
  donts: [
    "Do not rotate away from the master 45° grid.",
    "Do not apply drop shadows, gradient fills, or outer glows.",
    "Do not outline or distort the path thickness.",
    "Do not place on busy un-vetted photographic backgrounds without scrim.",
  ],
}
