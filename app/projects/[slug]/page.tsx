import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EditorialCaseStudy } from "@/components/projects/editorial-case-study"
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

  const title = `${project.title} — Prajesh Shakya`
  return {
    title,
    description: project.overview,
    openGraph: { title, description: project.overview, images: [{ url: project.thumbnail }] },
    twitter: { card: "summary_large_image", title, description: project.overview, images: [project.thumbnail] },
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
  const nextProject = publicProjects[(currentIndex + 1) % publicProjects.length] ?? publicProjects[0]

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <EditorialCaseStudy project={project} nextProject={nextProject} />
      </main>
      <Footer />
    </>
  )
}
