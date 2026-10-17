import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import { ContactForm } from "@/components/contact/contact-form"
import { getPricing } from "@/lib/pricing"
import { budgetChoices, packageChoices } from "@/lib/packages"

export const metadata: Metadata = {
  title: "Contact Prajesh Shakya — Start a Brand Project",
  description:
    "Tell me about your business, brand, or next idea. I create distinctive identities through strategy and design.",
  alternates: { canonical: "/contact" },
}

export default async function ContactPage() {
  const pricing = await getPricing()
  const choices = { packages: packageChoices(pricing), budgets: budgetChoices(pricing) }
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Suspense fallback={null}><ContactForm choices={choices} /></Suspense>
      </main>
      <Footer />
    </>
  )
}
