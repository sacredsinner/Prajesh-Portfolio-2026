"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { BOOKING_URL } from "@/lib/site"

interface CTABlockProps {
  title?: string
  description?: string
  buttonText?: string
  buttonHref?: string
}

export function CTABlock({
  title = "Ready to transform your brand?",
  description = "Let's create something meaningful together.",
  buttonText = "Start a Project",
  buttonHref = "/contact",
}: CTABlockProps) {
  return (
    <section className="bg-foreground text-background">
      <div className="w-full px-6 lg:px-8 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight text-balance">
            {title}
          </h2>
          <p className="mt-4 text-lg text-background/70 leading-relaxed">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={buttonHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground text-sm tracking-wide hover:bg-background/90 transition-colors group"
            >
              {buttonText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-background/40 px-6 py-3 text-sm tracking-wide transition-colors hover:border-background group"
            >
              Book a free 30-min call
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
