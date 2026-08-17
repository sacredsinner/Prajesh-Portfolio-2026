import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { VideoShowcase } from "@/components/home/video-showcase"
import { IntroSection } from "@/components/home/intro-section"
import { SelectedWorkSection } from "@/components/home/selected-work-section"
import { ProcessSection } from "@/components/home/process-section"
import { CTABlock } from "@/components/cta-block"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { TrustedPartnershipsSection } from "@/components/home/trusted-partnerships-section"
import { getActiveShowcaseVideo, getPublishedClients, getPublishedTestimonials, getPublishedProjects, toProjectCard } from "@/lib/public-content"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [projectRows, testimonialRows, showcaseVideo, clientRows] = await Promise.all([getPublishedProjects(), getPublishedTestimonials(), getActiveShowcaseVideo(), getPublishedClients()])
  const projects = projectRows.map(toProjectCard)
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <VideoShowcase video={showcaseVideo} />
        <IntroSection />
        <SelectedWorkSection projects={projects} />
        <TrustedPartnershipsSection clients={clientRows} />
        <ProcessSection />
        <TestimonialsSection testimonials={testimonialRows} />
        <CTABlock />
      </main>
      <Footer />
    </>
  )
}
