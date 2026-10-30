import type { Metadata } from "next"
import { MoodboardDesignerApp } from "@/components/moodboard-designer/moodboard-designer-app"

export const metadata: Metadata = {
  title: "AI Moodboard Designer · Creative Studio",
  description:
    "An interactive creative workspace to generate, curate, customize, and export professional moodboards with text prompts and visual references inspired by Adobe Firefly.",
  robots: { index: false, follow: false },
}

export default function MoodboardDesignerPage() {
  return <MoodboardDesignerApp />
}
