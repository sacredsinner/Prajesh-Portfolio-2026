"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { boundsOf, type Rect } from "@/lib/canvas"

// Pan and zoom for the canvas. `view` = { x, y, scale }: canvas point p shows on screen at
// (p * scale + offset). Wheel zooms around the cursor (ctrl/trackpad pinch) or pans.

export type View = { x: number; y: number; scale: number }
export const MIN_SCALE = 0.1
export const MAX_SCALE = 4

export function useViewport(initial?: View) {
  const [view, setView] = useState<View>(initial ?? { x: 80, y: 80, scale: 1 })
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const stopAnimation = useCallback(() => {
    if (animTimer.current) {
      clearTimeout(animTimer.current)
      animTimer.current = null
    }
    setIsAnimating(false)
  }, [])

  const toCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (clientX - rect.left - view.x) / view.scale, y: (clientY - rect.top - view.y) / view.scale }
  }, [view])

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    stopAnimation()
    setView((v) => {
      const rect = ref.current?.getBoundingClientRect()
      const cx = clientX !== undefined && rect ? clientX - rect.left : (rect?.width ?? 0) / 2
      const cy = clientY !== undefined && rect ? clientY - rect.top : (rect?.height ?? 0) / 2
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor))
      const k = scale / v.scale
      return { scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
    })
  }, [stopAnimation])

  const fitTo = useCallback((rect: Rect, padding = 64, smooth = false) => {
    const el = ref.current
    if (!el || rect.w <= 0 || rect.h <= 0) return
    const pad = Math.min(padding, el.clientWidth / 8, el.clientHeight / 8) // keep some canvas on narrow screens
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min((el.clientWidth - pad * 2) / rect.w, (el.clientHeight - pad * 2) / rect.h, 1.5)))
    const target = { scale, x: (el.clientWidth - rect.w * scale) / 2 - rect.x * scale, y: (el.clientHeight - rect.h * scale) / 2 - rect.y * scale }

    if (smooth) {
      if (animTimer.current) clearTimeout(animTimer.current)
      setIsAnimating(true)
      setView(target)
      animTimer.current = setTimeout(() => {
        setIsAnimating(false)
        animTimer.current = null
      }, 550)
    } else {
      stopAnimation()
      setView(target)
    }
  }, [stopAnimation])

  const fitItems = useCallback((items: Rect[], smooth = false) => (items.length ? fitTo(boundsOf(items), 64, smooth) : setView({ x: 80, y: 80, scale: 1 })), [fitTo])

  // Wheel: pinch/ctrl = zoom, otherwise pan. Attached natively so preventDefault works.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      stopAnimation()
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY)
      else setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [zoomAt, stopAnimation])

  useEffect(() => {
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current)
    }
  }, [])

  return { view, setView, ref, toCanvas, zoomAt, fitTo, fitItems, isAnimating, stopAnimation }
}
