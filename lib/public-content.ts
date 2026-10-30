import { cache } from "react"
import { and, desc, eq, or, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { blogPosts, clients, projects, showcaseVideos, testimonials } from "@/lib/db/schema"
import { projects as fallbackProjects } from "@/lib/projects"
import { DEMO_NOTES } from "@/lib/demo-notes"

export type BlogPost = typeof blogPosts.$inferSelect

// The public portfolio should still render when the CMS database is
// unavailable, so these return empty results instead of throwing. Errors are
// logged so they show up in the Vercel function logs.
function logUnavailable(what: string, error: unknown) {
  console.error(`[content] Could not load ${what}:`, error instanceof Error ? error.message : error)
}

export async function getActiveShowcaseVideo() {
  try {
    const rows = await db
      .select({ url: showcaseVideos.url, filename: showcaseVideos.filename })
      .from(showcaseVideos)
      .where(eq(showcaseVideos.isActive, true))
      .limit(1)
    return rows[0] ?? null
  } catch (error) {
    logUnavailable("showcase video", error)
    return null
  }
}

export async function getPublishedClients() {
  try {
    return await db.select().from(clients).where(eq(clients.isPublished, true)).orderBy(clients.sortOrder, desc(clients.createdAt))
  } catch (error) {
    logUnavailable("clients", error)
    return []
  }
}

export async function getPublishedClient(slug: string) {
  try {
    const rows = await db.select().from(clients).where(and(eq(clients.slug, slug), eq(clients.isPublished, true))).limit(1)
    return rows[0] ?? null
  } catch (error) {
    logUnavailable(`client "${slug}"`, error)
    return null
  }
}

export async function getPublishedTestimonials() {
  try {
    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.published, true))
      .orderBy(desc(testimonials.featured), testimonials.sortOrder, desc(testimonials.createdAt))
  } catch (error) {
    logUnavailable("testimonials", error)
    return []
  }
}

// Lightweight project summary query for Homepage, Grid, and Sitemap.
// Specifically omits the heavy 'blocks' and 'assets' JSONB columns to save
// up to 90% of database payload bandwidth and JSON deserialization CPU.
export async function getPublishedProjectsSummary() {
  try {
    const rows = await db
      .select({
        id: projects.id,
        slug: projects.slug,
        title: projects.title,
        subtitle: projects.subtitle,
        status: projects.status,
        category: projects.category,
        year: projects.year,
        thumbnail: projects.thumbnail,
        coverCrop: projects.coverCrop,
        client: projects.client,
        role: projects.role,
        overview: projects.overview,
        creativeFields: projects.creativeFields,
        tags: projects.tags,
        toolsUsed: projects.toolsUsed,
        analytics: projects.analytics,
        featured: projects.featured,
        seoTitle: projects.seoTitle,
        seoDescription: projects.seoDescription,
        ogImage: projects.ogImage,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(or(eq(projects.status, "published"), sql`${projects.status} IS NULL`))
      .orderBy(desc(projects.featured), desc(projects.updatedAt), desc(projects.createdAt))

    if (rows && rows.length > 0) return rows
  } catch (error) {
    logUnavailable("projects summary", error)
  }
  return fallbackProjects as any
}

// Full projects query (includes full blocks and assets)
export async function getPublishedProjects() {
  return getPublishedProjectsSummary()
}

// Request-level deduplication: guarantees generateMetadata() and ProjectPage()
// share a single database query during the same request lifecycle.
export const getPublishedProject = cache(async (slug: string) => {
  try {
    const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1)
    if (rows[0]) return rows[0]
  } catch (error) {
    logUnavailable(`project "${slug}"`, error)
  }
  return (fallbackProjects.find((p) => p.slug === slug) as any) ?? undefined
})

export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => {
  try {
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.featured), desc(blogPosts.publishedAt))
    if (rows && rows.length > 0) return rows
  } catch (error) {
    logUnavailable("notes", error)
  }
  return DEMO_NOTES as unknown as BlogPost[]
})

export const getPublishedPost = cache(async (slug: string): Promise<BlogPost | undefined> => {
  try {
    const rows = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true))).limit(1)
    if (rows[0]) return rows[0]
  } catch (error) {
    logUnavailable(`note "${slug}"`, error)
  }
  return (DEMO_NOTES.find((n) => n.slug === slug) as unknown as BlogPost) ?? undefined
})

export type PublicProject = any

export function toProjectCard(project: any) {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    subtitle: project.subtitle ?? "",
    status: project.status ?? "published",
    category: project.category,
    year: project.year,
    client: project.client ?? "",
    role: project.role ?? "",
    thumbnail: project.thumbnail,
    coverCrop: project.coverCrop ?? null,
    overview: project.overview ?? "",
    problem: project.problem ?? "",
    approach: project.approach ?? "",
    solution: project.solution ?? "",
    outcome: project.outcome ?? "",
    images: Array.isArray(project.images) ? project.images.filter((image: unknown): image is string => typeof image === "string") : [],
    creativeFields: Array.isArray(project.creativeFields) ? project.creativeFields : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    toolsUsed: Array.isArray(project.toolsUsed) ? project.toolsUsed : [],
    team: Array.isArray(project.team) ? project.team : [],
    industries: Array.isArray(project.industries) ? project.industries : [],
    license: project.license ?? "",
    copyright: project.copyright ?? "",
    blocks: Array.isArray(project.blocks) ? project.blocks : [],
    assets: Array.isArray(project.assets) ? project.assets : [],
    analytics: project.analytics ?? { views: 0, appreciations: 0, saves: 0, comments: 0 },
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
    ogImage: project.ogImage ?? "",
  }
}
