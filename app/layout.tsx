import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://shakyaprajesh.com.np"),
  title: "Prajesh Shakya — Brand Identity Designer in Nepal",
  description:
    "I help ambitious businesses build distinctive brand identities through strategy, design, and meaningful visual systems.",
  generator: null,
  openGraph: {
    title: "Prajesh Shakya — Brand Identity Designer",
    description: "I help ambitious businesses build distinctive brand identities through strategy, design, and meaningful visual systems.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Prajesh Shakya — Brand Identity Designer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prajesh Shakya — Brand Identity Designer",
    description: "I help ambitious businesses build distinctive brand identities through strategy, design, and meaningful visual systems.",
    images: ["/og-image.png"],
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
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
