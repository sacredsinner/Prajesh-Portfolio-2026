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

interface WorkPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params
  const row = await getPublishedProject(slug)
  if (!row) return { title: "Project Not Found" }

  return {
    title: row.seoTitle || `${row.title} — Prajesh Shakya`,
    description: row.seoDescription || row.overview || undefined,
  }
}

export const dynamic = "force-dynamic"

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params
  const row = await getPublishedProject(slug)
  if (!row) notFound()

  const project = toProjectCard(row)
  const publicProjects = (await getPublishedProjects()).map(toProjectCard)
  const currentIndex = publicProjects.findIndex((item) => item.slug === slug)

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ProjectHero project={project} />
        <ProjectContent project={project} />
        <ProjectGallery project={project} />
        <ProjectNavigation
          prev={currentIndex > 0 ? publicProjects[currentIndex - 1] : null}
          next={currentIndex < publicProjects.length - 1 ? publicProjects[currentIndex + 1] : null}
        />
        <CTABlock
          title="Inspired by this project?"
          description="Let&apos;s discuss how we can create something similar for your brand."
        />
      </main>
      <Footer />
    </>
  )
}
