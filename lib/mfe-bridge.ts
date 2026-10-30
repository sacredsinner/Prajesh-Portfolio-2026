"use client"

import * as React from "react"

export interface MfeBridgeOptions {
  name?: string
  version?: string
  route?: string
  onRefresh?: () => void
  onSetTab?: (tab: string) => void
}

export function useMicroFrontendBridge({
  name = "studio-overview-mobile",
  version = "2026.1.0",
  route = "/overview",
  onRefresh,
  onSetTab,
}: MfeBridgeOptions = {}) {
  const [isEmbedded, setIsEmbedded] = React.useState(false)

  React.useEffect(() => {
    // Detect if embedded inside an iframe or native mobile webview
    const inIframe = typeof window !== "undefined" && window.self !== window.top
    setIsEmbedded(inIframe)

    // Notify host that micro frontend is mounted and ready
    const notifyReady = () => {
      try {
        if (typeof window !== "undefined" && window.parent) {
          window.parent.postMessage(
            {
              type: "VERCEL_MFE_READY",
              name,
              version,
              route,
              timestamp: Date.now(),
            },
            "*"
          )
        }
      } catch {
        // Cross-origin safe
      }
    }

    notifyReady()

    // Handle height auto-resizing for iframe containers
    const notifyResize = () => {
      try {
        if (typeof window !== "undefined" && window.parent) {
          const height = document.documentElement.scrollHeight || document.body.scrollHeight
          window.parent.postMessage(
            {
              type: "VERCEL_MFE_RESIZE",
              name,
              height,
            },
            "*"
          )
        }
      } catch {
        // Ignore
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      notifyResize()
    })

    if (document.body) {
      resizeObserver.observe(document.body)
    }

    // Listen for incoming host actions
    const handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== "object") return

      if (data.type === "VERCEL_MFE_REFRESH") {
        onRefresh?.()
      } else if (data.type === "VERCEL_MFE_SET_TAB" && data.tab) {
        onSetTab?.(String(data.tab))
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("message", handleMessage)
    }
  }, [name, version, route, onRefresh, onSetTab])

  // Dispatch custom action to host shell
  const emitAction = React.useCallback(
    (actionName: string, payload?: unknown) => {
      try {
        if (typeof window !== "undefined" && window.parent) {
          window.parent.postMessage(
            {
              type: "VERCEL_MFE_ACTION",
              name,
              action: actionName,
              payload,
              timestamp: Date.now(),
            },
            "*"
          )
        }
      } catch {
        // Ignore
      }
    },
    [name]
  )

  // Dispatch navigation change to host shell
  const emitNavigation = React.useCallback(
    (tab: string) => {
      try {
        if (typeof window !== "undefined" && window.parent) {
          window.parent.postMessage(
            {
              type: "VERCEL_MFE_NAVIGATE",
              name,
              tab,
              timestamp: Date.now(),
            },
            "*"
          )
        }
      } catch {
        // Ignore
      }
    },
    [name]
  )

  return { isEmbedded, emitAction, emitNavigation }
}
