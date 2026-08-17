import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getPublishedClient } from "@/lib/public-content"

export const dynamic = "force-dynamic"

export default async function ClientDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const client = await getPublishedClient((await params).slug)
  if (!client) notFound()
  return <><Navbar /><main className="w-full px-4 py-24 sm:px-6 md:py-32 lg:px-8"><div className="w-full px-4 sm:px-6 lg:px-8"><Link href="/clients" className="text-xs uppercase tracking-widest hover:opacity-60">← All clients</Link><div className="mt-16 grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start"><div className="flex aspect-square items-center justify-center border border-foreground/80 p-12"><img src={client.logoUrl} alt={`${client.name} logo`} className="max-h-48 w-full object-contain" /></div><div><p className="text-xs uppercase tracking-widest">[ Partnership ]</p><h1 className="mt-5 font-serif text-5xl sm:text-7xl">{client.name}</h1>{client.description && <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{client.description}</p>}{client.websiteUrl && <a href={client.websiteUrl} target="_blank" rel="noreferrer" className="mt-10 inline-block border-b border-foreground pb-1 text-sm uppercase tracking-wide">Visit website ↗</a>}</div></div></div></main><Footer /></>
}
