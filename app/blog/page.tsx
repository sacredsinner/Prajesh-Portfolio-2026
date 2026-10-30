import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPublishedPosts } from "@/lib/public-content"

export const metadata: Metadata = {
  title: "Brand Strategy Notes — Prajesh Shakya",
  description: "I write about brand strategy, identity design, and the thinking behind meaningful brands.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "Notes — Prajesh Shakya" }] } },
}

// Pages are cached and refreshed every 5 minutes, and immediately when content is saved in /admin.
export const revalidate = 300

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  return (
    <>
      <Navbar />
      <main className="page-container pb-24 pt-32">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Notes</p>
        <h1 className="mt-4 max-w-2xl font-serif text-5xl tracking-tight">
          Thinking about identity, strategy, and making brands matter.
        </h1>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="group border-t border-border pt-5">
              {post.featuredImage && !post.featuredImage.startsWith("/placeholder") && (
                <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-secondary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              )}
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{post.category}</p>
              <h2 className="mt-3 font-serif text-3xl group-hover:text-accent transition-colors">{post.title}</h2>
              <p className="mt-3 max-w-lg text-muted-foreground line-clamp-3">{post.excerpt}</p>
              <p className="mt-6 text-sm font-medium">Read article →</p>
            </Link>
          ))}
        </div>
        {posts.length === 0 && <p className="mt-16 text-muted-foreground">New notes are on their way.</p>}
      </main>
      <Footer />
    </>
  )
}
