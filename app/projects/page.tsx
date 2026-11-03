import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProjectsGrid } from "@/components/projects/projects-grid"
import { CTABlock } from "@/components/cta-block"
import { getPublishedProjects, toProjectCard } from "@/lib/public-content"
import type { Project } from "@/components/project-card"

export const metadata: Metadata = {
  title: "Brand Strategy, Visual Identity & Packaging Case Studies — Prajesh Shakya",
  description:
    "Explore commercial case studies in brand strategy, logo architecture, packaging design, and visual systems for ambitious businesses across Nepal, Australia, and the US.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Brand Strategy, Visual Identity & Packaging Case Studies — Prajesh Shakya",
    description:
      "Selected commercial case studies in brand strategy, logo systems, and packaging architecture.",
    url: "https://www.shakyaprajesh.com.np/projects",
  },
}

// Pages are cached and refreshed every 5 minutes, and immediately when content is saved in /admin.
export const revalidate = 300

export default async function ProjectsPage() {
  const rows = await getPublishedProjects()
  const projects: Project[] = rows.map(toProjectCard)
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
