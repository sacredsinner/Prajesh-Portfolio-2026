import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPublishedClient } from "@/lib/public-content"
import { needsClientName } from "@/lib/utils"

// Pages are cached and refreshed every 5 minutes, and immediately when content is saved in /admin.
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const client = await getPublishedClient((await params).slug)
  if (!client) return { title: "Client Not Found" }
  const name = needsClientName(client.name) ? "Client" : client.name
  return {
    title: `${name} — Clients — Prajesh Shakya`,
    description: client.description || `${name}, a client of brand identity designer Prajesh Shakya.`,
    alternates: { canonical: `/clients/${client.slug}` },
    // Pages without a description are too thin to be useful in search results.
    robots: client.description && !needsClientName(client.name) ? undefined : { index: false, follow: true },
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const client = await getPublishedClient((await params).slug)
  if (!client) notFound()
  const name = needsClientName(client.name) ? "Client" : client.name
  return <><Navbar /><main className="py-24 md:py-32"><div className="page-container"><Link href="/clients" className="text-xs uppercase tracking-widest hover:opacity-60">← All clients</Link><div className="mt-16 grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start"><div className="flex aspect-square items-center justify-center border border-foreground/80 p-12"><img src={client.logoUrl} alt={`${name} logo`} className="max-h-48 w-full object-contain" /></div><div><p className="text-xs uppercase tracking-widest">[ Partnership ]</p><h1 className="mt-5 font-serif text-5xl sm:text-7xl">{name}</h1>{client.description && <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{client.description}</p>}{client.websiteUrl && <a href={client.websiteUrl} target="_blank" rel="noreferrer" className="mt-10 inline-block border-b border-foreground pb-1 text-sm uppercase tracking-wide">Visit website ↗</a>}</div></div></div></main><Footer /></>
}
