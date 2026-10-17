// Single source for the public site's address, name and social profiles.
// The apex domain redirects to www, so www is the canonical host.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.shakyaprajesh.com.np").replace(/\/+$/, "")

export const SITE_NAME = "Prajesh Shakya"

export const SITE_DESCRIPTION =
  "I help ambitious businesses build distinctive brand identities through strategy, design, and meaningful visual systems."

export const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/madebyprajesh/", label: "Instagram" },
  { href: "https://www.linkedin.com/in/prajeshshakya/", label: "LinkedIn" },
]

export const CONTACT_EMAIL = "prajeshshakya@gmail.com"
