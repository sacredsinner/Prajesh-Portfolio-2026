// Single source for the public site's address, name and social profiles.
// The apex domain redirects to www, so www is the canonical host.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.shakyaprajesh.com.np").replace(/\/+$/, "")

export const SITE_NAME = "Prajesh Shakya"

export const SITE_DESCRIPTION =
  "I help ambitious businesses build distinctive brand identities through strategy, design, and meaningful visual systems."

// The site-wide link preview (public/og-image.jpg). Pages with their own image use that instead.
export const DEFAULT_SHARE_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "Prajesh Shakya — Brand Identity Designer" }

export const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/madebyprajesh/", label: "Instagram" },
  { href: "https://www.linkedin.com/in/prajeshshakya/", label: "LinkedIn" },
]

export const CONTACT_EMAIL = "hello@shakyaprajesh.com.np"

// Free 30-minute intro call (Cal.com). Shown on Contact, in the CTA block and in the enquiry auto-reply.
export const BOOKING_URL = "https://cal.com/prajesh-shakya-zqhp5y/30min"
