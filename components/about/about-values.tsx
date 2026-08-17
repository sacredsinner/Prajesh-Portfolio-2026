"use client"

import { Section, SectionHeader } from "@/components/section"
import { motion } from "framer-motion"

const values = [
  {
    title: "Strategy First",
    description:
      "Every design decision is rooted in research and strategic thinking. Beautiful design without strategy is just decoration.",
  },
  {
    title: "Meaningful Simplicity",
    description:
      "I believe in removing the unnecessary to amplify what matters. The best brands communicate clearly and memorably.",
  },
  {
    title: "Lasting Impact",
    description:
      "I design for longevity, not trends. Your brand should feel as relevant in ten years as it does today.",
  },
  {
    title: "True Partnership",
    description:
      "I work closely with my clients, treating every project as a collaboration. Your success is my success.",
  },
]

export function AboutValues() {
  return (
    <Section className="bg-secondary/50">
      <SectionHeader
        label="Values"
        title="What I believe"
        description="The principles that guide every project and decision."
      />

      <div className="grid md:grid-cols-2 gap-12 md:gap-8">
        {values.map((value, index) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-3"
          >
            <h3 className="font-serif text-xl tracking-tight">{value.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {value.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
