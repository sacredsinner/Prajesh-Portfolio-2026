"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProjectCard, type Project } from "@/components/project-card"
import { cn } from "@/lib/utils"

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState("All")

  // Filters come from the categories actually used, so none of them can come up empty.
  const categories = ["All", ...Array.from(new Set(projects.map((project) => project.category.trim()).filter(Boolean))).sort()]

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) => project.category.trim() === activeCategory)

  return (
    <section className="py-24 md:py-32">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20"
        >
          <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Projects
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Selected Work
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            A curated selection of brand identity projects, from strategy to
            visual systems.
          </p>
        </motion.div>

        {/* Filter */}
        {categories.length > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-12"
            role="group"
            aria-label="Filter projects by category"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={cn(
                  "px-4 py-2 text-sm tracking-wide transition-colors",
                  activeCategory === category
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Projects are on their way. In the meantime, <a href="/contact" className="underline underline-offset-4">get in touch</a>.
          </p>
        )}
      </div>
    </section>
  )
}
