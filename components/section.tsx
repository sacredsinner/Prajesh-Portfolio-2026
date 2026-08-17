"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("py-24 md:py-32", className)}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
    </motion.section>
  )
}

export function SectionHeader({
  label,
  title,
  description,
  className,
}: {
  label?: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("mb-16 md:mb-20", className)}>
      {label && (
        <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-4">
          {label}
        </span>
      )}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
