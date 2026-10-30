import { NewsletterForm } from "@/components/newsletter-form"
import { Check } from "lucide-react"

export function NotesHero() {
  return (
    <section className="border-b border-border pb-16">
      {/* Eyebrow & Main Title */}
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Notes & Dispatches
        </p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-balance leading-[1.05]">
          The Sharpest Thinking On Brand Strategy.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Weekly breakdowns of the psychological and commercial mechanics that make brands desirable, defensible, and impossible to commoditize.
        </p>
      </div>

      {/* Sun Yi-Style "Guaranteed to make you say" Subscribe Card */}
      <div className="mt-10 border border-border bg-secondary/30 p-6 sm:p-8 md:p-10 rounded-sm">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Guaranteed to make you say:
          </p>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight text-foreground font-normal italic">
            &ldquo;I never thought of it that way.&rdquo;
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            These notes aren&apos;t the same cliché advice circulating on social feeds. Tactical frameworks, positioning teardowns, and pricing psychology delivered straight to your inbox.
          </p>

          {/* Form embed */}
          <div className="mt-6 pt-6 border-t border-border/60">
            <p className="font-mono text-xs uppercase tracking-wider text-foreground mb-3 font-medium">
              Enter your email to receive new notes:
            </p>
            <NewsletterForm className="max-w-xl" />
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-foreground" />
              1,200+ founders & strategists
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-foreground" />
              Zero marketing fluff
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-foreground" />
              One-click unsubscribe anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
