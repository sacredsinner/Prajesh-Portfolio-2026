/**
 * Shakyaprajesh.com.np Showreel — Global Configuration
 * "Crafting Brands That People Remember"
 */

const CONFIG = {
  // Master Composition Settings
  comp: {
    name: "Shakyaprajesh_Showreel_Master",
    width: 1920,
    height: 1080,
    fps: 60,
    totalFrames: 3000, // 50.0s @ 60fps
    render4K: {
      width: 3840,
      height: 2160
    }
  },

  // Color Palette
  colors: {
    background: "#070707",
    surfaceDark: "#0D0D0E",
    surfaceCard: "#141416",
    primaryWhite: "#FFFFFF",
    accentBlue: "#2563EB",
    accentGlow: "#3B82F6",
    accentCyan: "#06B6D4",
    secondaryGray: "#D1D5DB",
    mutedGray: "#6B7280",
    hairline: "#222226"
  },

  // Typography Tokens
  fonts: {
    serif: { font: "Instrument Serif", style: "Regular" },
    sans: { font: "Plus Jakarta Sans", style: "Regular" },
    mono: { font: "Geist Mono", style: "Regular" }
  },

  // Timeline Scene Timecodes & Frame Ranges (60 FPS)
  scenes: {
    s01: { id: "s01", name: "01_Darkness", start: 0, end: 240, duration: 240 },
    s02: { id: "s02", name: "02_Identity", start: 240, end: 540, duration: 300 },
    s03: { id: "s03", name: "03_Process", start: 540, end: 840, duration: 300 },
    s04: { id: "s04", name: "04_Portfolio_Explosion", start: 840, end: 1140, duration: 300 },
    s05: { id: "s05", name: "05_UI_Sequence", start: 1140, end: 1440, duration: 300 },
    s06: { id: "s06", name: "06_Motion_Graphics", start: 1440, end: 1800, duration: 360 },
    s07: { id: "s07", name: "07_Creative_Workflow", start: 1800, end: 2100, duration: 300 },
    s08: { id: "s08", name: "08_AI_Design", start: 2100, end: 2460, duration: 360 },
    s09: { id: "s09", name: "09_Numbers", start: 2460, end: 2760, duration: 300 },
    s10: { id: "s10", name: "10_Closing", start: 2760, end: 3000, duration: 240 }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
