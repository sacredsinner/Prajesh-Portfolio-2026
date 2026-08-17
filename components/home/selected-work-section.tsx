"use client"

import Link from "next/link"
import { Section, SectionHeader } from "@/components/section"
import { ProjectCard } from "@/components/project-card"
import { ArrowRight } from "lucide-react"
import type { Project } from "@/components/project-card"

export function SelectedWorkSection({ projects }: { projects: Project[] }) {
  const featuredProjects = projects.slice(0, 4)

  return (
    <Section>
      <SectionHeader
        label="Selected Work"
        title="Projects that define brands"
      />

      {/* Selected Work - 2x2 Grid */}
      <div className="grid gap-8 md:grid-cols-2 md:gap-6">
        {featuredProjects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-16 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm tracking-wide hover:opacity-70 transition-opacity group"
        >
          View All Projects
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Section>
  )
}
