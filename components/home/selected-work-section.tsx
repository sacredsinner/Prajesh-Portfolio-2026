"use client"

import Link from "next/link"
import { Section, SectionHeader } from "@/components/section"
import { ProjectCard } from "@/components/project-card"
import { ArrowRight } from "lucide-react"
import type { Project } from "@/components/project-card"

export function SelectedWorkSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  // Display top selected projects in a clean, balanced grid without 1-on-1 display
  const displayProjects = projects.slice(0, 4)

  return (
    <Section>
      <SectionHeader
        label="Selected Work"
        title="Projects that define brands and digital experiences"
      />

      {/* Selected Work Grid - clean multi-column, no 1-on-1 display */}
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {displayProjects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>

      {/* View All Projects CTA */}
      <div className="mt-16 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 border border-border bg-background px-6 py-3 text-sm font-medium tracking-wide text-foreground transition-all hover:border-foreground hover:bg-secondary active:scale-95 group"
        >
          <span>Explore All Case Studies & Archives</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Section>
  )
}
