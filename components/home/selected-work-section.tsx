"use client"

import Link from "next/link"
import { Section, SectionHeader } from "@/components/section"
import { ProjectCard, ProjectCardLarge } from "@/components/project-card"
import { ArrowRight, Sparkles } from "lucide-react"
import type { Project } from "@/components/project-card"

export function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  // Prioritize featured project as primary hero card if available
  const heroProject = projects.find((p) => p.blocks && p.blocks.length > 0) || projects[0]
  const restProjects = projects.filter((p) => p.slug !== heroProject?.slug).slice(0, 4)

  return (
    <Section>
      <SectionHeader
        label="Selected Work"
        title="Projects that define brands and digital experiences"
      />

      {/* Featured Primary Highlight Case Study */}
      {heroProject && (
        <div className="mb-12 md:mb-16">
          <ProjectCardLarge project={heroProject} />
        </div>
      )}

      {/* Selected Work Grid */}
      {restProjects.length > 0 && (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
          {restProjects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      )}

      {/* View All Projects CTA */}
      <div className="mt-16 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium tracking-wide text-foreground shadow-sm transition-all hover:border-foreground hover:bg-secondary active:scale-95 group"
        >
          <span>Explore All Case Studies & Archives</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Section>
  )
}
