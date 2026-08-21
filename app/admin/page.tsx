import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, isAdminUser } from "@/lib/auth"
import { listContacts, listPosts, listProjects, listTestimonials } from "@/app/actions/cms"
import { listShowcaseVideos } from "@/app/actions/showcase"
import { AdminSignIn } from "@/components/admin-sign-in"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) return <main className="min-h-screen bg-background px-5 py-24"><div className="w-full px-4 sm:px-6 lg:px-8"><AdminSignIn /></div></main>
  const [projectRows, postRows, contactRows, testimonialRows, showcaseVideos] = await Promise.all([listProjects(), listPosts(), listContacts(), listTestimonials(), listShowcaseVideos()])
  return <AdminDashboard user={session.user} projects={projectRows} posts={postRows} contacts={contactRows} testimonials={testimonialRows} showcaseVideos={showcaseVideos} />
}
