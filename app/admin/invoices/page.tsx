import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { desc } from "drizzle-orm"
import { auth, isAdminUser } from "@/lib/auth"
import { listDocuments, getInvoiceSettings } from "@/app/actions/invoices"
import { InvoiceManager } from "@/components/admin/invoice-manager"
import { AdminHeader } from "@/components/admin/admin-header"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { contacts } from "@/lib/db/schema"
import { getPricing } from "@/lib/pricing"

export const metadata: Metadata = { title: "Invoices · Content studio", robots: { index: false, follow: false } }

export const dynamic = "force-dynamic"

export default async function AdminInvoicesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdminUser(session.user)) redirect("/admin")
  await ensureSchema()
  const [documents, settings, pricing, enquiries] = await Promise.all([
    listDocuments(),
    getInvoiceSettings(),
    getPricing(),
    db.select({ name: contacts.name, email: contacts.email, company: contacts.company }).from(contacts).orderBy(desc(contacts.createdAt)).limit(200),
  ])
  // One entry per email address, newest first, to fill in a client's details.
  const seen = new Set<string>()
  const leads = enquiries.filter((lead) => {
    const key = lead.email.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminHeader active="invoices" user={session.user} />
        <div className="mt-6">
          <InvoiceManager documents={documents} settings={settings} leads={leads} pricing={pricing} />
        </div>
      </div>
    </main>
  )
}
