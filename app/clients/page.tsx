import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPublishedClients } from "@/lib/public-content"
import { needsClientName } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Clients — Prajesh Shakya",
  description: "A selection of ambitious businesses I have helped through brand strategy and identity design.",
  alternates: { canonical: "/clients" },
}

// Pages are cached and refreshed every 5 minutes, and immediately when content is saved in /admin.
export const revalidate = 300

const tileClass = "flex aspect-[1.35] items-center justify-center border border-foreground/80 p-8"

export default async function ClientsPage() {
  const clients = await getPublishedClients()
  return <><Navbar /><main className="py-24 md:py-32"><div className="page-container"><p className="text-xs uppercase tracking-widest">[ Trusted partnerships ]</p><h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight sm:text-7xl">Clients I&apos;ve had the pleasure to work with.</h1><div className="mt-20 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{clients.map((client) => {
    // Logos still named after their files are shown without a link or a name.
    const unnamed = needsClientName(client.name)
    const logo = <img src={client.logoUrl} alt={unnamed ? "Client logo" : `${client.name} logo`} loading="lazy" className="max-h-24 w-full object-contain" />
    return unnamed ? <div key={client.id} className={tileClass}>{logo}</div> : <Link key={client.id} href={`/clients/${client.slug}`} className={`${tileClass} hover:opacity-60`}>{logo}</Link>
  })}</div></div></main><Footer /></>
}
