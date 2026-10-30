"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import {
  deleteContact,
  deletePost,
  deleteProject,
  deleteTestimonial,
  duplicateProject,
  savePost,
  saveProject,
  saveTestimonial,
  updateContact,
} from "@/app/actions/cms"
import { uploadToBlob } from "@/lib/upload-client"
import { makeSlug } from "@/lib/utils"
import { AdminVideoManager } from "@/components/admin-video-manager"
import { OverviewPanel } from "@/components/admin/overview-panel"
import type { Overview } from "@/lib/overview"
import { replyToContact, sendAdminEmail, syncLeadsToResend } from "@/app/actions/email"

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
  user,
  projects,
  posts,
  contacts,
  testimonials,
  showcaseVideos,
  overview,
}: Props) {
  const [tab, setTab] = useState<AdminTab>("overview")
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [message, setMessage] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  function go(next: AdminTab) {
    setTab(next)
    setEditingPost(null)
    setEditingTestimonial(null)
  }

  function newTestimonial() {
    setMessage("")
    setEditingTestimonial({
      id: "",
      quote: "",
      clientName: "",
      clientRole: "",
      company: "",
      avatarUrl: null,
      featured: false,
      published: true,
      sortOrder: testimonials.length,
    })
  }

  async function remove(kind: "project" | "post" | "testimonial" | "contact", id: string) {
    if (!window.confirm("Delete this item permanently?")) return
    try {
      if (kind === "project") await deleteProject(id)
      if (kind === "post") await deletePost(id)
      if (kind === "testimonial") await deleteTestimonial(id)
      if (kind === "contact") await deleteContact(id)
      window.location.reload()
    } catch {
      setMessage("Couldn't delete it. Your session may have expired. Reload the page, sign in again and retry.")
    }
  }

  async function handleDuplicateProject(id: string) {
    setMessage("Duplicating project…")
    try {
      const res = await duplicateProject(id)
      if (res.ok) {
        window.location.reload()
      } else {
        setMessage(res.error)
      }
    } catch {
      setMessage("Could not duplicate project.")
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Prajesh Shakya / CMS</p>
            <h1 className="mt-2 font-serif text-4xl">Content studio</h1>
            <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => authClient.signOut().then(() => window.location.reload())}
            className="self-start rounded-full border border-border px-4 py-2 text-sm"
          >
            Sign out
          </button>
        </header>

        <nav className="flex flex-wrap gap-2 py-6">
          <button onClick={() => go("overview")} className={tabClass(tab === "overview")}>
            Overview
          </button>
          <button onClick={() => go("projects")} className={tabClass(tab === "projects")}>
            Projects ({projects.length})
          </button>
          <button onClick={() => go("posts")} className={tabClass(tab === "posts")}>
            Notes ({posts.length})
          </button>
          <button onClick={() => go("contacts")} className={tabClass(tab === "contacts")}>
            Contacts ({contacts.filter((c) => c.status === "new").length} new)
          </button>
          <button onClick={() => go("testimonials")} className={tabClass(tab === "testimonials")}>
            Testimonials ({testimonials.length})
          </button>
          <button onClick={() => go("showcase")} className={tabClass(tab === "showcase")}>
            Showcase ({showcaseVideos.length})
          </button>
          <a href="/admin/clients" className={tabClass(false)}>
            Clients
          </a>
          <a href="/admin/moodboards" className={tabClass(false)}>
            Moodboards
          </a>
          <a href="/admin/invoices" className={tabClass(false)}>
            Invoices
          </a>
          <a href="/admin/packages" className={tabClass(false)}>
            Packages
          </a>
          <a href="/admin/projects/new" className={tabClass(false)}>
            Project editor
          </a>
          <a href="/admin/newsletter" className={tabClass(false)}>
            Newsletter
          </a>
          <button onClick={() => go("email")} className={tabClass(tab === "email")}>
            Email
          </button>

          {tab === "projects" && (
            <Link
              href="/admin/projects/new"
              className="ml-auto rounded-full bg-foreground px-4 py-2 text-sm text-background"
            >
              Create project
            </Link>
          )}

          {tab === "posts" && (
            <button
              onClick={() => {
                setMessage("")
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
              className="ml-auto rounded-full bg-foreground px-4 py-2 text-sm text-background"
            >
              Create note
            </button>
          )}

          {tab === "testimonials" && !editingTestimonial && (
            <button onClick={newTestimonial} className="ml-auto rounded-full bg-foreground px-4 py-2 text-sm text-background">
              Add testimonial
            </button>
          )}
        </nav>

        {message && <p className="mb-4 rounded-lg border border-border p-3 text-sm">{message}</p>}

        {tab === "overview" && <OverviewPanel data={overview} onOpenContacts={() => go("contacts")} />}
        {tab === "email" && <EmailComposer contacts={contacts} onMessage={setMessage} />}

        {/* PROJECTS TAB: LIST WITH BEHANCE BUILDER LINKS */}
        {tab === "projects" && (
          <section className="grid gap-3">
            {projects.map((row) => (
              <article
                key={row.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {row.thumbnail && (
                    <img
                      src={row.thumbnail}
                      alt={row.title}
                      className="size-14 rounded-lg object-cover bg-secondary"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
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
                    <h2 className="mt-1 font-serif text-xl">{row.title || "Untitled"}</h2>
                    <p className="text-sm text-muted-foreground">/projects/{row.slug || "no-slug"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/projects/${row.id}`}
                    className="rounded-lg bg-foreground px-3 py-2 text-sm text-background hover:opacity-90"
                  >
                    Edit in Builder
                  </Link>
                  <button
                    onClick={() => handleDuplicateProject(row.id)}
                    className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => remove("project", row.id)}
                    className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {projects.length === 0 && <p className="text-muted-foreground">No projects yet.</p>}
          </section>
        )}

        {/* NOTES / POSTS TAB */}
        {tab === "posts" && editingPost && (
          <PostEditor
            item={editingPost}
            onCancel={() => setEditingPost(null)}
            onDone={() => {
              setEditingPost(null)
              setMessage("Note saved successfully.")
              window.location.reload()
            }}
            onError={setMessage}
          />
        )}
        {tab === "posts" && !editingPost && (
          <section className="grid gap-3">
            {posts.map((row) => (
              <article
                key={row.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {row.category} · {row.published ? "Published" : "Draft"}
                  </p>
                  <h2 className="mt-1 font-serif text-xl">{row.title || "Untitled"}</h2>
                  <p className="text-sm text-muted-foreground">/blog/{row.slug || "no-slug"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPost(row)}
                    className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove("post", row.id)}
                    className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {posts.length === 0 && <p className="text-muted-foreground">Nothing here yet.</p>}
          </section>
        )}

        {/* SHOWCASE TAB */}
        {tab === "showcase" && <AdminVideoManager videos={showcaseVideos} />}

        {/* TESTIMONIALS TAB */}
        {tab === "testimonials" && editingTestimonial && (
          <TestimonialEditor
            item={editingTestimonial}
            onCancel={() => setEditingTestimonial(null)}
            onError={setMessage}
          />
        )}
        {tab === "testimonials" && !editingTestimonial && (
          <section className="grid gap-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm">“{testimonial.quote}”</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {[testimonial.clientName, testimonial.clientRole, testimonial.company]
                      .filter(Boolean)
                      .join(" · ")}{" "}
                    · {testimonial.published ? "Published" : "Hidden"}
                    {testimonial.featured ? " · Featured" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMessage("")
                      setEditingTestimonial({
                        ...testimonial,
                        clientRole: testimonial.clientRole ?? "",
                        company: testimonial.company ?? "",
                      })
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove("testimonial", testimonial.id)}
                    className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {testimonials.length === 0 && <p className="text-muted-foreground">Nothing here yet.</p>}
          </section>
        )}

        {/* CONTACTS TAB */}
        {tab === "contacts" && (
          <section className="grid gap-3">
            <LeadsSync />
            {contacts.map((contact) => (
              <article key={contact.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <div>
                    <h2 className="font-serif text-xl">
                      {contact.name}
                      {contact.company ? ` · ${contact.company}` : ""}
                    </h2>
                    <a href={`mailto:${contact.email}`} className="text-sm underline">
                      {contact.email}
                    </a>
                    {(contact.packageInterest || contact.budget || contact.timeline) && (
                      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                        {[contact.packageInterest, contact.budget, contact.timeline].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{contact.message}</p>
                    {contact.notes && (
                      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => setReplyingTo(replyingTo === contact.id ? null : contact.id)}
                      className="rounded-lg bg-foreground px-3 py-2 text-sm text-background"
                    >
                      Reply
                    </button>
                    <select
                      value={contact.status}
                      onChange={async (e) => {
                        try {
                          await updateContact(contact.id, e.target.value, contact.notes ?? "")
                          window.location.reload()
                        } catch {
                          setMessage(
                            "Couldn't update the status. Your session may have expired. Reload the page, sign in again and retry."
                          )
                        }
                      }}
                      className={inputClass}
                    >
                      <option>new</option>
                      <option>read</option>
                      <option>replied</option>
                      <option>archived</option>
                    </select>
                    <button
                      onClick={() => remove("contact", contact.id)}
                      className="rounded-lg border border-destructive px-3 py-2 text-sm text-destructive"
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
            {contacts.length === 0 && <p className="text-muted-foreground">No contact submissions yet.</p>}
          </section>
        )}
      </div>
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
          <input className={inputClass} value={data.slug} onChange={(e) => set("slug", e.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm">
          Category
          <input
            className={inputClass}
            list="post-categories"
            value={data.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
            required
          />
          <datalist id="post-categories">
            {["Brand Strategy", "Design Practice", "Business", "Culture", "Process"].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="grid gap-2 text-sm">
          Author
          <input className={inputClass} value={data.author} onChange={(e) => set("author", e.target.value)} required />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        Featured image
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "featuredImage")} />
        {data.featuredImage && (
          <img src={data.featuredImage} alt="Featured preview" className="h-32 w-full rounded-lg object-cover" />
        )}
      </label>
      <label className="grid gap-2 text-sm">
        Excerpt
        <textarea className={inputClass} rows={3} value={data.excerpt} onChange={(e) => set("excerpt", e.target.value)} required />
      </label>
      <label className="grid gap-2 text-sm">
        Content
        <textarea
          className={`${inputClass} font-mono`}
          rows={14}
          value={data.content}
          onChange={(e) => set("content", e.target.value)}
          required
        />
      </label>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.published} onChange={(e) => set("published", e.target.checked)} />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(data.featured)} onChange={(e) => set("featured", e.target.checked)} />
          Featured
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="w-fit rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">
        {busy ? "Saving…" : "Save Note"}
      </button>
    </form>
  )
}

function EmailComposer({ contacts, onMessage }: { contacts: Contact[]; onMessage: (message: string) => void }) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    onMessage("")
    try {
      const result = await sendAdminEmail({ to, subject, text })
      if (!result.ok) {
        onMessage(result.error)
        return
      }
      onMessage("Email sent successfully.")
      setSubject("")
      setText("")
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Unable to send email")
    } finally {
      setBusy(false)
    }
  }

  function reply(contact: Contact) {
    setTo(contact.email)
    setSubject(`Re: Your message to Prajesh${contact.company ? ` — ${contact.company}` : ""}`)
    setText(`Hi ${contact.name},\n\n`)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-border p-5 sm:p-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Resend</p>
          <h2 className="mt-2 font-serif text-3xl">Compose email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sends a branded email from your site&apos;s address. Replies come to your Gmail.
          </p>
        </div>
        <label className="grid gap-2 text-sm">
          Recipient
          <input className={inputClass} type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" required />
        </label>
        <label className="grid gap-2 text-sm">
          Subject
          <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm">
          Message
          <textarea className={`${inputClass} min-h-48 resize-y`} value={text} onChange={(e) => setText(e.target.value)} required />
        </label>
        <button disabled={busy} className="w-fit rounded-full bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-50">
          {busy ? "Sending…" : "Send email"}
        </button>
      </form>
      <aside className="rounded-2xl border border-border p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Contacts</p>
        <div className="mt-4 grid gap-3">
          {contacts.slice(0, 8).map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => reply(contact)}
              className="rounded-lg border border-border p-3 text-left hover:bg-muted"
            >
              <span className="block text-sm font-medium">{contact.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{contact.email}</span>
            </button>
          ))}
          {contacts.length === 0 && <p className="text-sm text-muted-foreground">No contacts yet.</p>}
        </div>
      </aside>
    </section>
  )
}

function LeadsSync() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState("")

  async function sync() {
    setBusy(true)
    setResult("")
    try {
      const outcome = await syncLeadsToResend()
      if (!outcome.ok) {
        setResult(outcome.error)
        return
      }
      setResult(
        `Done: ${outcome.added} added to Leads, ${outcome.existing} already in Resend${
          outcome.failed ? `, ${outcome.failed} couldn't be added (details in the Vercel logs)` : ""
        }.`
      )
    } catch {
      setResult("Couldn't sync. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        New enquiries are added to Resend automatically, as contacts in the <span className="text-foreground">Leads</span> segment.
        {result && <span role="status" className="mt-1 block text-foreground">{result}</span>}
      </p>
      <button onClick={sync} disabled={busy} className="shrink-0 rounded-lg border border-border px-3 py-2 disabled:opacity-50">
        {busy ? "Adding…" : "Add past enquiries to Resend"}
      </button>
    </div>
  )
}

function ContactReply({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const router = useRouter()
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [subject, setSubject] = useState(`Re: Your enquiry${contact.company ? ` — ${contact.company}` : ""}`)
  const [text, setText] = useState(`Hi ${contact.name.trim().split(/\s+/)[0]},\n\n`)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (el) {
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const result = await replyToContact({ contactId: contact.id, subject, text })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSent(true)
      router.refresh()
    } catch {
      setError("Couldn't send. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusy(false)
    }
  }

  if (sent)
    return (
      <div role="status" className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm">
        <span>Reply sent to {contact.email}. The enquiry is marked “replied”.</span>
        <button type="button" onClick={onClose} className="underline">
          Close
        </button>
      </div>
    )

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">
        To {contact.email} · Sent as a branded email from your site&apos;s address.
      </p>
      <label className="grid gap-2 text-sm">
        Subject
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} required />
      </label>
      <label className="grid gap-2 text-sm">
        Message
        <textarea ref={textRef} className={`${inputClass} min-h-40 resize-y`} value={text} onChange={(e) => setText(e.target.value)} maxLength={10000} required />
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

function tabClass(active: boolean) {
  return `rounded-full px-4 py-2 text-sm ${active ? "bg-foreground text-background" : "border border-border"}`
}

function TestimonialEditor({
  item,
  onCancel,
  onError,
}: {
  item: Testimonial
  onCancel: () => void
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
      window.location.reload()
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
