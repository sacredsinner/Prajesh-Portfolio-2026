import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, isAdminUser } from "@/lib/auth"
import { loadPricing } from "@/app/actions/pricing"
import { PackagesManager } from "@/components/admin/packages-manager"

export const metadata: Metadata = { title: "Packages · Content studio", robots: { index: false, follow: false } }

export const dynamic = "force-dynamic"

export default async function AdminPackagesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) redirect("/admin")
  const pricing = await loadPricing()
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <a href="/admin" className="text-xs uppercase tracking-widest hover:opacity-60">← Content studio</a>
        <div className="mt-8"><PackagesManager initial={pricing} /></div>
      </div>
    </main>
  )
}
