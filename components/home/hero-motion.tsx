import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// Container for the homepage hero. Animations are executed via GPU-accelerated CSS
// in app/globals.css (.hero-animate-*) for zero-JS overhead, sub-second LCP,
// and zero Total Blocking Time (TBT).
export function HeroMotion({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("hero-motion", className)}>
      {children}
    </div>
  )
}
