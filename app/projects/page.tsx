import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProjectsGrid } from "@/components/projects/projects-grid"
import { CTABlock } from "@/components/cta-block"
import { getPublishedProjects } from "@/lib/public-content"
import type { Project } from "@/components/project-card"

export const metadata: Metadata = {
  title: "Projects — Prajesh Shakya",
  description:
    "Explore brand identity projects and case studies by Prajesh Shakya. Strategic design work for ambitious businesses.",
}

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const rows = await getPublishedProjects()
  const projects: Project[] = rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    category: row.category,
    year: row.year,
    client: row.client ?? "",
    thumbnail: row.thumbnail,
    overview: row.overview ?? "",
    problem: row.problem ?? "",
    approach: row.approach ?? "",
    solution: row.solution ?? "",
    outcome: row.outcome ?? "",
    images: row.images,
  }))
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ProjectsGrid projects={projects} />
        <CTABlock
          title="Have a project in mind?"
          description="Let&apos;s discuss how we can work together."
        />
      </main>
      <Footer />
    </>
  )
}
