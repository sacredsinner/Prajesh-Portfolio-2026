"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { boundsOf, type Rect } from "@/lib/canvas"

// Pan and zoom for the canvas. `view` = { x, y, scale }: canvas point p shows on screen at
// (p * scale + offset). Wheel zooms smoothly around the cursor with RAF damping, buttons and
// gestures animate smoothly, and touchscreens support multi-touch pinch-to-zoom.

export type View = { x: number; y: number; scale: number }
export const MIN_SCALE = 0.1
export const MAX_SCALE = 4

export function useViewport(initial?: View) {
  const [view, setView] = useState<View>(initial ?? { x: 80, y: 80, scale: 1 })
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Keep fresh mutable reference to view for RAF and high-frequency touch/wheel events
  const viewRef = useRef<View>(view)
  viewRef.current = view

  // Target view for RAF wheel/interpolation zoom
  const targetViewRef = useRef<View>(view)
  const rafId = useRef<number | null>(null)

  // Touch gesture state for multi-touch pinch and two-finger pan
  const touchState = useRef<{
    dist: number
    mid: { x: number; y: number }
    viewStart: View
  } | null>(null)

  const stopAnimation = useCallback(() => {
    if (animTimer.current) {
      clearTimeout(animTimer.current)
      animTimer.current = null
    }
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    setIsAnimating(false)
  }, [])

  const toCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const current = viewRef.current
    return { x: (clientX - rect.left - current.x) / current.scale, y: (clientY - rect.top - current.y) / current.scale }
  }, [])

  // Smooth discrete zoom (for buttons, shortcuts, double-clicks)
  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number, smooth = true) => {
    stopAnimation()
    const v = viewRef.current
    const rect = ref.current?.getBoundingClientRect()
    const cx = clientX !== undefined && rect ? clientX - rect.left : (rect?.width ?? 0) / 2
    const cy = clientY !== undefined && rect ? clientY - rect.top : (rect?.height ?? 0) / 2
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor))
    const k = scale / v.scale
    const target = { scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }

    targetViewRef.current = target
    viewRef.current = target

    if (smooth) {
      setIsAnimating(true)
      setView(target)
      animTimer.current = setTimeout(() => {
        setIsAnimating(false)
        animTimer.current = null
      }, 450)
    } else {
      setView(target)
    }
  }, [stopAnimation])

  // Smooth fit to a target rect (e.g. slide frames or bounding boxes)
  const fitTo = useCallback((rect: Rect, padding = 64, smooth = true) => {
    const el = ref.current
    if (!el || rect.w <= 0 || rect.h <= 0) return
    stopAnimation()
    const pad = Math.min(padding, el.clientWidth / 8, el.clientHeight / 8) // keep some canvas on narrow screens
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min((el.clientWidth - pad * 2) / rect.w, (el.clientHeight - pad * 2) / rect.h, 1.5)))
    const target = { scale, x: (el.clientWidth - rect.w * scale) / 2 - rect.x * scale, y: (el.clientHeight - rect.h * scale) / 2 - rect.y * scale }

    targetViewRef.current = target
    viewRef.current = target

    if (smooth) {
      setIsAnimating(true)
      setView(target)
      animTimer.current = setTimeout(() => {
        setIsAnimating(false)
        animTimer.current = null
      }, 550)
    } else {
      setView(target)
    }
  }, [stopAnimation])

  const fitItems = useCallback((items: Rect[], smooth = true) => {
    if (items.length) {
      fitTo(boundsOf(items), 64, smooth)
    } else {
      stopAnimation()
      const target = { x: 80, y: 80, scale: 1 }
      targetViewRef.current = target
      viewRef.current = target
      if (smooth) {
        setIsAnimating(true)
        setView(target)
        animTimer.current = setTimeout(() => {
          setIsAnimating(false)
          animTimer.current = null
        }, 450)
      } else {
        setView(target)
      }
    }
  }, [fitTo, stopAnimation])

  // Start continuous RAF damping loop for silky-smooth wheel & trackpad zoom
  const startLerpLoop = useCallback(() => {
    if (rafId.current !== null) return
    setIsAnimating(false)

    const tick = () => {
      const current = viewRef.current
      const target = targetViewRef.current

      const dScale = target.scale - current.scale
      const dx = target.x - current.x
      const dy = target.y - current.y

      // Snap to final state when close enough
      if (Math.abs(dScale) < 0.0008 && Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
        setView(target)
        viewRef.current = target
        rafId.current = null
        return
      }

      // Smooth damped lerp factor
      const friction = 0.32
      const nextScale = current.scale + dScale * friction
      const nextX = current.x + dx * friction
      const nextY = current.y + dy * friction

      const nextView = { scale: nextScale, x: nextX, y: nextY }
      viewRef.current = nextView
      setView(nextView)

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)
  }, [])

  // Wheel listener: trackpad pinch / Ctrl-wheel / Alt-wheel zooms with subpixel damping; otherwise pans
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      const isZoomGesture = e.ctrlKey || e.metaKey || e.altKey

      if (isZoomGesture) {
        if (animTimer.current) {
          clearTimeout(animTimer.current)
          animTimer.current = null
          setIsAnimating(false)
        }

        const rect = el.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top

        // Normalize delta across mouse wheels and trackpads
        const isLineMode = e.deltaMode === 1
        const rawDelta = isLineMode ? e.deltaY * 24 : e.deltaY
        const clampedDelta = Math.max(-120, Math.min(120, rawDelta))
        
        // Calibrated exponential zoom factor (avoids massive jumps on notched wheel ticks)
        const zoomFactor = Math.exp(-clampedDelta * 0.0028)

        const base = targetViewRef.current
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, base.scale * zoomFactor))
        const k = newScale / base.scale
        const newX = cx - (cx - base.x) * k
        const newY = cy - (cy - base.y) * k

        targetViewRef.current = { scale: newScale, x: newX, y: newY }
        startLerpLoop()
      } else {
        // Direct pan via wheel/trackpad scroll
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current)
          rafId.current = null
        }
        if (animTimer.current) {
          clearTimeout(animTimer.current)
          animTimer.current = null
          setIsAnimating(false)
        }

        const next = {
          ...viewRef.current,
          x: viewRef.current.x - e.deltaX,
          y: viewRef.current.y - e.deltaY,
        }
        targetViewRef.current = next
        viewRef.current = next
        setView(next)
      }
    }

    // Touch listeners for multi-touch pinch-to-zoom on tablets / mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        stopAnimation()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const rect = el.getBoundingClientRect()
        const ox = rect.left
        const oy = rect.top

        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        const mid = {
          x: (t1.clientX + t2.clientX) / 2 - ox,
          y: (t1.clientY + t2.clientY) / 2 - oy,
        }

        touchState.current = {
          dist: Math.max(dist, 1),
          mid,
          viewStart: { ...viewRef.current },
        }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchState.current) {
        e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const rect = el.getBoundingClientRect()
        const ox = rect.left
        const oy = rect.top

        const currDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        const currMid = {
          x: (t1.clientX + t2.clientX) / 2 - ox,
          y: (t1.clientY + t2.clientY) / 2 - oy,
        }

        const { dist: startDist, mid: startMid, viewStart } = touchState.current
        const scaleRatio = currDist / startDist
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, viewStart.scale * scaleRatio))

        const k = newScale / viewStart.scale
        const newX = currMid.x - (startMid.x - viewStart.x) * k
        const newY = currMid.y - (startMid.y - viewStart.y) * k

        const next = { scale: newScale, x: newX, y: newY }
        targetViewRef.current = next
        viewRef.current = next
        setView(next)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchState.current = null
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("touchstart", onTouchStart, { passive: false })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: false })
    el.addEventListener("touchcancel", onTouchEnd, { passive: false })

    return () => {
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [startLerpLoop, stopAnimation])

  useEffect(() => {
    return () => {
      if (animTimer.current) clearTimeout(animTimer.current)
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return { view, setView, ref, toCanvas, zoomAt, fitTo, fitItems, isAnimating, stopAnimation }
}
