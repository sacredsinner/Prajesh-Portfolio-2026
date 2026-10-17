"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { submitContact } from "@/app/actions/cms"
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/site"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [state, setState] = useState<"idle" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setState("idle")
    setError("")
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    try {
      const result = await submitContact({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        company: String(form.get("company") ?? "") || undefined,
        message: String(form.get("message") ?? ""),
        website: String(form.get("website") ?? ""),
      })
      if (!result.ok) {
        setState("error")
        setError(result.error)
        return
      }
      setState("success")
      formElement.reset()
    } catch {
      setState("error")
      setError(`Sorry, the message couldn't be sent right now. Please email me at ${CONTACT_EMAIL}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-24 md:py-32">
      <div className="page-container grid gap-16 lg:grid-cols-2 lg:gap-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="mb-6 block text-xs uppercase tracking-widest text-muted-foreground">Contact</span>
          <h1 className="font-serif text-4xl leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Let&apos;s start a <span className="italic">conversation</span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            You don&apos;t need to have everything figured out before reaching out. Maybe you&apos;re starting something new. Maybe your current brand doesn&apos;t feel like you anymore. Or maybe you just have an idea you&apos;re trying to make sense of. Let&apos;s talk.
          </p>
          <div className="mt-12 space-y-6">
            <div>
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-lg hover:opacity-70">{CONTACT_EMAIL}</a>
            </div>
            <div>
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Based in</span>
              <p className="text-lg">Kathmandu, Nepal</p>
            </div>
            <div>
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Prefer to talk?</span>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="text-lg underline-offset-4 hover:underline">Book a free 30-minute call ↗</a>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {state === "success" ? (
            <div className="space-y-4" role="status">
              <h2 className="font-serif text-2xl">Thank you.</h2>
              <p className="text-muted-foreground">Your message has been sent, and a copy is on its way to your inbox. I&apos;ll reply within one working day.</p>
              <button type="button" className="text-sm underline" onClick={() => setState("idle")}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <Field id="name" label="Name" placeholder="Your name" autoComplete="name" minLength={2} maxLength={120} />
              <Field id="email" label="Email" type="email" placeholder="your@email.com" autoComplete="email" maxLength={200} />
              <Field id="company" label="Company" placeholder="Your company (optional)" autoComplete="organization" maxLength={160} required={false} />
              <div className="space-y-2">
                <label htmlFor="message" className="block text-xs uppercase tracking-widest text-muted-foreground">Message</label>
                <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={5} className="w-full resize-none border-0 border-b border-input bg-transparent px-0 py-3 text-lg focus:border-foreground focus:outline-none" placeholder="Tell me about your project..." />
              </div>
              {/* Honeypot: hidden from people, filled in by bots. */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              {state === "error" && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="group inline-flex items-center gap-2 bg-foreground px-6 py-3 text-sm tracking-wide text-background disabled:opacity-50">
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function Field({ id, label, placeholder, type = "text", required = true, autoComplete, minLength, maxLength }: { id: string; label: string; placeholder: string; type?: string; required?: boolean; autoComplete?: string; minLength?: number; maxLength?: number }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input id={id} name={id} type={type} required={required} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} className="w-full border-0 border-b border-input bg-transparent px-0 py-3 text-lg focus:border-foreground focus:outline-none" placeholder={placeholder} />
    </div>
  )
}
