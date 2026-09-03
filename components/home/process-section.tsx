"use client"

import { Section, SectionHeader } from "@/components/section"
import { motion } from "framer-motion"

const processSteps = [
  {
    number: "01",
    title: "Understand",
    description:
      "I start by listening. I want to understand your business, your goals, your audience, and what you\'re trying to solve.",
  },
  {
    number: "02",
    title: "Explore",
    description:
      "I look deeper—at the market, competitors, people, and the things that could make your brand different.",
  },
  {
    number: "03",
    title: "Define",
    description:
      "I bring those thoughts together into a clear direction: what the brand should say, feel, and stand for.",
  },
  {
    number: "04",
    title: "Design",
    description:
      "This is where the thinking becomes visual. I explore ideas and build an identity around the direction we\'ve found.",
  },
  {
    number: "05",
    title: "Refine",
    description:
      "Nothing should be there just because it looks good. I question, refine, and make sure every part feels intentional.",
  },
  {
    number: "06",
    title: "Bring It To Life",
    description:
      "I shape the final identity into practical assets and systems you can actually use—not just a nice presentation.",
  },
]

export function ProcessSection() {
  return (
    <Section>
      <SectionHeader
        label="Process"
        title="How I work with you"
        description="A proven methodology that transforms insight into identity."
      />

      <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {processSteps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-4"
          >
            <span className="block font-serif text-4xl text-muted-foreground/30">
              {step.number}
            </span>
            <h3 className="font-serif text-xl tracking-tight">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
