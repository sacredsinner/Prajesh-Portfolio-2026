import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { blogPosts, clients, projects, showcaseVideos, testimonials } from "@/lib/db/schema"

export async function getActiveShowcaseVideo() {
  try {
    const rows = await db.select({ url: showcaseVideos.url, filename: showcaseVideos.filename }).from(showcaseVideos).where(eq(showcaseVideos.isActive, true)).limit(1)
    return rows[0] ?? null
  } catch (error) {
    console.error("[v0] Failed to load showcase video", error)
    return null
  }
}

export async function getPublishedClients() {
  try {
    return await db.select().from(clients).where(eq(clients.isPublished, true)).orderBy(clients.sortOrder, desc(clients.createdAt))
  } catch (error) {
    console.error("[v0] Failed to load clients", error)
    return []
  }
}

export async function getPublishedClient(slug: string) {
  const rows = await db.select().from(clients).where(and(eq(clients.slug, slug), eq(clients.isPublished, true))).limit(1)
  return rows[0] ?? null
}

export async function getPublishedTestimonials() {
  try {
    return await db.select().from(testimonials).where(eq(testimonials.published, true)).orderBy(desc(testimonials.featured), testimonials.sortOrder, desc(testimonials.createdAt))
  } catch (error) {
    console.error("[v0] Failed to load testimonials", error)
    return []
  }
}

export async function getPublishedProjects() {
  try {
    return await db.select().from(projects).orderBy(desc(projects.featured), desc(projects.updatedAt), desc(projects.createdAt))
  } catch (error) {
    console.error("[v0] Failed to load published projects", error)
    return []
  }
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
