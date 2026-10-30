"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  deleteContact,
  deletePost,
  deleteProject,
  deleteTestimonial,
  duplicateProject,
  savePost,
  saveProject,
  saveTestimonial,
  seedDemoProjects,
  syncNotionNotesAction,
  updateContact,
} from "@/app/actions/cms"
import { uploadToBlob } from "@/lib/upload-client"
import { makeSlug } from "@/lib/utils"
import { AdminVideoManager } from "@/components/admin-video-manager"
import { OverviewPanel } from "@/components/admin/overview-panel"
import { AdminHeader, type AdminSection } from "@/components/admin/admin-header"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import type { Overview } from "@/lib/overview"
import { replyToContact, sendAdminEmail, syncLeadsToResend } from "@/app/actions/email"
import { RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"

type Project = {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  status?: string | null
  category: string
  year: string
  thumbnail: string
  client: string | null
  overview: string | null
  problem: string | null
  approach: string | null
  solution: string | null
  outcome: string | null
  images: string[]
  blocks?: any[]
  blocksCount?: number
  featured: boolean
  seoTitle: string | null
  seoDescription: string | null
}

type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  featuredImage: string
  author: string
  tags: string[]
  published: boolean
  publishedAt: Date | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  featured: boolean
}

type Contact = {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  status: string
  notes: string | null
  createdAt: Date | null
  packageInterest?: string | null
  budget?: string | null
  timeline?: string | null
}

type Testimonial = {
  id: string
  quote: string
  clientName: string
  clientRole: string | null
  company: string | null
  avatarUrl: string | null
  featured: boolean
  published: boolean
  sortOrder: number
}

type ShowcaseVideo = {
  id: number
  pathname: string
  url: string
  filename: string
  contentType: string
  sizeBytes: number
  isActive: boolean
  createdAt: Date
}

type Props = {
  initialTab?: string
  user: { name: string; email: string }
  projects: Project[]
  posts: Post[]
  contacts: Contact[]
  testimonials: Testimonial[]
  showcaseVideos: ShowcaseVideo[]
  overview: Overview
}

type AdminTab = "overview" | "projects" | "posts" | "testimonials" | "contacts" | "showcase" | "email"
const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function AdminDashboard({
  initialTab,
  user,
  projects,
  posts,
  contacts,
  testimonials,
  showcaseVideos,
  overview,
}: Props) {
  const router = useRouter()
  const validTabs: AdminTab[] = ["overview", "projects", "posts", "testimonials", "contacts", "showcase", "email"]
  const startingTab: AdminTab = validTabs.includes(initialTab as AdminTab) ? (initialTab as AdminTab) : "overview"

  const [tab, setTab] = useState<AdminTab>(startingTab)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  // Local state for optimistic updates
  const [projectsList, setProjectsList] = useState<Project[]>(projects)
  const [postsList, setPostsList] = useState<Post[]>(posts)
  const [contactsList, setContactsList] = useState<Contact[]>(contacts)
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>(testimonials)

  // Confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: "project" | "post" | "testimonial" | "contact"
    id: string
    title: string
  } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Search & Filter state
  const [projectSearch, setProjectSearch] = useState("")
  const [projectStatus, setProjectStatus] = useState<"all" | "published" | "draft" | "scheduled">("all")

  const [contactSearch, setContactSearch] = useState("")
  const [contactStatus, setContactStatus] = useState<"all" | "new" | "read" | "replied" | "archived">("all")

  const [postSearch, setPostSearch] = useState("")
  const [postStatus, setPostStatus] = useState<"all" | "published" | "draft">("all")

  // Keep state synced with server props when router.refresh() completes
  useEffect(() => { setProjectsList(projects) }, [projects])
  useEffect(() => { setPostsList(posts) }, [posts])
  useEffect(() => { setContactsList(contacts) }, [contacts])
  useEffect(() => { setTestimonialsList(testimonials) }, [testimonials])

  function go(next: AdminTab) {
    setTab(next)
    setEditingPost(null)
    setEditingTestimonial(null)
    router.replace(`/admin?tab=${next}`, { scroll: false })
  }

  function newTestimonial() {
    setEditingTestimonial({
      id: "",
      quote: "",
      clientName: "",
      clientRole: "",
      company: "",
      avatarUrl: null,
      featured: false,
      published: true,
      sortOrder: testimonialsList.length,
    })
  }

  async function executeDelete() {
    if (!deleteTarget) return
    const { kind, id, title } = deleteTarget
    setDeleteLoading(true)

    // Optimistically update
    if (kind === "project") setProjectsList((prev) => prev.filter((p) => p.id !== id))
    if (kind === "post") setPostsList((prev) => prev.filter((p) => p.id !== id))
    if (kind === "testimonial") setTestimonialsList((prev) => prev.filter((t) => t.id !== id))
    if (kind === "contact") setContactsList((prev) => prev.filter((c) => c.id !== id))

    try {
      if (kind === "project") await deleteProject(id)
      if (kind === "post") await deletePost(id)
      if (kind === "testimonial") await deleteTestimonial(id)
      if (kind === "contact") await deleteContact(id)
      toast.success(`${title} deleted permanently`)
      router.refresh()
    } catch {
      toast.error("Could not delete item. Please retry.")
      router.refresh()
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  async function handleDuplicateProject(id: string) {
    const toastId = toast.loading("Duplicating project…")
    try {
      const res = await duplicateProject(id)
      if (res.ok) {
        toast.success("Project duplicated successfully", { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error, { id: toastId })
      }
    } catch {
      toast.error("Could not duplicate project.", { id: toastId })
    }
  }

  const [seeding, setSeeding] = useState(false)
  async function handleSeedDemoProjects() {
    setSeeding(true)
    const toastId = toast.loading("Seeding 4 demo projects…")
    try {
      const res = await seedDemoProjects()
      if (res.ok) {
        toast.success(`Successfully seeded ${res.count} demo projects!`, { id: toastId })
        router.refresh()
      } else {
        toast.error(res.error, { id: toastId })
      }
    } catch {
      toast.error("Could not seed projects. Check database connection.", { id: toastId })
    } finally {
      setSeeding(false)
    }
  }

  const [syncingNotion, setSyncingNotion] = useState(false)
  async function handleSyncNotion() {
    setSyncingNotion(true)
    const toastId = toast.loading("Syncing notes from Notion…")
    try {
      const res = await syncNotionNotesAction()
      if (res.ok) {
        const titleStr = res.databaseTitle ? ` from "${res.databaseTitle}"` : ""
        toast.success(
          `Notion sync complete: ${res.added} added, ${res.updated} updated${titleStr} (${res.total} total)`,
          { id: toastId }
        )
        router.refresh()
      } else {
        toast.error(res.errors?.[0] || "Failed to sync notes from Notion", { id: toastId, duration: 8000 })
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not sync from Notion. Check your API credentials.", { id: toastId })
    } finally {
      setSyncingNotion(false)
    }
  }

  // Filtered collections
  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const matchesSearch =
        !projectSearch ||
        p.title?.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(projectSearch.toLowerCase())
      const matchesStatus =
        projectStatus === "all" ||
        (projectStatus === "published" && (!p.status || p.status === "published")) ||
        p.status === projectStatus
      return matchesSearch && matchesStatus
    })
  }, [projectsList, projectSearch, projectStatus])

  const filteredContacts = useMemo(() => {
    return contactsList.filter((c) => {
      const matchesSearch =
        !contactSearch ||
        c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.company?.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.message?.toLowerCase().includes(contactSearch.toLowerCase())
      const matchesStatus = contactStatus === "all" || c.status === contactStatus
      return matchesSearch && matchesStatus
    })
  }, [contactsList, contactSearch, contactStatus])

  const filteredPosts = useMemo(() => {
    return postsList.filter((p) => {
      const matchesSearch =
        !postSearch ||
        p.title?.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(postSearch.toLowerCase()) ||
        p.slug?.toLowerCase().includes(postSearch.toLowerCase())
      const matchesStatus =
        postStatus === "all" ||
        (postStatus === "published" ? p.published : !p.published)
      return matchesSearch && matchesStatus
    })
  }, [postsList, postSearch, postStatus])

  const actionNode = (
    <>
      {tab === "projects" && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDemoProjects}
            disabled={seeding}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50 transition-colors"
            title="Seed 4 rich demo projects into the database"
          >
            {seeding ? "Seeding…" : "Seed 4 Demo Projects"}
          </button>
          <Link
            href="/admin/projects/new"
            className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
          >
            Create project
          </Link>
        </div>
      )}

      {tab === "posts" && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncNotion}
            disabled={syncingNotion}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50 transition-colors"
            title="Sync notes from Notion database"
          >
            <RefreshCw className={`size-3.5 ${syncingNotion ? "animate-spin" : ""}`} />
            <span>{syncingNotion ? "Syncing…" : "Sync from Notion"}</span>
          </button>
          <button
            onClick={() => {
              setEditingPost({
                id: "",
                slug: "",
                title: "",
                excerpt: "",
                content: "",
                category: "Brand Strategy",
                featuredImage: "/placeholder.jpg",
                author: user.name,
                tags: [],
                published: false,
                publishedAt: null,
                seoTitle: "",
                seoDescription: "",
                seoKeywords: "",
                featured: false,
              })
            }}
            className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
          >
            Create note
          </button>
        </div>
      )}

      {tab === "testimonials" && !editingTestimonial && (
        <button
          onClick={newTestimonial}
          className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
        >
          Add testimonial
        </button>
      )}
    </>
  )

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminHeader
          active={tab}
          user={user}
          counts={{
            projects: projectsList.length,
            posts: postsList.length,
            contacts: contactsList.filter((c) => c.status === "new").length,
            testimonials: testimonialsList.length,
            showcase: showcaseVideos.length,
          }}
          onTabChange={(section) => {
            if (validTabs.includes(section as AdminTab)) {
              go(section as AdminTab)
            }
          }}
          actions={actionNode}
        />

        <div className="mt-6">
          {tab === "overview" && <OverviewPanel data={overview} onOpenContacts={() => go("contacts")} />}
          {tab === "email" && <EmailComposer contacts={contactsList} onMessage={(msg) => toast.info(msg)} />}

          {/* PROJECTS TAB */}
          {tab === "projects" && (
            <section className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search projects by title, category, slug…"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-foreground"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["all", "published", "draft", "scheduled"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setProjectStatus(status)}
                      className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                        projectStatus === status
                          ? "bg-foreground text-background font-medium"
                          : "border border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {status}
                      <span className="ml-1 text-[10px] opacity-75">
                        (
                        {status === "all"
                          ? projectsList.length
                          : projectsList.filter((p) =>
                              status === "published"
                                ? !p.status || p.status === "published"
                                : p.status === status
                            ).length}
                        )
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {filteredProjects.map((row) => (
                  <article
                    key={row.id}
                    className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:border-foreground/40"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {row.thumbnail && (
                        <img
                          src={row.thumbnail}
                          alt={row.title}
                          className="size-14 rounded-lg object-cover bg-secondary shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            {row.category} · {row.year}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${
                              row.status === "draft"
                                ? "bg-secondary text-muted-foreground"
                                : row.status === "scheduled"
                                ? "bg-amber-500/20 text-amber-700"
                                : "bg-[#1c6538]/15 text-[#1c6538]"
                            }`}
                          >
                            {row.status || "published"}
                          </span>
                          {((row.blocksCount !== undefined && row.blocksCount > 0) || (row.blocks && row.blocks.length > 0)) && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                              {row.blocksCount ?? row.blocks?.length} blocks
                            </span>
                          )}
                        </div>
                        <h2 className="mt-1 font-serif text-xl truncate">{row.title || "Untitled"}</h2>
                        <p className="text-xs text-muted-foreground truncate">/projects/{row.slug || "no-slug"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/projects/${row.id}`}
                        className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background hover:opacity-90 transition-opacity"
                      >
                        Edit in Builder
                      </Link>
                      <button
                        onClick={() => handleDuplicateProject(row.id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            kind: "project",
                            id: row.id,
                            title: row.title || "Untitled project",
                          })
                        }
                        className="rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}

                {filteredProjects.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      {projectsList.length === 0
                        ? "No projects found in database."
                        : "No projects match your filter or search."}
                    </p>
                    {projectsList.length === 0 ? (
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          onClick={handleSeedDemoProjects}
                          disabled={seeding}
                          className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {seeding ? "Seeding…" : "Seed 4 Demo Projects"}
                        </button>
                        <Link
                          href="/admin/projects/new"
                          className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                        >
                          Create first project
                        </Link>
                      </div>
                    ) : (
                      (projectSearch || projectStatus !== "all") && (
                        <button
                          onClick={() => {
                            setProjectSearch("")
                            setProjectStatus("all")
                          }}
                          className="mt-2 text-xs underline underline-offset-4"
                        >
                          Clear filters
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* NOTES / POSTS TAB */}
          {tab === "posts" && editingPost && (
            <PostEditor
              item={editingPost}
              onCancel={() => setEditingPost(null)}
              onDone={() => {
                setEditingPost(null)
                toast.success("Note saved successfully.")
                router.refresh()
              }}
              onError={(err) => toast.error(err)}
            />
          )}

          {tab === "posts" && !editingPost && (
            <section className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search notes by title or category…"
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-foreground"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["all", "published", "draft"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setPostStatus(status)}
                      className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                        postStatus === status
                          ? "bg-foreground text-background font-medium"
                          : "border border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {status}
                      <span className="ml-1 text-[10px] opacity-75">
                        (
                        {status === "all"
                          ? postsList.length
                          : postsList.filter((p) =>
                              status === "published" ? p.published : !p.published
                            ).length}
                        )
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {filteredPosts.map((row) => (
                  <article
                    key={row.id}
                    className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:border-foreground/40"
                  >
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {row.category} · {row.published ? "Published" : "Draft"}
                      </p>
                      <h2 className="mt-1 font-serif text-xl truncate">{row.title || "Untitled"}</h2>
                      <p className="text-xs text-muted-foreground truncate">/blog/{row.slug || "no-slug"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditingPost(row)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            kind: "post",
                            id: row.id,
                            title: row.title || "Untitled note",
                          })
                        }
                        className="rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}

                {filteredPosts.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      {postsList.length === 0
                        ? "No notes found in database."
                        : "No notes match your filter or search."}
                    </p>
                    {postsList.length === 0 ? (
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          onClick={handleSyncNotion}
                          disabled={syncingNotion}
                          className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <RefreshCw className={`size-3.5 ${syncingNotion ? "animate-spin" : ""}`} />
                          <span>{syncingNotion ? "Syncing…" : "Sync from Notion"}</span>
                        </button>
                      </div>
                    ) : (
                      (postSearch || postStatus !== "all") && (
                        <button
                          onClick={() => {
                            setPostSearch("")
                            setPostStatus("all")
                          }}
                          className="mt-2 text-xs underline underline-offset-4"
                        >
                          Clear filters
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SHOWCASE TAB */}
          {tab === "showcase" && <AdminVideoManager videos={showcaseVideos} />}

          {/* TESTIMONIALS TAB */}
          {tab === "testimonials" && editingTestimonial && (
            <TestimonialEditor
              item={editingTestimonial}
              onCancel={() => setEditingTestimonial(null)}
              onDone={() => {
                setEditingTestimonial(null)
                toast.success("Testimonial saved.")
                router.refresh()
              }}
              onError={(err) => toast.error(err)}
            />
          )}

          {tab === "testimonials" && !editingTestimonial && (
            <section className="grid gap-3">
              {testimonialsList.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm italic">“{testimonial.quote}”</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {[testimonial.clientName, testimonial.clientRole, testimonial.company]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      · {testimonial.published ? "Published" : "Hidden"}
                      {testimonial.featured ? " · Featured" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTestimonial({
                          ...testimonial,
                          clientRole: testimonial.clientRole ?? "",
                          company: testimonial.company ?? "",
                        })
                      }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          kind: "testimonial",
                          id: testimonial.id,
                          title: `Testimonial from ${testimonial.clientName}`,
                        })
                      }
                      className="rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
              {testimonialsList.length === 0 && <p className="text-muted-foreground text-sm">Nothing here yet.</p>}
            </section>
          )}

          {/* CONTACTS TAB */}
          {tab === "contacts" && (
            <section className="grid gap-4">
              <LeadsSync />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search enquiries by name, email, company…"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-foreground"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["all", "new", "read", "replied", "archived"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setContactStatus(status)}
                      className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                        contactStatus === status
                          ? "bg-foreground text-background font-medium"
                          : "border border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {status}
                      <span className="ml-1 text-[10px] opacity-75">
                        (
                        {status === "all"
                          ? contactsList.length
                          : contactsList.filter((c) => c.status === status).length}
                        )
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {filteredContacts.map((contact) => (
                  <article
                    key={contact.id}
                    className="rounded-xl border border-border p-4 transition-colors hover:border-foreground/30"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-serif text-xl">
                            {contact.name}
                            {contact.company ? ` · ${contact.company}` : ""}
                          </h2>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-mono ${
                              contact.status === "new"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {contact.status}
                          </span>
                        </div>
                        <a href={`mailto:${contact.email}`} className="text-xs text-muted-foreground hover:underline">
                          {contact.email}
                        </a>
                        {(contact.packageInterest || contact.budget || contact.timeline) && (
                          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                            {[contact.packageInterest, contact.budget, contact.timeline].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{contact.message}</p>
                        {contact.notes && (
                          <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-muted-foreground bg-secondary/50 p-2.5 rounded-lg">
                            {contact.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setReplyingTo(replyingTo === contact.id ? null : contact.id)}
                          className="rounded-lg bg-foreground px-3 py-1.5 text-xs text-background hover:opacity-90 transition-opacity"
                        >
                          {replyingTo === contact.id ? "Cancel" : "Reply"}
                        </button>

                        <select
                          value={contact.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value
                            setContactsList((prev) =>
                              prev.map((c) => (c.id === contact.id ? { ...c, status: newStatus } : c))
                            )
                            try {
                              await updateContact(contact.id, newStatus, contact.notes ?? "")
                              toast.success(`Contact marked as "${newStatus}"`)
                            } catch {
                              toast.error("Could not update status. Please reload.")
                              router.refresh()
                            }
                          }}
                          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-foreground"
                        >
                          <option value="new">new</option>
                          <option value="read">read</option>
                          <option value="replied">replied</option>
                          <option value="archived">archived</option>
                        </select>

                        <button
                          onClick={() =>
                            setDeleteTarget({
                              kind: "contact",
                              id: contact.id,
                              title: `Enquiry from ${contact.name}`,
                            })
                          }
                          className="rounded-lg border border-destructive px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {replyingTo === contact.id && (
                      <ContactReply contact={contact} onClose={() => setReplyingTo(null)} />
                    )}
                  </article>
                ))}

                {filteredContacts.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No enquiries match your filter or search.</p>
                    {(contactSearch || contactStatus !== "all") && (
                      <button
                        onClick={() => {
                          setContactSearch("")
                          setContactStatus("all")
                        }}
                        className="mt-2 text-xs underline underline-offset-4"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.kind || "item"}`}
        description={`Are you sure you want to permanently delete "${deleteTarget?.title || "this item"}"? This action cannot be undone.`}
        confirmLabel="Delete permanently"
        loading={deleteLoading}
        onConfirm={executeDelete}
      />
    </main>
  )
}

function PostEditor({
  item,
  onDone,
  onCancel,
  onError,
}: {
  item: Post
  onDone: () => void
  onCancel: () => void
  onError: (message: string) => void
}) {
  const [data, setData] = useState<any>(item)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const set = (key: string, value: unknown) => setData((old: any) => ({ ...old, [key]: value }))

  async function upload(file: File, key: string) {
    setBusy(true)
    try {
      setError("")
      set(key, (await uploadToBlob(file, "portfolio")).url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    onError("")
    try {
      const result = await savePost({
        ...data,
        id: data.id || undefined,
        slug: makeSlug(data.slug || data.title),
        tags: typeof data.tags === "string" ? data.tags.split(",").map((x: string) => x.trim()).filter(Boolean) : data.tags,
        published: Boolean(data.published),
        publishedAt: data.published ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onDone()
    } catch {
      setError("Couldn't save note. Please retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">{data.id ? "Edit" : "Create"} note</h2>
        <button type="button" onClick={onCancel} className="text-sm underline">
          Cancel
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Title
          <input
            className={inputClass}
            value={data.title}
            onChange={(e) => {
              set("title", e.target.value)
              if (!data.id) set("slug", makeSlug(e.target.value))
            }}
            required
          />
        </label>
        <label className="grid gap-2 text-sm">
          Slug
          <input className={inputClass} value={data.slug} onChange={(e) => set("slug", makeSlug(e.target.value))} required />
        </label>
        <label className="grid gap-2 text-sm">
          Category
          <input className={inputClass} value={data.category} onChange={(e) => set("category", e.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm">
          Author
          <input className={inputClass} value={data.author} onChange={(e) => set("author", e.target.value)} required />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        Excerpt
        <textarea className={inputClass} rows={2} value={data.excerpt} onChange={(e) => set("excerpt", e.target.value)} required />
      </label>
      <label className="grid gap-2 text-sm">
        Content (Markdown)
        <textarea className={inputClass} rows={12} value={data.content} onChange={(e) => set("content", e.target.value)} required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Featured image
          <input className={inputClass} value={data.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} required />
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "featuredImage")} />
        </label>
        <label className="grid gap-2 text-sm">
          Tags (comma separated)
          <input
            className={inputClass}
            value={Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || ""}
            onChange={(e) => set("tags", e.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          SEO title
          <input className={inputClass} value={data.seoTitle || ""} onChange={(e) => set("seoTitle", e.target.value)} />
        </label>
        <label className="grid gap-2 text-sm">
          SEO description
          <input className={inputClass} value={data.seoDescription || ""} onChange={(e) => set("seoDescription", e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.published} onChange={(e) => set("published", e.target.checked)} /> Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="w-fit rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">
        {busy ? "Saving…" : "Save note"}
      </button>
    </form>
  )
}

function ContactReply({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [subject, setSubject] = useState(`Re: your enquiry on prajeshshakya.com`)
  const [body, setBody] = useState(
    `Hi ${contact.name.split(" ")[0]},\n\nThanks for reaching out! I'd love to learn more about your project.\n\nBest,\nPrajesh`
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const result = await replyToContact({ contactId: contact.id, subject, body })
      if (!result.ok) {
        setError(result.error)
        setBusy(false)
        return
      }
      toast.success("Reply sent successfully!")
      onClose()
    } catch {
      setError("Couldn't send the reply. Check your Resend API key and network connection.")
      setBusy(false)
    }
  }

  return (
    <form onSubmit={send} className="mt-4 grid gap-3 border-t border-border pt-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Reply directly</p>
      <label className="grid gap-1 text-sm">
        Subject
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </label>
      <label className="grid gap-1 text-sm">
        Message
        <textarea className={inputClass} rows={6} value={body} onChange={(e) => setBody(e.target.value)} required />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-4">
        <button disabled={busy} className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-50">
          {busy ? "Sending…" : "Send reply"}
        </button>
        <button type="button" onClick={onClose} className="text-sm underline">
          Cancel
        </button>
      </div>
    </form>
  )
}

function TestimonialEditor({
  item,
  onCancel,
  onDone,
  onError,
}: {
  item: Testimonial
  onCancel: () => void
  onDone?: () => void
  onError: (message: string) => void
}) {
  const [data, setData] = useState<Testimonial>(item)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const set = <K extends keyof Testimonial>(key: K, value: Testimonial[K]) => setData((old) => ({ ...old, [key]: value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    onError("")
    try {
      const result = await saveTestimonial({
        id: data.id || undefined,
        quote: data.quote,
        clientName: data.clientName,
        clientRole: data.clientRole?.trim() || null,
        company: data.company?.trim() || null,
        avatarUrl: data.avatarUrl || null,
        featured: data.featured,
        published: data.published,
        sortOrder: Number(data.sortOrder) || 0,
      })
      if (!result.ok) {
        setError(result.error)
        setBusy(false)
        return
      }
      if (onDone) onDone()
    } catch {
      setError("Couldn't save testimonial. Please retry.")
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">{data.id ? "Edit" : "Add"} testimonial</h2>
        <button type="button" onClick={onCancel} className="text-sm underline">
          Cancel
        </button>
      </div>
      <label className="grid gap-2 text-sm">
        Quote
        <textarea
          className={inputClass}
          rows={4}
          value={data.quote}
          onChange={(e) => set("quote", e.target.value)}
          minLength={10}
          required
          placeholder="What the client said, in their words"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm">
          Name
          <input className={inputClass} value={data.clientName} onChange={(e) => set("clientName", e.target.value)} minLength={2} required />
        </label>
        <label className="grid gap-2 text-sm">
          Role
          <input className={inputClass} value={data.clientRole ?? ""} onChange={(e) => set("clientRole", e.target.value)} placeholder="Founder" />
        </label>
        <label className="grid gap-2 text-sm">
          Company
          <input className={inputClass} value={data.company ?? ""} onChange={(e) => set("company", e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.published} onChange={(e) => set("published", e.target.checked)} /> Show on the site
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured (shown first)
        </label>
        <label className="flex items-center gap-2 text-sm">
          Order
          <input
            type="number"
            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            value={data.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="w-fit rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">
        {busy ? "Saving…" : "Save testimonial"}
      </button>
    </form>
  )
}

function LeadsSync() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSync() {
    setBusy(true)
    setResult(null)
    try {
      const res = await syncLeadsToResend()
      if (res.ok) {
        toast.success(`Synced leads (${res.added} added, ${res.existing} existing)`)
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Could not sync leads. Check network and API credentials.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-serif text-lg">Resend audience sync</h3>
        <p className="text-xs text-muted-foreground">
          Push all contact enquiries into your Resend &quot;Leads&quot; segment for newsletter outreach.
        </p>
      </div>
      <button
        onClick={handleSync}
        disabled={busy}
        className="self-start rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50 transition-colors"
      >
        {busy ? "Syncing…" : "Sync leads to Resend"}
      </button>
    </div>
  )
}

function EmailComposer({ contacts, onMessage }: { contacts: Contact[]; onMessage: (msg: string) => void }) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!to || !subject || !body) return
    setBusy(true)
    try {
      const res = await sendAdminEmail({ to, subject, html: `<p style="white-space: pre-wrap;">${body}</p>` })
      if (res.ok) {
        toast.success(`Email sent to ${to}`)
        setSubject("")
        setBody("")
        setTo("")
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Failed to send email.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={send} className="grid max-w-2xl gap-4 rounded-xl border border-border p-5">
      <h2 className="font-serif text-2xl">Broadcast or direct email</h2>
      <label className="grid gap-1 text-sm">
        Recipient
        <input
          className={inputClass}
          placeholder="client@example.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          list="contacts-list"
          required
        />
        <datalist id="contacts-list">
          {contacts.map((c) => (
            <option key={c.id} value={c.email}>
              {c.name} {c.company ? `(${c.company})` : ""}
            </option>
          ))}
        </datalist>
      </label>
      <label className="grid gap-1 text-sm">
        Subject
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </label>
      <label className="grid gap-1 text-sm">
        Message
        <textarea className={inputClass} rows={8} value={body} onChange={(e) => setBody(e.target.value)} required />
      </label>
      <button
        disabled={busy}
        className="w-fit rounded-full bg-foreground px-6 py-2.5 text-sm text-background disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  )
}
