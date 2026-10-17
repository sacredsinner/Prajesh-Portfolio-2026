"use client"

import { useRef, type ReactNode } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, SplitText)

// GSAP entrance for the homepage hero, in the brand's motion language: the headline
// is set line by line, each line rising out of its own mask with a long ease-out,
// then the supporting text follows. Nothing bounces, rotates or scales.
//
// Mark the parts inside with data attributes:
//   data-hero="kicker" · data-hero="title" (split into lines) · data-hero="fade"
//
// The block starts hidden (.hero-motion in globals.css) so the text doesn't flash
// before the animation. It is revealed here, or by CSS after 2.5s if scripts are
// slow or blocked, and people who ask for reduced motion get the static text.
export function HeroMotion({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { autoAlpha: 1 })
      })

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // If the CSS fallback has already shown the text, don't hide it again.
        if (performance.now() > 2300) {
          gsap.set(el, { autoAlpha: 1 })
          return
        }

        const kicker = el.querySelector("[data-hero='kicker']")
        const title = el.querySelector<HTMLElement>("[data-hero='title']")
        const followers = el.querySelectorAll("[data-hero='fade']")

        gsap.set(el, { autoAlpha: 1 })

        const intro = gsap.timeline({ defaults: { ease: "expo.out" } })
        if (kicker) intro.from(kicker, { autoAlpha: 0, y: 14, duration: 0.9 }, 0)
        if (followers.length) intro.from(followers, { autoAlpha: 0, y: 20, duration: 1, stagger: 0.12 }, 0.55)

        // Lines are re-measured if the window resizes or the fonts finish loading
        // mid-animation; returning the tween lets SplitText carry on from the same point.
        const split = title
          ? SplitText.create(title, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) => {
                // Room below each mask so descenders (g, y, p) aren't clipped while lines rise.
                gsap.set(self.masks, { paddingBottom: "0.15em", marginBottom: "-0.15em" })
                return gsap.from(self.lines, {
                  yPercent: 120,
                  duration: 1.15,
                  stagger: 0.09,
                  ease: "expo.out",
                  delay: 0.12,
                  // Once it has landed, put the headline back to plain text.
                  onComplete: () => {
                    self.kill()
                    self.revert()
                  },
                })
              },
            })
          : null

        return () => split?.revert()
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className={cn("hero-motion", className)}>
      {children}
    </div>
  )
}
