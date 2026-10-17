"use client"

import { useId, useState } from "react"
import { ArrowRight } from "lucide-react"
import { subscribeToNewsletter } from "@/app/actions/newsletter"

// Email sign-up for new Notes. Double opt-in: the visitor gets a confirmation link first.
export function NewsletterForm({ className = "" }: { className?: string }) {
  const id = useId()
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    setState("sending")
    setError("")
    try {
      const result = await subscribeToNewsletter({ email: String(form.get("email") ?? ""), website: String(form.get("website") ?? "") })
      if (!result.ok) {
        setState("error")
        setError(result.error)
        return
      }
      setState("sent")
      formElement.reset()
    } catch {
      setState("error")
      setError("Sorry, that didn't work. Please try again in a moment.")
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className={className}>
        <p className="font-serif text-2xl">Check your inbox.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">I&apos;ve sent you a link to confirm your subscription. It might take a minute, and it can land in spam or promotions.</p>
        <button type="button" onClick={() => setState("idle")} className="mt-3 text-sm underline underline-offset-4">Use a different email</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
      <div className="flex items-stretch gap-3">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          placeholder="your@email.com"
          className="min-w-0 flex-1 border-0 border-b border-input bg-transparent px-0 py-3 text-base focus:border-foreground focus:outline-none"
        />
        <button type="submit" disabled={state === "sending"} className="group inline-flex shrink-0 items-center gap-2 bg-foreground px-5 text-sm tracking-wide text-background transition-opacity hover:opacity-80 disabled:opacity-50">
          {state === "sending" ? "Sending…" : "Subscribe"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {state === "error" && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <p className="mt-3 text-xs text-muted-foreground">No spam. Unsubscribe with one click from any email.</p>
    </form>
  )
}
