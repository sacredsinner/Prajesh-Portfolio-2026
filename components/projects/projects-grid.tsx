"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProjectCard, ProjectCardLarge, type Project } from "@/components/project-card"
import { Search, LayoutGrid, Rows3, X, SlidersHorizontal, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectsGridProps {
  projects: Project[]
}

type ViewMode = "grid" | "cinematic"

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Extract all unique disciplines and categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => {
      if (p.category) set.add(p.category.trim())
      if (p.creativeFields && Array.isArray(p.creativeFields)) {
        p.creativeFields.forEach((f) => set.add(f.trim()))
      }
    })
    return ["All", ...Array.from(set).filter(Boolean).sort()]
  }, [projects])

  // Multi-facet search and category filtering
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return projects.filter((project) => {
      // Category / discipline match
      const matchesCategory =
        activeCategory === "All" ||
        project.category?.trim().toLowerCase() === activeCategory.toLowerCase() ||
        project.creativeFields?.some((f) => f.trim().toLowerCase() === activeCategory.toLowerCase())

      if (!matchesCategory) return false

      if (!q) return true

      // Search match across title, client, subtitle, overview, tags, tools
      const inTitle = project.title.toLowerCase().includes(q)
      const inSubtitle = (project.subtitle ?? "").toLowerCase().includes(q)
      const inClient = (project.client ?? "").toLowerCase().includes(q)
      const inOverview = (project.overview ?? "").toLowerCase().includes(q)
      const inTags = project.tags?.some((t) => t.toLowerCase().includes(q)) ?? false
      const inTools = project.toolsUsed?.some((t) => t.toLowerCase().includes(q)) ?? false

      return inTitle || inSubtitle || inClient || inOverview || inTags || inTools
    })
  }, [projects, activeCategory, searchQuery])

  const clearFilters = () => {
    setSearchQuery("")
    setActiveCategory("All")
  }

  const isFiltered = activeCategory !== "All" || searchQuery.trim().length > 0

  return (
    <section className="py-20 md:py-32">
      <div className="page-container">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 md:mb-18"
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3.5" />
            <span>Curated Portfolio</span>
          </div>
          <h1 className="mt-4 font-serif text-5xl font-medium tracking-tight md:text-7xl">
            Selected Work
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Explorations in brand systems, digital experiences, art direction, and visual identities crafted to scale.
          </p>
        </motion.div>

        {/* Search, Filter Pills & View Mode Bar */}
        <div className="mb-12 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, client, discipline, or software…"
                className="w-full rounded-full border border-border bg-secondary/30 py-2.5 pl-10 pr-10 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-foreground focus:bg-background focus:ring-1 focus:ring-foreground/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle & Result Count */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">
                Showing {filteredProjects.length} of {projects.length}
              </span>

              <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/40 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    viewMode === "grid"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cinematic")}
                  title="Editorial Cinematic View"
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    viewMode === "cinematic"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Rows3 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs transition-all active:scale-95",
                    activeCategory === category
                      ? "bg-foreground font-medium text-background shadow-sm"
                      : "border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                >
                  {category}
                </button>
              ))}

              {isFiltered && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground underline"
                >
                  <X className="size-3" /> Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── PROJECTS LISTINGS ── */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.slug} project={project} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="cinematic-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-16 md:space-y-24"
            >
              {filteredProjects.map((project) => (
                <ProjectCardLarge key={project.slug} project={project} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="my-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <SlidersHorizontal className="size-8 text-muted-foreground" />
            <h3 className="mt-3 font-serif text-2xl font-medium">No matching projects found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
