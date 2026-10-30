import type { Project } from "@/components/project-card"
import { DEMO_PROJECTS } from "./demo-projects"

export const projects: Project[] = DEMO_PROJECTS as unknown as Project[]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function getProjectsByCategory(category: string): Project[] {
  if (category === "All") return projects
  return projects.filter((project) =>
    project.category.toLowerCase().includes(category.toLowerCase())
  )
}
