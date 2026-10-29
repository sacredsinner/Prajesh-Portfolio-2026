import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/lib/site"

// Structured data (schema.org JSON-LD) so search engines understand who the site is
// about and what each page is. "<" is escaped so the JSON can't close the script tag.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`)

export const PERSON_ID = `${SITE_URL}/#person`

export const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_NAME,
  jobTitle: "Brand Identity Designer",
  url: SITE_URL,
  email: `mailto:${CONTACT_EMAIL}`,
  image: absoluteUrl("/images/about-portrait.jpg"),
  sameAs: SOCIAL_LINKS.map((link) => link.href),
  knowsAbout: ["Brand strategy", "Brand identity design", "Logo design", "Visual identity systems"],
}

export const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, description: SITE_DESCRIPTION, publisher: { "@id": PERSON_ID } },
    person,
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: `${SITE_NAME} — Brand Identity Design`,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      image: absoluteUrl("/og-image.jpg"),
      founder: { "@id": PERSON_ID },
      address: { "@type": "PostalAddress", addressLocality: "Kathmandu", addressCountry: "NP" },
      areaServed: ["Nepal", "Australia", "Worldwide"],
      sameAs: SOCIAL_LINKS.map((link) => link.href),
      priceRange: "$2,500–$11,000+",
      hasOfferCatalog: { "@type": "OfferCatalog", name: "Brand identity services", itemListElement: ["Foundation Sprint", "Complete Visual System", "System & Governance", "90-Minute Brand Strategy Diagnostic"].map((name) => ({ "@type": "Offer", name })) },
    },
  ],
}
