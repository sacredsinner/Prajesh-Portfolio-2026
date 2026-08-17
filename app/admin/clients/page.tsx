import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { listClients } from "@/app/actions/clients"
import { AdminClientManager } from "@/components/admin-client-manager"

export const dynamic = "force-dynamic"

export default async function AdminClientsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/admin")
  const clients = await listClients()
  return <main className="min-h-screen bg-background px-4 py-8 sm:px-8"><div className="w-full px-4 sm:px-6 lg:px-8"><a href="/admin" className="text-xs uppercase tracking-widest hover:opacity-60">← Content studio</a><div className="mt-8"><AdminClientManager initialClients={clients} /></div></div></main>
}
