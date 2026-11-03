import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PackagesView } from "@/components/packages/packages-view"
import { JsonLd } from "@/components/json-ld"
import { visiblePackages } from "@/lib/packages"
import { getPricing } from "@/lib/pricing"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Brand Identity Packages & Pricing (USD, AUD, NPR) — Prajesh Shakya",
  description:
    "Transparent multi-currency brand identity pricing: Foundation ($2,500+ / AUD $3,500+ / NPR 50,000+), Identity ($6,000+ / AUD $8,500+ / NPR 120,000+), and System ($11,000+ / AUD $16,000+ / NPR 250,000+).",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Brand Identity Packages & Pricing (USD, AUD, NPR) — Prajesh Shakya",
    description:
      "Transparent multi-currency brand identity pricing: Foundation ($2,500+), Identity ($6,000+), and System ($11,000+). No hidden agency markups.",
    url: `${SITE_URL}/packages`,
  },
}

// Refreshed every 5 minutes, and immediately when packages are saved in /admin.
export const revalidate = 300

export default async function PackagesPage() {
  const pricing = await getPricing()
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Brand identity packages",
    itemListElement: visiblePackages(pricing).map((item, index) => ({
      "@type": "Offer",
      position: index + 1,
      name: `${item.name} brand identity package`,
      description: item.audience,
      url: `${SITE_URL}/packages#${item.id}`,
      priceSpecification: [
        { "@type": "PriceSpecification", price: item.from.USD, priceCurrency: "USD", minPrice: item.from.USD },
        { "@type": "PriceSpecification", price: item.from.AUD, priceCurrency: "AUD", minPrice: item.from.AUD },
        { "@type": "PriceSpecification", price: item.from.NPR, priceCurrency: "NPR", minPrice: item.from.NPR },
      ],
      seller: { "@id": `${SITE_URL}/#person` },
    })),
  }
  return (
    <>
      <JsonLd data={schema} />
      <Navbar />
      <main className="page-container pb-24 pt-32">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Packages</p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">Three ways to build a brand worth remembering.</h1>
        <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{pricing.intro}</p>
        <div className="mt-12"><PackagesView pricing={pricing} /></div>
      </main>
      <Footer />
    </>
  )
}
