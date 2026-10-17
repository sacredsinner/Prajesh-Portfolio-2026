import Link from "next/link"
import { ArrowRight } from "lucide-react"

// Server-rendered with CSS animations (see .rise-in in globals.css), so the
// headline is visible from the first paint instead of waiting for JavaScript.
export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-20 text-center">
      <div className="page-container py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <span className="rise-in block text-xs uppercase tracking-widest text-muted-foreground mb-6">
            Brand Identity Designer | Creative Strategist
          </span>
          <h1
            className="rise-in font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance"
            style={{ animationDelay: "60ms" }}
          >
            Crafting Authentic Brand Identities That Resonate
          </h1>
          <p
            className="rise-in mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            Hi, I&apos;m Prajesh — I turn ideas into distinctive brands through strategy, design, and meaningful visual identities.
          </p>
          <div
            className="rise-in mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            style={{ animationDelay: "260ms" }}
          >
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
        </div>
      </div>
    </section>
  )
}
