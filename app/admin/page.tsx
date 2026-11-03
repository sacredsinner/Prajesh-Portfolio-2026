import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_SIGNUP_OPEN, GOOGLE_SIGN_IN_ENABLED, auth, isAdminUser } from "@/lib/auth"
import { listContacts, listPosts, listProjects, listTestimonials } from "@/app/actions/cms"
import { listShowcaseVideos } from "@/app/actions/showcase"
import { getFeatureFlags } from "@/lib/feature-flags"
import { getSafeOverview } from "@/lib/overview"
import { DEMO_PROJECTS } from "@/lib/demo-projects"
import { DEMO_NOTES } from "@/lib/demo-notes"
import { AdminNoAccess, AdminSignIn } from "@/components/admin-sign-in"
import { AdminDashboard } from "@/components/admin-dashboard"

export const metadata: Metadata = { title: "Content studio", robots: { index: false, follow: false } }

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    const { error } = await searchParams
    return (
      <main className="min-h-screen bg-background px-5 py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <AdminSignIn allowSignUp={ADMIN_SIGNUP_OPEN} googleEnabled={GOOGLE_SIGN_IN_ENABLED} error={error} />
        </div>
      </main>
    )
  }
  if (!isAdminUser(session.user)) {
    return (
      <main className="min-h-screen bg-background px-5 py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <AdminNoAccess email={session.user.email} />
        </div>
      </main>
    )
  }

  const { tab } = await searchParams
  if (tab === "socials") redirect("/admin/socials")
  const [projectRows, postRows, contactRows, testimonialRows, showcaseVideos, overview, featureFlags] = await Promise.all([
    listProjects().catch(() =>
      DEMO_PROJECTS.map((p, i) => ({
        id: `demo-p-${i}`,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        status: p.status,
        category: p.category,
        year: p.year,
        thumbnail: p.thumbnail,
        client: p.client,
        overview: p.overview,
        problem: p.problem,
        approach: p.approach,
        solution: p.solution,
        outcome: p.outcome,
        images: p.images,
        featured: p.featured,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        blocksCount: p.blocks?.length ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ),
    listPosts().catch(() =>
      DEMO_NOTES.map((n, i) => ({
        id: `demo-post-${i}`,
        slug: n.slug,
        title: n.title,
        excerpt: n.excerpt,
        content: n.content,
        category: n.category,
        featuredImage: n.featuredImage,
        author: n.author,
        tags: n.tags,
        published: n.published,
        publishedAt: n.publishedAt ? new Date(n.publishedAt) : null,
        seoTitle: n.seoTitle,
        seoDescription: n.seoDescription,
        seoKeywords: n.seoKeywords,
        featured: n.featured,
      }))
    ),
    listContacts().catch(() => [
      {
        id: "demo-c-1",
        name: "Maya Lin",
        email: "maya@studio.com",
        company: "Acme Audio",
        message:
          "[PROJECT INTAKE WIZARD SUBMISSION]\nStage: New Venture / Founding a Brand\nDeliverables: Core Visual Identity & Logo Suite, Editorial Brand Guidelines Book\nTarget Timeline: Standard Pace (1–2 months)\nBudget Band: $3,000 – $6,000 (USD)\nRecommended Package: Identity Package (~US$6,000)\n\nProject Notes & Context:\nLooking for high-tactile editorial branding for an audio lifestyle brand.",
        status: "new",
        notes: "High priority lead from /start intake funnel",
        createdAt: new Date(),
        packageInterest: "Identity Package",
        budget: "$3,000 – $6,000",
        timeline: "1–2 months",
      },
      {
        id: "demo-c-2",
        name: "Liam Chen",
        email: "liam@chenarchitecture.com",
        company: "Chen Studio",
        message:
          "Hello Prajesh, we are planning a studio rebrand and need an editorial brand identity book and responsive portfolio showcase.",
        status: "replied",
        notes: "Intro call scheduled via Cal.com",
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        packageInterest: "System Package",
        budget: "$10,000+",
        timeline: "Immediate",
      },
    ]),
    listTestimonials().catch(() => []),
    listShowcaseVideos().catch(() => []),
    getSafeOverview(),
    getFeatureFlags().catch(() => ({} as any)),
  ])

  return (
    <AdminDashboard
      initialTab={tab}
      user={session.user}
      projects={projectRows as any}
      posts={postRows as any}
      contacts={contactRows as any}
      testimonials={testimonialRows as any}
      showcaseVideos={showcaseVideos as any}
      featureFlags={featureFlags as any}
      overview={overview as any}
    />
  )
}
