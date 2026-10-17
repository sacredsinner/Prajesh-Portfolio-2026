import { SITE_NAME, SITE_URL } from "@/lib/site"

// Share links for notes and projects (components/share-links.tsx).
// Each network gets the page's canonical address; LinkedIn, Facebook and
// WhatsApp then build the preview from the page's Open Graph tags.

export type ShareNetwork = "linkedin" | "x" | "facebook" | "whatsapp" | "pinterest" | "email"

export const SHARE_NETWORK_LABELS: Record<ShareNetwork, string> = {
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  pinterest: "Pinterest",
  email: "Email",
}

export interface ShareContent {
  /** Absolute, canonical address of the page. */
  url: string
  /** Post text, email subject and Pin description. */
  title: string
  /** A sentence or two about the page, used in the email body. */
  summary?: string
  /** Absolute image address. Pinterest needs one; it's skipped without. */
  image?: string
}

/** The page's canonical address, e.g. canonicalUrl("/blog/consistency-compounds"). */
export function canonicalUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/** "Consistency compounds — Prajesh Shakya", or with a descriptor: "Atlas — Brand Identity by Prajesh Shakya". */
export function shareTitle(title: string, descriptor?: string) {
  const what = descriptor?.trim()
  return what ? `${title} — ${what} by ${SITE_NAME}` : `${title} — ${SITE_NAME}`
}

// Long project overviews would make the mailto: link unwieldy.
function shorten(text: string, max = 280) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40)).replace(/[\s,.;:—-]+$/, "")}…`
}

export function shareHref(network: ShareNetwork, { url, title, summary, image }: ShareContent) {
  const u = encodeURIComponent(url)
  switch (network) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
    case "x":
      return `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${u}`
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
    case "pinterest":
      return `https://www.pinterest.com/pin/create/button/?url=${u}${image ? `&media=${encodeURIComponent(image)}` : ""}&description=${encodeURIComponent(title)}`
    case "email": {
      const body = summary?.trim() ? `${shorten(summary)}\n\n${url}` : url
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
    }
  }
}
