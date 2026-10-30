"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, X } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { cn } from "@/lib/utils"

export interface NoteItem {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  featuredImage?: string | null
  publishedAt?: Date | string | null
  author?: string
  tags?: string[]
}

interface NotesCatalogProps {
  posts: NoteItem[]
}

function formatDate(dateVal?: Date | string | null) {
  if (!dateVal) return "Recently published"
  const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal
  if (isNaN(date.getTime())) return "Recently published"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function estimateReadingTime(excerpt: string) {
  // Approximate 3-4 min read for editorial notes
  const words = excerpt.trim().split(/\s+/).length
  return words > 30 ? "4 min read" : "3 min read"
}

export function NotesCatalog({ posts }: NotesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Extract unique categories and counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length }
    posts.forEach((post) => {
      const cat = post.category || "General"
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [posts])

  const categories = useMemo(() => {
    return Object.keys(categoryCounts)
  }, [categoryCounts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" ||
        post.category.toLowerCase() === activeCategory.toLowerCase()

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(query)))

      return matchesCategory && matchesSearch
    })
  }, [posts, activeCategory, searchQuery])

  return (
    <div className="mt-14 space-y-10">
      {/* Controls Bar: Topic Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        {/* Sun Yi-Style Topics Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mr-2">
            Topics:
          </span>
          {categories.map((category) => {
            const isActive = activeCategory.toLowerCase() === category.toLowerCase()
            const count = categoryCounts[category] || 0
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs tracking-wide transition-all cursor-pointer border flex items-center gap-1.5",
                  isActive
                    ? "bg-foreground text-background border-foreground font-medium"
                    : "bg-secondary/40 text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                )}
              >
                <span>{category}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    isActive ? "text-background/80" : "text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <label htmlFor="notes-search" className="sr-only">
            Search notes
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              id="notes-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-secondary/30 border border-border rounded-sm pl-9 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header (if filtered) */}
      {(activeCategory !== "All" || searchQuery) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? "note" : "notes"}
            {activeCategory !== "All" && ` in "${activeCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("All")
              setSearchQuery("")
            }}
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Grid of Note Cards in Sun Yi format */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredPosts.map((post) => {
            const hasImage =
              post.featuredImage && !post.featuredImage.startsWith("/placeholder")

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between border border-border bg-background transition-all duration-300 hover:border-foreground/50 hover:bg-secondary/15 rounded-sm overflow-hidden"
              >
                {/* 16:9 Thumbnail Image */}
                <div className="aspect-[16/9] w-full overflow-hidden border-b border-border bg-secondary/20 relative">
                  {hasImage ? (
                    <img
                      src={post.featuredImage!}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    /* Elegant Fallback Monogram Graphic */
                    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-secondary/30 relative">
                      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px]" />
                      <BrandMark className="h-10 w-10 text-muted-foreground/60 transition-transform duration-300 group-hover:scale-110" />
                      <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80">
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content Box */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Category Label (post-category) */}
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground block">
                      {post.category}
                    </span>

                    {/* Note Title */}
                    <h2 className="mt-2.5 font-serif text-2xl lg:text-[26px] leading-[1.2] tracking-tight text-foreground transition-colors group-hover:text-accent">
                      {post.title}
                    </h2>

                    {/* Scroll-Stopping Excerpt Hook */}
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Card Bottom Meta & CTA */}
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                    <time className="font-mono text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </time>
                    <span className="font-medium text-foreground inline-flex items-center gap-1 transition-transform group-hover:translate-x-1">
                      Read note
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-border/70 bg-secondary/20 p-12 text-center rounded-sm max-w-lg mx-auto">
          <p className="font-serif text-2xl text-foreground">No notes found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? `No notes matched "${searchQuery}". Try a different keyword.`
              : "No notes are currently published under this topic."}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("All")
              setSearchQuery("")
            }}
            className="mt-6 inline-flex px-4 py-2 bg-foreground text-background text-xs uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity"
          >
            View all notes
          </button>
        </div>
      )}
    </div>
  )
}
