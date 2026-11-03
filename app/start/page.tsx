import { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { IntakeWizard } from "@/components/funnel/intake-wizard"
import { getPricing } from "@/lib/pricing"

export const metadata: Metadata = {
  title: "Start a Brand Project — Interactive Intake Wizard | Prajesh Shakya",
  description:
    "Scope your brand identity project, calculate estimated package investments in NPR, AUD, or USD, and schedule a 30-minute discovery consultation.",
  alternates: { canonical: "/start" },
}

export const revalidate = 300

export default async function StartProjectPage() {
  const pricing = await getPricing()

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-background">
        <Suspense fallback={<div className="h-96 flex items-center justify-center font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading intake wizard...</div>}>
          <IntakeWizard pricing={pricing} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
