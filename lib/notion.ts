import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/db/schema"
import { ensureSchema } from "@/lib/db/migrate"
import { eq, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type NotionConfig = {
  apiKey?: string
  databaseId?: string
  isConfigured: boolean
}

export function getNotionConfig(): NotionConfig {
  const apiKey = process.env.NOTION_API_KEY?.trim()
  const rawId = process.env.NOTION_DATABASE_ID?.trim()
  const databaseId = rawId ? normalizeNotionId(rawId) : undefined

  return {
    apiKey,
    databaseId,
    isConfigured: Boolean(apiKey),
  }
}

/**
 * Normalizes any Notion database ID or URL into a standard hyphenated UUID.
 * Handles:
 * - Full URLs: https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...
 * - Title URLs: https://www.notion.so/Notes-a8aec43384f447ed84390e8e42c2e089
 * - Raw 32-character hex strings: a8aec43384f447ed84390e8e42c2e089
 * - Standard UUIDs: a8aec433-84f4-47ed-8439-0e8e42c2e089
 */
export function normalizeNotionId(raw: string): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()

  // Match 36-char hyphenated UUID (8-4-4-4-12)
  const uuidMatch = trimmed.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i)
  if (uuidMatch) return uuidMatch[0]

  // Match 32 continuous hex characters
  const hexMatch = trimmed.match(/[a-f0-9]{32}/i)
  if (hexMatch) {
    const clean = hexMatch[0]
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`
  }

  return undefined
}

export function getNotionClient(): Client | null {
  const { apiKey } = getNotionConfig()
  if (!apiKey) return null
  return new Client({
    auth: apiKey,
    notionVersion: "2022-06-28",
  })
}

/**
 * Queries Notion's Search API to find any databases shared with the integration token.
 */
export async function findAccessibleDatabases(notion: Client): Promise<{ id: string; title: string; url?: string }[]> {
  try {
    const res = (await notion.search({
      filter: { value: "database", property: "object" },
    })) as { results: any[] }

    return (res.results || []).map((db: any) => {
      const title = Array.isArray(db.title)
        ? db.title.map((t: any) => t.plain_text || "").join("").trim()
        : ""
      return {
        id: db.id,
        title: title || "Untitled Database",
        url: db.url,
      }
    })
  } catch (error) {
    console.error("[notion] Error searching for shared databases:", error)
    return []
  }
}

/**
 * Resolves the database ID to query:
 * 1. Tests the configured ID if provided.
 * 2. If invalid or not found, automatically discovers databases shared with the integration.
 */
export async function resolveDatabaseId(
  notion: Client,
  configuredId?: string
): Promise<{ id: string; title: string }> {
  // If configured ID is provided and formatted, test if reachable
  if (configuredId) {
    try {
      const db = (await notion.request({
        path: `databases/${configuredId}`,
        method: "get",
      })) as any

      const title = Array.isArray(db.title)
        ? db.title.map((t: any) => t.plain_text || "").join("").trim()
        : ""
      return { id: configuredId, title: title || "Notes Database" }
    } catch {
      console.warn(`[notion] Configured database ID (${configuredId}) was not found. Attempting auto-discovery...`)
    }
  }

  // Auto-discovery via Notion Search API
  const accessible = await findAccessibleDatabases(notion)

  if (accessible.length === 1) {
    console.log(`[notion] Auto-selected the single shared database: "${accessible[0].title}" (${accessible[0].id})`)
    return accessible[0]
  }

  if (accessible.length > 1) {
    // Look for a database with title matching notes/blog/articles
    const match = accessible.find((d) => /note|blog|article|post|writing/i.test(d.title))
    if (match) {
      console.log(`[notion] Auto-selected matching database: "${match.title}" (${match.id})`)
      return match
    }

    const list = accessible
      .map((d) => `"${d.title}" (ID: ${d.id.replace(/-/g, "")})`)
      .join(", ")
    throw new Error(
      `Multiple databases are shared with your Notion integration: ${list}. Please set NOTION_DATABASE_ID in .env.local to one of these IDs.`
    )
  }

  throw new Error(
    `No databases found connected to your Notion integration. In Notion, open your Notes database, click the ••• menu in the top-right corner -> Connections (or Connect to) -> select "Portfolio Notes" and confirm.`
  )
}

function getPlainText(richTextList: any[]): string {
  if (!Array.isArray(richTextList)) return ""
  return richTextList.map((item) => item.plain_text || "").join("").trim()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export type ParsedNotionNote = {
  notionPageId: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  featuredImage: string
  author: string
  tags: string[]
  published: boolean
  publishedAt: Date | null
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  featured: boolean
}

export function parseNotionProperties(page: any): Omit<ParsedNotionNote, "content"> {
  const props = page.properties || {}

  // Find Title
  let title = ""
  for (const key of Object.keys(props)) {
    const prop = props[key]
    if (prop.type === "title") {
      title = getPlainText(prop.title)
      break
    }
  }

  // Find Slug
  let slug = ""
  const slugProp = props.Slug || props.slug || props.Address || props.address || props.URL || props.url
  if (slugProp) {
    if (slugProp.type === "rich_text") slug = getPlainText(slugProp.rich_text)
    else if (slugProp.type === "url") slug = slugProp.url || ""
    else if (slugProp.type === "title") slug = getPlainText(slugProp.title)
  }
  if (!slug) {
    slug = slugify(title || "untitled-note")
  } else {
    slug = slugify(slug)
  }

  // Find Category
  let category = "Brand Strategy"
  const catProp = props.Category || props.category || props.Section || props.section || props.Topic || props.topic
  if (catProp) {
    if (catProp.type === "select" && catProp.select?.name) category = catProp.select.name
    else if (catProp.type === "multi_select" && catProp.multi_select?.[0]?.name) category = catProp.multi_select[0].name
    else if (catProp.type === "rich_text") category = getPlainText(catProp.rich_text) || category
  }

  // Find Excerpt
  let excerpt = ""
  const excProp =
    props.Excerpt || props.excerpt || props.Summary || props.summary || props.Description || props.description
  if (excProp) {
    if (excProp.type === "rich_text") excerpt = getPlainText(excProp.rich_text)
  }

  // Find Published status
  let published = true // Default to true if user doesn't have a specific status column
  const pubProp = props.Published || props.published || props.Status || props.status || props.State || props.state
  if (pubProp) {
    if (pubProp.type === "checkbox") {
      published = Boolean(pubProp.checkbox)
    } else if (pubProp.type === "status") {
      const name = pubProp.status?.name?.toLowerCase()
      published = name === "published" || name === "done" || name === "live" || name === "ready"
    } else if (pubProp.type === "select") {
      const name = pubProp.select?.name?.toLowerCase()
      published = name === "published" || name === "done" || name === "live" || name === "ready"
    }
  }

  // Find Published Date
  let publishedAt: Date | null = null
  const dateProp = props["Published Date"] || props["Published At"] || props.Date || props.date
  if (dateProp && dateProp.type === "date" && dateProp.date?.start) {
    publishedAt = new Date(dateProp.date.start)
  } else if (published) {
    publishedAt = new Date(page.created_time || Date.now())
  }

  // Find Featured Image / Cover
  let featuredImage = "/placeholder.jpg"
  if (page.cover) {
    if (page.cover.type === "external" && page.cover.external?.url) {
      featuredImage = page.cover.external.url
    } else if (page.cover.type === "file" && page.cover.file?.url) {
      featuredImage = page.cover.file.url
    }
  }
  const coverProp = props.Cover || props.cover || props["Featured Image"] || props.Image
  if (coverProp && coverProp.type === "files" && coverProp.files?.length > 0) {
    const file = coverProp.files[0]
    if (file.external?.url) featuredImage = file.external.url
    else if (file.file?.url) featuredImage = file.file.url
  }

  // Tags
  let tags: string[] = []
  const tagsProp = props.Tags || props.tags
  if (tagsProp && tagsProp.type === "multi_select") {
    tags = tagsProp.multi_select.map((item: any) => item.name).filter(Boolean)
  }

  // Author
  let author = "Prajesh Shakya"
  const authorProp = props.Author || props.author
  if (authorProp) {
    if (authorProp.type === "people" && authorProp.people?.[0]?.name) {
      author = authorProp.people[0].name
    } else if (authorProp.type === "rich_text") {
      const text = getPlainText(authorProp.rich_text)
      if (text) author = text
    } else if (authorProp.type === "select" && authorProp.select?.name) {
      author = authorProp.select.name
    }
  }

  // Featured
  let featured = false
  const featProp = props.Featured || props.featured
  if (featProp && featProp.type === "checkbox") {
    featured = Boolean(featProp.checkbox)
  }

  // SEO fields
  const seoTitleProp = props["SEO Title"] || props.seoTitle
  const seoDescProp = props["SEO Description"] || props.seoDescription
  const seoKeyProp = props["SEO Keywords"] || props.seoKeywords

  const seoTitle = seoTitleProp?.type === "rich_text" ? getPlainText(seoTitleProp.rich_text) : undefined
  const seoDescription = seoDescProp?.type === "rich_text" ? getPlainText(seoDescProp.rich_text) : undefined
  const seoKeywords = seoKeyProp?.type === "rich_text" ? getPlainText(seoKeyProp.rich_text) : undefined

  return {
    notionPageId: page.id,
    title: title || "Untitled Note",
    slug,
    category,
    excerpt,
    featuredImage,
    author,
    tags,
    published,
    publishedAt,
    seoTitle: seoTitle || undefined,
    seoDescription: seoDescription || undefined,
    seoKeywords: seoKeywords || undefined,
    featured,
  }
}

export async function getNotionPageMarkdown(pageId: string, client?: Client): Promise<string> {
  const notion = client || getNotionClient()
  if (!notion) return ""

  try {
    const n2m = new NotionToMarkdown({ notionClient: notion })
    const mdBlocks = await n2m.pageToMarkdown(pageId)
    const mdString = n2m.toMarkdownString(mdBlocks)
    return (mdString.parent || "").trim()
  } catch (error) {
    console.error(`[notion] Error generating markdown for page ${pageId}:`, error)
    return ""
  }
}

export async function fetchNotionNotes(): Promise<ParsedNotionNote[]> {
  const { databaseId, apiKey } = getNotionConfig()
  const notion = getNotionClient()

  if (!apiKey || !notion) {
    throw new Error("NOTION_API_KEY is not set in environment variables.")
  }

  // Resilient resolution: uses databaseId or auto-discovers from shared databases
  const targetDb = await resolveDatabaseId(notion, databaseId)

  try {
    const response = (await notion.request({
      path: `databases/${targetDb.id}/query`,
      method: "post",
      body: {},
    })) as { results: any[] }

    const pages = response.results || []
    const notes: ParsedNotionNote[] = []

    for (const page of pages) {
      if (!("properties" in page)) continue
      const meta = parseNotionProperties(page)
      const content = await getNotionPageMarkdown(page.id, notion)
      const excerpt = meta.excerpt || content.slice(0, 160).replace(/[#*`_[\]]/g, "").trim() + "…"

      notes.push({
        ...meta,
        excerpt,
        content: content || "*(No content)*",
      })
    }

    return notes
  } catch (error) {
    console.error(`[notion] Error querying database ${targetDb.id}:`, error)
    throw error
  }
}

export type SyncResult = {
  ok: boolean
  total: number
  added: number
  updated: number
  databaseTitle?: string
  errors: string[]
}

export async function syncNotionNotesToDatabase(): Promise<SyncResult> {
  const { apiKey } = getNotionConfig()
  if (!apiKey) {
    return {
      ok: false,
      total: 0,
      added: 0,
      updated: 0,
      errors: [
        `NOTION_API_KEY is missing. Please add NOTION_API_KEY=secret_... to your .env.local file.`,
      ],
    }
  }

  await ensureSchema()

  const result: SyncResult = {
    ok: true,
    total: 0,
    added: 0,
    updated: 0,
    errors: [],
  }

  try {
    const notes = await fetchNotionNotes()
    result.total = notes.length

    for (const note of notes) {
      try {
        // Check if note exists by notionPageId or slug
        const existing = await db
          .select({ id: blogPosts.id, notionPageId: blogPosts.notionPageId })
          .from(blogPosts)
          .where(
            or(
              eq(blogPosts.notionPageId, note.notionPageId),
              eq(blogPosts.slug, note.slug)
            )
          )
          .limit(1)

        const payload = {
          title: note.title,
          slug: note.slug,
          excerpt: note.excerpt,
          content: note.content,
          category: note.category,
          featuredImage: note.featuredImage,
          author: note.author,
          tags: note.tags,
          published: note.published,
          publishedAt: note.published ? note.publishedAt ?? new Date() : null,
          seoTitle: note.seoTitle ?? null,
          seoDescription: note.seoDescription ?? null,
          seoKeywords: note.seoKeywords ?? null,
          featured: note.featured,
          notionPageId: note.notionPageId,
          updatedAt: new Date(),
        }

        if (existing[0]) {
          await db
            .update(blogPosts)
            .set(payload)
            .where(eq(blogPosts.id, existing[0].id))
          result.updated++
        } else {
          await db.insert(blogPosts).values({
            ...payload,
            createdAt: new Date(),
          })
          result.added++
        }
      } catch (err: any) {
        console.error(`[notion] Error syncing note "${note.title}":`, err)
        result.errors.push(`"${note.title}": ${err?.message || "Unknown error"}`)
      }
    }

    // Revalidate public routes
    revalidatePath("/blog")
    revalidatePath("/blog/rss.xml")
    revalidatePath("/admin")
    revalidatePath("/sitemap.xml")

    return result
  } catch (error: any) {
    console.error("[notion] Sync failed:", error)
    return {
      ok: false,
      total: 0,
      added: 0,
      updated: 0,
      errors: [error?.message || "Failed to communicate with Notion API."],
    }
  }
}
