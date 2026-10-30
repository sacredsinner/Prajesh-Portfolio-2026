import {
  COLOR_TOKENS,
  TYPOGRAPHY_SCALE,
  SPACING_SCALE,
  RADIUS_TOKENS,
  MOTION_TOKENS,
  BRAND_MARK_RULES,
  type ColorToken,
  type TypographyToken,
} from "./tokens"

export * from "./tokens"

/**
 * Calculates WCAG 2.1 relative luminance
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "")
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const transform = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)
}

/**
 * Calculates WCAG 2.1 contrast ratio between two hex colours (e.g. 14.2:1)
 */
export function calculateContrast(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1)
  const lum2 = getLuminance(hex2)
  const brighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return Number(((brighter + 0.05) / (darker + 0.05)).toFixed(1))
}

/**
 * Formats a contrast ratio string
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio}:1`
}

/**
 * Evaluates WCAG compliance for text
 */
export function getWcagRating(
  ratio: number,
  isLargeText = false
): "AAA" | "AA" | "Fail" {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA"
    if (ratio >= 3.0) return "AA"
    return "Fail"
  }
  if (ratio >= 7.0) return "AAA"
  if (ratio >= 4.5) return "AA"
  return "Fail"
}

/**
 * Exports all design tokens as raw JSON string
 */
export function exportDesignSystemJson(): string {
  return JSON.stringify(
    {
      name: "Prajesh Shakya Design System",
      version: "2.0.0",
      year: 2026,
      principles: [
        "Quiet Editorial Confidence",
        "Typographic Hierarchy & Truth",
        "Tactile Digital Craft",
        "Purposeful Motion without Distraction",
      ],
      colors: COLOR_TOKENS,
      typography: TYPOGRAPHY_SCALE,
      spacing: SPACING_SCALE,
      radii: RADIUS_TOKENS,
      motion: MOTION_TOKENS,
      brandMark: BRAND_MARK_RULES,
    },
    null,
    2
  )
}

/**
 * Exports Design System tokens as CSS variables
 */
export function exportDesignTokensCss(): string {
  return `:root {
  /* Brand palette (Prajesh Shakya design system): pure minimal mono */
  --background: #f5f5f3;
  --foreground: #1b1a16;
  --card: #f5f5f3;
  --card-foreground: #1b1a16;
  --popover: #f5f5f3;
  --popover-foreground: #1b1a16;
  --primary: #1b1a16;
  --primary-foreground: #f5f5f3;
  --secondary: #ecebe5;
  --secondary-foreground: #1b1a16;
  --muted: #ecebe5;
  --muted-foreground: #6f6d63;
  --accent: #45443d;
  --accent-foreground: #f5f5f3;
  --destructive: #b42318;
  --destructive-foreground: #b42318;
  --border: #d9d7cd;
  --input: #8b897f;
  --ring: #1b1a16;
  --radius: 0.25rem;
  --playground-accent: #2447ff;
}

.dark {
  /* Inverted board: ground #1B1A16 · text #F5F5F3 */
  --background: #1b1a16;
  --foreground: #f5f5f3;
  --card: #1b1a16;
  --card-foreground: #f5f5f3;
  --popover: #1b1a16;
  --popover-foreground: #f5f5f3;
  --primary: #f5f5f3;
  --primary-foreground: #1b1a16;
  --secondary: #2c2b25;
  --secondary-foreground: #f5f5f3;
  --muted: #2c2b25;
  --muted-foreground: #a3a196;
  --accent: #c7c5ba;
  --accent-foreground: #1b1a16;
  --destructive: #e05252;
  --destructive-foreground: #e05252;
  --border: #3a3932;
  --input: #8b897f;
  --ring: #f5f5f3;
}`
}
