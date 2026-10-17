import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_SIGNUP_OPEN, auth, isAdminUser } from "@/lib/auth"
import { AdminSignUp } from "@/components/admin-sign-up"

export const metadata: Metadata = { title: "Create account", robots: { index: false, follow: false } }

export default async function AdminSignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(isAdminUser(session.user) ? "/admin" : "/")

  return (
    <main className="min-h-screen bg-background px-5 py-24">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {ADMIN_SIGNUP_OPEN ? (
          <AdminSignUp />
        ) : (
          <div className="flex max-w-md flex-col gap-4 border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Private workspace</p>
            <h1 className="font-serif text-3xl">Sign-up is closed</h1>
            <p className="text-sm text-muted-foreground">New accounts aren&apos;t being created. If you already have one, sign in instead.</p>
            <a href="/admin" className="w-fit bg-foreground px-4 py-2 text-sm text-background">Go to sign in</a>
          </div>
        )}
      </div>
    </main>
  )
}
