import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { NewsletterForm } from "@/components/newsletter-form"

export const metadata: Metadata = {
  title: "Notes by Email — Prajesh Shakya",
  description: "Get new notes on brand strategy and identity design from Prajesh Shakya in your inbox.",
  alternates: { canonical: "/newsletter" },
}

const copy = {
  confirmed: {
    kicker: "Subscribed",
    heading: "You're on the list.",
    body: "Thanks for confirming. New notes will come straight to your inbox, and every email has a one-click unsubscribe link.",
  },
  invalid: {
    kicker: "Link expired",
    heading: "That link didn't work.",
    body: "Confirmation links last seven days and only work once they're copied in full. Enter your email again and I'll send a fresh one.",
  },
  default: {
    kicker: "Notes by email",
    heading: "Thinking on brands, sent to your inbox.",
    body: "Short, practical notes on brand strategy and identity design: what makes a brand distinctive, and how to build one that lasts. New notes arrive by email when they're published.",
  },
}

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const confirmed = status === "confirmed"
  const content = confirmed ? copy.confirmed : status === "invalid" ? copy.invalid : copy.default

  return (
    <>
      <Navbar />
      <main className="page-container pb-24 pt-32">
        <div className="max-w-2xl border-t border-border pt-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{content.kicker}</p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">{content.heading}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{content.body}</p>
          {confirmed ? (
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/blog" className="bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-75">
                Read the notes <span aria-hidden="true">→</span>
              </Link>
              <Link href="/projects" className="border border-foreground px-5 py-3 text-sm transition-colors hover:bg-foreground hover:text-background">
                See the work <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <NewsletterForm className="mt-10 max-w-md" />
          )}
        </div>
      </main>
      <Footer newsletter={false} />
    </>
  )
}
