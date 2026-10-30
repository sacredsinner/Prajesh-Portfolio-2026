import type { Metadata } from "next"
import { headers } from "next/headers"
import { ADMIN_SIGNUP_OPEN, GOOGLE_SIGN_IN_ENABLED, auth, isAdminUser } from "@/lib/auth"
import { listContacts, listPosts, listProjects, listTestimonials } from "@/app/actions/cms"
import { listShowcaseVideos } from "@/app/actions/showcase"
import { getOverview } from "@/lib/overview"
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
  const [projectRows, postRows, contactRows, testimonialRows, showcaseVideos, overview] = await Promise.all([
    listProjects(),
    listPosts(),
    listContacts(),
    listTestimonials(),
    listShowcaseVideos(),
    getOverview(),
  ])

  return (
    <AdminDashboard
      initialTab={tab}
      user={session.user}
      projects={projectRows}
      posts={postRows}
      contacts={contactRows}
      testimonials={testimonialRows}
      showcaseVideos={showcaseVideos}
      overview={overview}
    />
  )
}
