import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AboutHero } from "@/components/about/about-hero"
import { AboutStory } from "@/components/about/about-story"
import { AboutValues } from "@/components/about/about-values"
import { CTABlock } from "@/components/cta-block"

export const metadata: Metadata = {
  title: "About — Prajesh Shakya",
  description:
    "Learn about Prajesh Shakya, a brand identity designer creating strategic brand identities that combine psychology, design, and marketing.",
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <AboutHero />
        <AboutStory />
        <AboutValues />
        <CTABlock
          title="Let&apos;s create something meaningful"
          description="I&apos;m always interested in working with ambitious brands."
        />
      </main>
      <Footer />
    </>
  )
}
