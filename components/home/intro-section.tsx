"use client"

import { Section } from "@/components/section"
import { motion } from "framer-motion"
import { useState } from "react"

const metrics = [
  { value: "6+", label: "Years Experience" },
  { value: "80+", label: "Projects" },
  { value: "7+", label: "Countries", detail: "Australia · Nepal · Remote" },
]

const services = [
  { title: "Brand Strategy", description: "Research, positioning, messaging, and strategic direction that define how your business should be perceived.", deliverables: ["Brand Discovery", "Audience Research", "Positioning", "Messaging Framework", "Brand Strategy Document"] },
  { title: "Brand Identity", description: "A complete visual identity system designed to create recognition, consistency, and trust.", deliverables: ["Logo System", "Colour Palette", "Typography", "Iconography", "Brand Guidelines"] },
  { title: "Digital Experience", description: "Bringing your brand to life across websites, digital products, and customer touchpoints.", deliverables: ["Portfolio Websites", "Landing Pages", "Design Systems", "UI Design", "CMS Integration"] },
]

export function IntroSection() {
  const [openIndex, setOpenIndex] = useState(-1)

  return (
    <Section className="border-t border-border">
      <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
        <div className="border-y border-foreground/80">
          {metrics.map((metric) => (
            <motion.div key={metric.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="border-b border-foreground/80 py-7 last:border-b-0">
              {metric.value && <p className="font-serif text-4xl tracking-tight">{metric.value}</p>}
              <p className={`${metric.value ? "mt-2" : "text-base"} text-xs uppercase tracking-widest`}>{metric.label}</p>
              {metric.detail && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{metric.detail}</p>}
            </motion.div>
          ))}
        </div>
        <div className="space-y-10">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-foreground">Design with intention</p>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-[19px] leading-relaxed text-pretty">
              I believe that great brands are built on truth. Every identity I create begins with deep understanding — of your business, your audience, and the space you occupy in their lives.
            </motion.p>
          </div>
          <div className="border-t border-border">
            {services.map((service, index) => (
              <motion.details key={service.title} open={openIndex === index} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }} className="group border-b border-border">
                <summary onClick={(event) => { event.preventDefault(); setOpenIndex(openIndex === index ? -1 : index) }} className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-xl font-medium tracking-tight [&::-webkit-details-marker]:hidden" aria-expanded={openIndex === index}>
                  {service.title}<span className={`text-2xl font-light text-muted-foreground transition-transform ${openIndex === index ? "rotate-45" : ""}`} aria-hidden="true">+</span>
                </summary>
                <div className="flex flex-col gap-4 pb-6 text-muted-foreground">
                  <p className="text-base leading-relaxed">{service.description}</p>
                  <ul className="flex flex-wrap gap-2">{service.deliverables.map((item) => <li key={item} className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide">{item}</li>)}</ul>
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
