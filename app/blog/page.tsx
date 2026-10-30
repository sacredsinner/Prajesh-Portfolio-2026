import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPublishedPosts } from "@/lib/public-content"
import { NotesHero } from "@/components/notes/notes-hero"
import { NotesCatalog } from "@/components/notes/notes-catalog"

export const metadata: Metadata = {
  title: "Brand Strategy Notes — Prajesh Shakya",
  description:
    "Sharp, contrarian notes on brand strategy, positioning, identity craft, and the psychology behind meaningful brands.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": [{ url: "/blog/rss.xml", title: "Notes — Prajesh Shakya" }],
    },
  },
}

// Pages are cached and refreshed every 5 minutes, and immediately when content is saved in /admin.
export const revalidate = 300

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <Navbar />
      <main className="page-container pb-28 pt-32">
        <NotesHero />
        <NotesCatalog posts={posts} />
      </main>
      <Footer newsletter={false} />
    </>
  )
}
