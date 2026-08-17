"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { Project } from "@/components/project-card"

interface ProjectHeroProps {
  project: Project
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span>{project.category}</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
            <span>{project.year}</span>
            {project.client && (
              <>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <span>{project.client}</span>
              </>
            )}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
            {project.title}
          </h1>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative aspect-[16/9] bg-muted overflow-hidden"
        >
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}
