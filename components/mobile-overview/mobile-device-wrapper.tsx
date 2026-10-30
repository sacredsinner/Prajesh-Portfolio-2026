"use client"

import * as React from "react"
import { Smartphone, Monitor } from "lucide-react"

interface MobileDeviceWrapperProps {
  children: React.ReactNode
  isEmbedded?: boolean
}

export function MobileDeviceWrapper({ children, isEmbedded = false }: MobileDeviceWrapperProps) {
  const [mode, setMode] = React.useState<"iphone" | "fluid">("iphone")
  const [isClientMobile, setIsClientMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsClientMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // If already embedded in an iframe/webview or on physical mobile screens, render full native
  if (isEmbedded || isClientMobile) {
    return <div className="w-full min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[#EFEFEA] dark:bg-[#12110E] flex flex-col items-center justify-start py-8 px-4 transition-colors">
      {/* Top Device Simulator Bar for Desktop Previewers */}
      <div className="w-full max-w-[430px] flex items-center justify-between py-2 px-3 mb-4 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-medium tracking-tight text-foreground">
            Vercel MFE · Mobile Preview
          </span>
        </div>
        <div className="flex items-center gap-1 bg-secondary/80 rounded-full p-0.5 border border-border/50">
          <button
            onClick={() => setMode("iphone")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-all ${
              mode === "iphone"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-3 w-3" />
            Phone (390px)
          </button>
          <button
            onClick={() => setMode("fluid")}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-all ${
              mode === "fluid"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-3 w-3" />
            Fluid
          </button>
        </div>
      </div>

      {mode === "fluid" ? (
        <div className="w-full max-w-2xl bg-background rounded-2xl border border-border shadow-xl overflow-hidden min-h-[844px]">
          {children}
        </div>
      ) : (
        /* iPhone Device Shell */
        <div className="relative w-full max-w-[400px] h-[844px] rounded-[52px] border-[10px] border-[#2C2B27] dark:border-[#383732] bg-background shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/10">
          {/* Dynamic Island / Speaker Pill */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-28 h-6 bg-black rounded-full flex items-center justify-end px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#111] ring-1 ring-neutral-800" />
          </div>

          {/* Content Viewport */}
          <div className="w-full h-full overflow-y-auto no-scrollbar pt-6">{children}</div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-50 w-32 h-1 bg-foreground/30 rounded-full pointer-events-none" />
        </div>
      )}
    </div>
  )
}
