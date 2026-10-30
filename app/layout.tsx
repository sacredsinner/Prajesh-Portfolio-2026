import type { Metadata, Viewport } from "next"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { MotionProvider } from "@/components/motion-provider"
import { DEFAULT_SHARE_IMAGE, SITE_DESCRIPTION, SITE_URL } from "@/lib/site"
import "./globals.css"

// Brand typefaces: Instrument Serif for display, Instrument Sans for text.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const shareImage = DEFAULT_SHARE_IMAGE

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL, types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "Notes — Prajesh Shakya" }] } },
  title: "Prajesh Shakya — Brand Identity Designer in Nepal",
  description: SITE_DESCRIPTION,
  generator: null,
  openGraph: {
    title: "Prajesh Shakya — Brand Identity Designer",
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: "Prajesh Shakya",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prajesh Shakya — Brand Identity Designer",
    description: SITE_DESCRIPTION,
    images: [shareImage.url],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#f5f5f3",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${instrumentSerif.variable} bg-background`}>
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HCW8V0E4QD" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-HCW8V0E4QD');`}
        </Script>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
