"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function AboutHero() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-6">
              About
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              Designing brands with{" "}
              <span className="italic">purpose</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-lg">
              I&apos;m Prajesh Shakya, a brand identity designer helping
              businesses discover and express their authentic identity through
              strategic design.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-[4/5] bg-muted"
          >
            <Image
              src="/images/about-portrait.jpg"
              alt="Prajesh Shakya"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
