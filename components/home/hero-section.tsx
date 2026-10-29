import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HeroMotion } from "@/components/home/hero-motion"

// The text is server-rendered; HeroMotion adds the GSAP entrance on top.
export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-20 text-center">
      <div className="page-container py-24 md:py-32">
        <HeroMotion className="mx-auto max-w-4xl">
          <span data-hero="kicker" className="block text-xs uppercase tracking-widest text-muted-foreground mb-6">
            BRAND STRATEGY & IDENTITY SYSTEMS
          </span>
          <h1
            data-hero="title"
            className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance"
          >
            I build category-defining brand identities that help ambitious founders command premium pricing.
          </h1>
          <p
            data-hero="fade"
            className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Moving beyond decorative logos. I deliver enduring visual architecture that drives investor confidence, enterprise deal sizes, and customer loyalty.
          </p>
          <div data-hero="fade" className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-sm tracking-wide hover:bg-foreground/90 transition-colors group"
            >
              Start a Project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-foreground text-sm tracking-wide hover:bg-foreground hover:text-background transition-colors"
            >
              View Work
            </Link>
          </div>
        </HeroMotion>
      </div>
    </section>
  )
}
