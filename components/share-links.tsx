"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Link as LinkIcon, Share } from "lucide-react"
import { SHARE_NETWORK_LABELS, shareHref, type ShareContent, type ShareNetwork } from "@/lib/share"

// A row of share links in the mono system: hairline boxes, ink text, square
// corners like the site's other outline buttons. Networks are plain names (like
// the footer's social links); the two actions carry an icon in currentColor.
// The page supplies the heading ("Share this note", "Share this project").
//
// The links are plain anchors rendered on the server, so they work without
// JavaScript. "Share…" opens the device's share sheet and only appears where
// the browser has one (most phones, some desktop browsers); on a phone that's
// also the way to Instagram, which has no share link for websites.

const DEFAULT_NETWORKS: ShareNetwork[] = ["linkedin", "x", "facebook", "whatsapp", "email"]

const item =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-border px-4 text-sm tracking-wide text-foreground transition-colors duration-200 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
const icon = "size-3.5 shrink-0"

type Gtag = (command: "event", name: string, params: Record<string, string | undefined>) => void

// GA4's recommended "share" event, so Google Analytics can show which networks people share to.
function track(method: string, contentType: string | undefined, url: string) {
  const gtag = (window as typeof window & { gtag?: Gtag }).gtag
  let itemId = url
  try {
    itemId = new URL(url).pathname
  } catch {
    // keep the full address
  }
  gtag?.("event", "share", { method, content_type: contentType, item_id: itemId })
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers, or the Clipboard API is blocked: copy from a hidden field instead.
    try {
      const field = document.createElement("textarea")
      field.value = text
      field.setAttribute("readonly", "")
      field.style.position = "fixed"
      field.style.opacity = "0"
      document.body.appendChild(field)
      field.select()
      const copied = document.execCommand("copy")
      field.remove()
      return copied
    } catch {
      return false
    }
  }
}

export interface ShareLinksProps extends ShareContent {
  /** Which networks to list, in order. Pinterest is left out when there's no image. */
  networks?: ShareNetwork[]
  /** For analytics: what's being shared, e.g. "note" or "project". */
  contentType?: string
  className?: string
}

export function ShareLinks({ url, title, summary, image, networks = DEFAULT_NETWORKS, contentType, className }: ShareLinksProps) {
  const [canShare, setCanShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  // Whether there's a share sheet is only known in the browser, so "Share…" appears after hydration.
  useEffect(() => {
    setCanShare(typeof navigator.share === "function")
    return () => window.clearTimeout(timer.current)
  }, [])

  const content = { url, title, summary, image }
  const shown = networks.filter((network) => network !== "pinterest" || Boolean(image))

  async function copyLink() {
    if (!(await copyText(url))) {
      window.prompt("Copy this link:", url)
      return
    }
    track("copy_link", contentType, url)
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  async function openShareSheet() {
    try {
      await navigator.share({ title, url })
      track("share_sheet", contentType, url)
    } catch (error) {
      // Closing the sheet is fine. Anything else (the sheet refused) falls back to copying the link.
      if (error instanceof DOMException && error.name === "AbortError") return
      await copyLink()
    }
  }

  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-2">
        {canShare && (
          <li>
            <button type="button" onClick={openShareSheet} className={item}>
              Share…
              <Share aria-hidden className={icon} />
            </button>
          </li>
        )}
        {shown.map((network) => {
          const label = SHARE_NETWORK_LABELS[network]
          const email = network === "email"
          return (
            <li key={network}>
              <a
                href={shareHref(network, content)}
                {...(email ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                aria-label={email ? "Share by email" : `Share on ${label} (opens in a new tab)`}
                onClick={() => track(network, contentType, url)}
                className={item}
              >
                {label}
              </a>
            </li>
          )
        })}
        <li>
          <button type="button" onClick={copyLink} className={item}>
            {copied ? "Copied" : "Copy link"}
            {copied ? <Check aria-hidden className={icon} /> : <LinkIcon aria-hidden className={icon} />}
          </button>
        </li>
      </ul>
      <p role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  )
}
