import type { Metadata } from "next"
import { headers } from "next/headers"
import { ADMIN_SIGNUP_OPEN, GOOGLE_SIGN_IN_ENABLED, auth, isAdminUser } from "@/lib/auth"
import { AdminNoAccess, AdminSignIn } from "@/components/admin-sign-in"
import { ProjectUploadEditor } from "@/components/admin/project-upload-editor"

export const metadata: Metadata = {
  title: "New project — Content studio",
  robots: { index: false, follow: false },
}

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    const { error } = await searchParams
    return (
      <main className="min-h-screen bg-background px-5 py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <AdminSignIn
            allowSignUp={ADMIN_SIGNUP_OPEN}
            googleEnabled={GOOGLE_SIGN_IN_ENABLED}
            error={error}
          />
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

  return <ProjectUploadEditor />
}
