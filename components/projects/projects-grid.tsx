"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProjectCard, type Project } from "@/components/project-card"
import { cn } from "@/lib/utils"

const categories = ["All", "Identity", "Strategy", "Systems"]

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((project) =>
          project.category.toLowerCase().includes(activeCategory.toLowerCase())
        )

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
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

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No projects found in this category.
          </p>
        )}
      </div>
    </section>
  )
}
