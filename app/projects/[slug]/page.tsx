import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EditorialCaseStudy } from "@/components/projects/editorial-case-study"
import { getPublishedProject, getPublishedProjects, toProjectCard } from "@/lib/public-content"
import { JsonLd, PERSON_ID, absoluteUrl, person } from "@/components/json-ld"
import { canonicalUrl, shareTitle, type ShareNetwork } from "@/lib/share"
import { DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

const SHARE_NETWORKS: ShareNetwork[] = ["linkedin", "x", "facebook", "whatsapp", "pinterest", "email"]

const hasImage = (src: string) => Boolean(src) && !src.startsWith("/placeholder")

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

  // The SEO fields in /admin win when they're filled in.
  const title = row?.seoTitle?.trim() || `${project.title} — Prajesh Shakya`
  const description = row?.seoDescription?.trim() || project.overview
  // A page's openGraph replaces the layout's whole, so the site name is set again here.
  const image = hasImage(project.thumbnail) ? { url: project.thumbnail, alt: project.title } : DEFAULT_SHARE_IMAGE
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title, description, url: `/projects/${project.slug}`, siteName: SITE_NAME, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  }
}

// Pages are cached and refreshed every 5 minutes, and immediately when content is saved in /admin.
export const revalidate = 300

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

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: row?.seoDescription?.trim() || project.overview || undefined,
    url: `${SITE_URL}/projects/${project.slug}`,
    image: [project.thumbnail, ...project.images].filter(Boolean).slice(0, 6).map(absoluteUrl),
    genre: project.category,
    dateCreated: /^\d{4}$/.test(project.year) ? project.year : undefined,
    creator: { ...person, "@id": PERSON_ID },
    ...(project.client ? { sourceOrganization: { "@type": "Organization", name: project.client } } : {}),
  }
  return (
    <>
      <JsonLd data={projectSchema} />
      <Navbar />
      <main className="pt-20">
        <EditorialCaseStudy
          project={project}
          nextProject={nextProject}
          share={{
            url: canonicalUrl(`/projects/${project.slug}`),
            title: shareTitle(project.title, project.category),
            summary: row?.seoDescription?.trim() || project.overview,
            image: hasImage(project.thumbnail) ? absoluteUrl(project.thumbnail) : undefined,
            networks: SHARE_NETWORKS,
            contentType: "project",
          }}
        />
      </main>
      <Footer />
    </>
  )
}
