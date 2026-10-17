import { getPublishedPosts } from "@/lib/public-content"
import { SITE_NAME, SITE_URL } from "@/lib/site"

// RSS feed for Notes: /blog/rss.xml. Refreshed with the rest of the site.
export const revalidate = 300

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")

export async function GET() {
  const posts = (await getPublishedPosts()).sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const image = post.featuredImage && !post.featuredImage.startsWith("/placeholder") ? (post.featuredImage.startsWith("/") ? `${SITE_URL}${post.featuredImage}` : post.featuredImage) : null
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        post.publishedAt ? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>` : "",
        `<description>${escapeXml(post.excerpt)}</description>`,
        `<category>${escapeXml(post.category)}</category>`,
        `<dc:creator>${escapeXml(post.author)}</dc:creator>`,
        image ? `<enclosure url="${escapeXml(image)}" type="image/${image.endsWith(".png") ? "png" : "jpeg"}" length="0" />` : "",
        "</item>",
      ].filter(Boolean).join("")
    })
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${escapeXml(`Notes — ${SITE_NAME}`)}</title>
<link>${SITE_URL}/blog</link>
<description>Notes on brand strategy and identity design by ${escapeXml(SITE_NAME)}.</description>
<language>en</language>
<atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${posts[0]?.publishedAt ? `<lastBuildDate>${posts[0].publishedAt.toUTCString()}</lastBuildDate>` : ""}
${items}
</channel>
</rss>`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
