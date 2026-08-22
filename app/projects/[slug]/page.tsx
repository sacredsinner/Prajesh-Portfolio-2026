import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProjectHero } from "@/components/projects/project-hero"
import { ProjectContent } from "@/components/projects/project-content"
import { ProjectGallery } from "@/components/projects/project-gallery"
import { ProjectNavigation } from "@/components/projects/project-navigation"
import { CTABlock } from "@/components/cta-block"
import { getPublishedProject, getPublishedProjects, toProjectCard } from "@/lib/public-content"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const row = await getPublishedProject(slug)
  const project = row ? toProjectCard(row) : undefined

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  return {
title: `${project.title} — Prajesh Shakya`,
  description: project.overview,
  }
}

export const dynamic = "force-dynamic"

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const row = await getPublishedProject(slug)
  const project = row ? toProjectCard(row) : undefined

  if (!project) {
    notFound()
  }

  const projectRows = await getPublishedProjects()
  const publicProjects = projectRows.map(toProjectCard)
  const currentIndex = publicProjects.findIndex((p) => p.slug === slug)
  const prevProject = currentIndex > 0 ? publicProjects[currentIndex - 1] : null
  const nextProject = currentIndex < publicProjects.length - 1 ? publicProjects[currentIndex + 1] : null

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ProjectHero project={project} />
        <ProjectContent project={project} />
        <ProjectGallery project={project} />
        <ProjectNavigation prev={prevProject} next={nextProject} />
        <CTABlock
          title="Inspired by this project?"
          description="Let&apos;s discuss how we can create something similar for your brand."
        />
      </main>
      <Footer />
    </>
  )
}
