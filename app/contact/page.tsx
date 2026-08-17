import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact — Prajesh Shakya",
  description:
    "Get in touch to discuss your brand identity project. Start a conversation about transforming your brand.",
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
