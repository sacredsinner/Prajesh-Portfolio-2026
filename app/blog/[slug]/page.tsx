import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Markdown } from "@/components/markdown"
import type { Metadata } from "next"
import { getPublishedPost } from "@/lib/public-content"
import { JsonLd, PERSON_ID, absoluteUrl, person } from "@/components/json-ld"
import { SITE_URL } from "@/lib/site"

// Pages are cached and refreshed every 5 minutes, and immediately when content is saved in /admin.
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) return { title: "Note Not Found" }
  const title = post.seoTitle || `${post.title} — Prajesh Shakya`
  const description = post.seoDescription || post.excerpt
  const image = post.featuredImage && !post.featuredImage.startsWith("/placeholder") ? post.featuredImage : undefined
  return {
    title,
    description,
    keywords: post.seoKeywords?.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: `/blog/${post.slug}`, types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "Notes — Prajesh Shakya" }] } },
    openGraph: { title, description, type: "article", publishedTime: post.publishedAt?.toISOString(), modifiedTime: post.updatedAt?.toISOString(), authors: [post.author], tags: post.tags, ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: post.title }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image] } : {}) },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) notFound()
  const published = post.publishedAt ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(post.publishedAt) : null
  const image = post.featuredImage && !post.featuredImage.startsWith("/placeholder") ? absoluteUrl(post.featuredImage) : undefined
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    ...(image ? { image } : {}),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    articleSection: post.category,
    keywords: post.tags?.join(", ") || undefined,
    author: post.author === person.name ? person : { "@type": "Person", name: post.author },
    publisher: { "@id": PERSON_ID },
  }
  return (
    <>
      <JsonLd data={articleSchema} />
      <Navbar />
      <main className="page-container pb-24 pt-32">
        <article className="max-w-3xl">
          <Link href="/blog" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">← All notes</Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {post.category}{published ? ` · ${published}` : ""}
          </p>
          <h1 className="mt-5 font-serif text-5xl tracking-tight text-balance">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="mt-12 border-t border-border pt-10">
            <Markdown content={post.content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
