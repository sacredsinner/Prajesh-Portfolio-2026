import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PackagesView } from "@/components/packages/packages-view"
import { JsonLd } from "@/components/json-ld"
import { PACKAGES } from "@/lib/packages"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Packages & Pricing — Prajesh Shakya",
  description: "Brand identity packages from Prajesh Shakya: Foundation, Identity and System, with starting prices in NPR, AUD and USD, plus add-ons and day rates.",
  alternates: { canonical: "/packages" },
}

export default function PackagesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Brand identity packages",
    itemListElement: PACKAGES.map((item, index) => ({
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
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Every package starts with strategy and ends with an identity you can use everywhere. Prices are starting points; the proposal after our first call is exact.</p>
        <div className="mt-12"><PackagesView /></div>
      </main>
      <Footer />
    </>
  )
}
