"use client"

import { Section } from "@/components/section"
import { motion } from "framer-motion"

export function AboutStory() {
  return (
    <Section className="border-t border-border">
      <div className="grid lg:grid-cols-5 gap-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            The Story
          </span>
        </motion.div>

        <div className="lg:col-span-3 space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl leading-relaxed"
          >
            I started my journey in design over a decade ago, driven by a
            fascination with how visual language shapes perception and behavior.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Along the way, I discovered that the most impactful brands aren&apos;t
            just beautifully designed — they&apos;re strategically built. They
            understand their audience, occupy a clear position in the market,
            and communicate with consistency and intention.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Today, I work with founders, entrepreneurs, and established
            businesses who understand that brand is more than a logo — it&apos;s the
            complete experience of who you are. I combine strategic thinking
            with meticulous craft to create identities that don&apos;t just look
            good, but work hard for your business.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border"
          >
            <div>
              <span className="font-serif text-3xl md:text-4xl">10+</span>
              <p className="text-sm text-muted-foreground mt-1">
                Years Experience
              </p>
            </div>
            <div>
              <span className="font-serif text-3xl md:text-4xl">60+</span>
              <p className="text-sm text-muted-foreground mt-1">
                Brands Created
              </p>
            </div>
            <div>
              <span className="font-serif text-3xl md:text-4xl">12</span>
              <p className="text-sm text-muted-foreground mt-1">
                Countries
              </p>
            </div>
            <div>
              <span className="font-serif text-3xl md:text-4xl">100%</span>
              <p className="text-sm text-muted-foreground mt-1">
                Client Satisfaction
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
