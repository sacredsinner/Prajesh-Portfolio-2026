import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { auth, isAdminUser } from "@/lib/auth"
import { getSafeOverview } from "@/lib/overview"
import { MobileOverviewMfe } from "@/components/mobile-overview/mobile-overview-mfe"
import { MobileAuthGate } from "@/components/mobile-overview/mobile-auth-gate"

export const dynamic = "force-dynamic"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Studio Overview · Mobile Micro Frontend",
  description: "Mobile-first command center for Prajesh Shakya Studio operations, cashflow, and client moodboards.",
  robots: { index: false, follow: false },
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; tab?: string }>
}) {
  const { demo } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const isAdmin = isAdminUser(session?.user)
  const isDemo = demo === "true"

  // If not admin and demo not requested, show the mobile gateway
  if (!isAdmin && !isDemo) {
    return <MobileAuthGate allowDemo={true} />
  }

  const overview = await getSafeOverview({ forceDemo: isDemo })

  return (
    <MobileOverviewMfe
      data={overview}
      isAdmin={isAdmin}
      isDemo={isDemo}
      userEmail={session?.user?.email}
    />
  )
}
