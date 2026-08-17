"use client"

import type { InferSelectModel } from "drizzle-orm"
import { motion } from "framer-motion"
import type { testimonials } from "@/lib/db/schema"

type Testimonial = InferSelectModel<typeof testimonials>

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null

  return (
    <section className="border-t border-border px-4 py-16 sm:px-8 sm:py-24" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Client notes</p>
        <h2 id="testimonials-heading" className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-balance sm:text-5xl">Good work should leave a mark.</h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <motion.figure key={testimonial.id} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5 }} className="flex min-h-48 flex-col justify-between rounded-2xl border border-border p-5 sm:p-6">
              <blockquote className="font-serif text-xl leading-relaxed">“{testimonial.quote}”</blockquote>
              <figcaption className="mt-8 text-sm text-muted-foreground">
                <span className="block font-medium text-foreground">{testimonial.clientName}</span>
                <span>{[testimonial.clientRole, testimonial.company].filter(Boolean).join(" · ")}</span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
