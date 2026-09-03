import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPublishedClients } from "@/lib/public-content"

export const metadata: Metadata = {
  title: "Clients — Prajesh Shakya",
  description: "A selection of ambitious businesses I have helped through brand strategy and identity design.",
}

export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const clients = await getPublishedClients()
  return <><Navbar /><main className="w-full px-4 py-24 sm:px-6 md:py-32 lg:px-8"><div className="w-full px-4 sm:px-6 lg:px-8"><p className="text-xs uppercase tracking-widest">[ Trusted partnerships ]</p><h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight sm:text-7xl">Clients I&apos;ve had the pleasure to work with.</h1><div className="mt-20 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{clients.map((client) => <Link key={client.id} href={`/clients/${client.slug}`} className="flex aspect-[1.35] items-center justify-center border border-foreground/80 p-8 hover:opacity-60"><img src={client.logoUrl} alt={`${client.name} logo`} className="max-h-24 w-full object-contain" /></Link>)}</div></div></main><Footer /></>
}
