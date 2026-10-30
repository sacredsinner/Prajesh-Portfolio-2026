import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PromoStudio } from "@/components/promo/promo-studio"

export const metadata: Metadata = {
  title: "Promo Video Studio — Prajesh Shakya",
  description:
    "Cinematic motion graphics promo video and 60 FPS video exporter for Prajesh Shakya's 2026 Portfolio & Content Studio.",
  alternates: { canonical: "/promo" },
}

export default function PromoPage() {
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
