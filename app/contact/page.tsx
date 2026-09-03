import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact Prajesh Shakya — Start a Brand Project",
  description:
    "Tell me about your business, brand, or next idea. I create distinctive identities through strategy and design.",
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
