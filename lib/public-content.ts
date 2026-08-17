import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { blogPosts, clients, projects, showcaseVideos, testimonials } from "@/lib/db/schema"

export async function getActiveShowcaseVideo() {
  const rows = await db.select({ url: showcaseVideos.url, filename: showcaseVideos.filename }).from(showcaseVideos).where(eq(showcaseVideos.isActive, true)).limit(1)
  return rows[0] ?? null
}

export async function getPublishedClients() {
  return db.select().from(clients).where(eq(clients.isPublished, true)).orderBy(clients.sortOrder, desc(clients.createdAt))
}

export async function getPublishedClient(slug: string) {
  const rows = await db.select().from(clients).where(and(eq(clients.slug, slug), eq(clients.isPublished, true))).limit(1)
  return rows[0] ?? null
}

export async function getPublishedTestimonials() {
  return db.select().from(testimonials).where(eq(testimonials.published, true)).orderBy(desc(testimonials.featured), testimonials.sortOrder, desc(testimonials.createdAt))
}

export async function getPublishedProjects() {
  return db.select().from(projects).orderBy(desc(projects.featured), desc(projects.updatedAt), desc(projects.createdAt))
}

export async function getPublishedProject(slug: string) {
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1)
  return rows[0]
}

export async function getPublishedPosts() {
  return db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.featured), desc(blogPosts.publishedAt))
}

export async function getPublishedPost(slug: string) {
  const rows = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true))).limit(1)
  return rows[0]
}

export type PublicProject = Awaited<ReturnType<typeof getPublishedProjects>>[number]

export function toProjectCard(project: PublicProject) {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    year: project.year,
    client: project.client ?? "",
    thumbnail: project.thumbnail,
    overview: project.overview ?? "",
    problem: project.problem ?? "",
    approach: project.approach ?? "",
    solution: project.solution ?? "",
    outcome: project.outcome ?? "",
    images: Array.isArray(project.images) ? project.images.filter((image): image is string => typeof image === "string") : [],
  }
}
