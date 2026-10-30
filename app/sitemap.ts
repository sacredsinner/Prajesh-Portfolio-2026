import type { MetadataRoute } from "next"
import { getPublishedClients, getPublishedPosts, getPublishedProjects } from "@/lib/public-content"
import { SITE_URL } from "@/lib/site"
import { needsClientName } from "@/lib/utils"

// Regenerated hourly, and whenever content is saved in /admin.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, clients] = await Promise.all([getPublishedProjects(), getPublishedPosts(), getPublishedClients()])

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/packages`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/newsletter`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/clients`, changeFrequency: "monthly", priority: 0.5 },
  ]

  return [
    ...pages,
    ...projects.map((project: any) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    // Only client pages with a real name and a description are worth indexing.
    ...clients
      .filter((client) => client.description && !needsClientName(client.name))
      .map((client) => ({
        url: `${SITE_URL}/clients/${client.slug}`,
        lastModified: client.createdAt,
        changeFrequency: "yearly" as const,
        priority: 0.4,
      })),
  ]
}
