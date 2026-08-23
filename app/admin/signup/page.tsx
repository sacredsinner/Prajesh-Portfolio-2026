import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, isAdminUser } from "@/lib/auth"
import { AdminSignUp } from "@/components/admin-sign-up"

export default async function AdminSignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(isAdminUser(session.user) ? "/admin" : "/")

  return (
    <main className="min-h-screen bg-background px-5 py-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminSignUp />
      </div>
    </main>
  )
}
