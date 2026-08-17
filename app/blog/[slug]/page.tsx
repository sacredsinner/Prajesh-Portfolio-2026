import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"
import { getPublishedPost } from "@/lib/public-content"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  return post ? { title: post.seoTitle || `${post.title} — Prajesh Shakya`, description: post.seoDescription || post.excerpt, keywords: post.seoKeywords?.split(",").map((keyword) => keyword.trim()).filter(Boolean) } : { title: "Note Not Found" }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post) notFound()
  return <><Navbar /><main className="w-full px-4 pb-24 pt-32 sm:px-6 lg:px-8"><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{post.category}</p><h1 className="mt-5 font-serif text-5xl tracking-tight text-balance">{post.title}</h1><p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p><div className="mt-12 whitespace-pre-wrap border-t border-border pt-10 text-base leading-8">{post.content}</div></main><Footer /></>
}
