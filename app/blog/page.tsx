import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPublishedPosts } from "@/lib/public-content"

export const metadata: Metadata = {
  title: "Brand Strategy Notes — Prajesh Shakya",
  description: "I write about brand strategy, identity design, and the thinking behind meaningful brands.",
}

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  return <><Navbar /><main className="w-full px-4 pb-24 pt-32 sm:px-6 lg:px-8"><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Notes</p><h1 className="mt-4 max-w-2xl font-serif text-5xl tracking-tight">Thinking about identity, strategy, and making brands matter.</h1><div className="mt-16 grid gap-6 md:grid-cols-2">{posts.map((post) => <a href={`/blog/${post.slug}`} key={post.id} className="group border-t border-border pt-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{post.category}</p><h2 className="mt-3 font-serif text-3xl group-hover:text-accent">{post.title}</h2><p className="mt-3 max-w-lg text-muted-foreground">{post.excerpt}</p><p className="mt-6 text-sm">Read article →</p></a>)}</div></main><Footer /></>
}
