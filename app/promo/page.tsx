import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PromoStudio } from "@/components/promo/promo-studio"
import { getFeatureFlags } from "@/lib/feature-flags"

export const metadata: Metadata = {
  title: "Promo Video Studio — Prajesh Shakya",
  description:
    "Cinematic motion graphics promo video and 60 FPS video exporter for Prajesh Shakya's 2026 Portfolio & Content Studio.",
  alternates: { canonical: "/promo" },
}

export default async function PromoPage() {
  const flags = await getFeatureFlags()

  // Guarded by backend site settings: returns 404 if disabled in backend
  if (!flags.promoVideo) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <PromoStudio />
      </main>
      <Footer />
    </>
  )
}
