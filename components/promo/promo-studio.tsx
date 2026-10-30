"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Sparkles, ExternalLink, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { BRAND_MARK_PATH } from "@/components/brand-mark"

type AspectRatio = "16:9" | "9:16" | "1:1"

const RATIO_CONFIG: Record<AspectRatio, { width: number; height: number; aspectClass: string; label: string; desc: string }> = {
  "16:9": { width: 1920, height: 1080, aspectClass: "aspect-video max-w-4xl", label: "16:9 Landscape", desc: "Hero Showcase & YouTube" },
  "9:16": { width: 1080, height: 1920, aspectClass: "aspect-[9/16] max-w-sm", label: "9:16 Vertical", desc: "Instagram Reels & TikTok" },
  "1:1":  { width: 1080, height: 1080, aspectClass: "aspect-square max-w-md", label: "1:1 Square", desc: "LinkedIn & Feed Grid" },
}

const SCENES = [
  { id: 0, time: 0, label: "01 Genesis", title: "Genesis & PS Monogram" },
  { id: 1, time: 7.5, label: "02 Aurora", title: "Aurora Wellness Case Study" },
  { id: 2, time: 16.5, label: "03 Atlas", title: "Atlas Ventures $120M Rebrand" },
  { id: 3, time: 25.5, label: "04 Studio", title: "Content Studio & Client Portals" },
  { id: 4, time: 34.0, label: "05 Outro", title: "Manifesto & Call to Action" },
]

export function PromoStudio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [ratio, setRatio] = useState<AspectRatio>("16:9")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recProgress, setRecProgress] = useState(0)
  const [speed, setSpeed] = useState(1.0)

  const duration = 42.0

  // References for animation and media recording
  const animFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const activeSceneRef = useRef<number>(-1)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Web Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  // Preloaded Images
  const imagesRef = useRef<{ aurora: HTMLImageElement; atlas: HTMLImageElement; meridian: HTMLImageElement } | null>(null)

  // Initialize images
  useEffect(() => {
    const aurora = new Image()
    aurora.src = "/images/projects/aurora-thumb.jpg"
    const atlas = new Image()
    atlas.src = "/images/projects/atlas-thumb.jpg"
    const meridian = new Image()
    meridian.src = "/images/projects/meridian-thumb.jpg"
    imagesRef.current = { aurora, atlas, meridian }
  }, [])

  // Web Audio init
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioContextClass()
      const dest = ctx.createMediaStreamDestination()
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(isMuted ? 0 : 0.4, ctx.currentTime)
      gain.connect(ctx.destination)
      gain.connect(dest)
      audioCtxRef.current = ctx
      audioDestRef.current = dest
      masterGainRef.current = gain
    } catch (e) {
      console.warn("Audio Context init suppressed", e)
    }
  }, [isMuted])

  // Sound transition cue
  const playSoundTransition = useCallback((sceneIndex: number) => {
    const ctx = audioCtxRef.current
    const gain = masterGainRef.current
    if (!ctx || !gain || isMuted) return
    const t = ctx.currentTime

    // Sub-bass sweep
    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    sub.type = "sine"
    const freqs = [65.4, 73.4, 55.0, 82.4, 65.4]
    const f0 = freqs[sceneIndex % freqs.length]
    sub.frequency.setValueAtTime(f0 * 1.5, t)
    sub.frequency.exponentialRampToValueAtTime(f0, t + 0.35)
    subGain.gain.setValueAtTime(0, t)
    subGain.gain.linearRampToValueAtTime(0.4, t + 0.04)
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
    sub.connect(subGain)
    subGain.connect(gain)
    sub.start(t)
    sub.stop(t + 1.3)

    // Tick
    const tick = ctx.createOscillator()
    const tickGain = ctx.createGain()
    tick.type = "triangle"
    tick.frequency.setValueAtTime(1400, t)
    tick.frequency.exponentialRampToValueAtTime(300, t + 0.05)
    tickGain.gain.setValueAtTime(0.18, t)
    tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    tick.connect(tickGain)
    tickGain.connect(gain)
    tick.start(t)
    tick.stop(t + 0.07)

    // Warm Chord
    const chord = [
      [261.63, 329.63, 392.0],
      [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63],
      [196.00, 246.94, 293.66],
      [261.63, 392.00, 523.25],
    ][sceneIndex % 5]

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const pGain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(freq, t)
      filter.type = "lowpass"
      filter.frequency.setValueAtTime(350 + idx * 120, t)
      filter.frequency.linearRampToValueAtTime(650 + idx * 150, t + 1.0)
      filter.frequency.exponentialRampToValueAtTime(150, t + 3.0)
      pGain.gain.setValueAtTime(0, t)
      pGain.gain.linearRampToValueAtTime(0.05, t + 0.3)
      pGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2)
      osc.connect(filter)
      filter.connect(pGain)
      pGain.connect(gain)
      osc.start(t)
      osc.stop(t + 3.3)
    })
  }, [isMuted])

  // Canvas Drawing
  const drawKenBurns = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, progress: number, maxZoom = 1.08, radius = 8) => {
    ctx.save()
    if (radius > 0) {
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, radius)
      ctx.clip()
    }
    if (!img || !img.complete || img.naturalWidth === 0) {
      ctx.fillStyle = "#2A2925"
      ctx.fillRect(x, y, w, h)
      ctx.fillStyle = "#8B897F"
      ctx.font = '16px "Geist Mono", monospace'
      ctx.fillText("LOADING ASSET...", x + 20, y + h / 2)
      ctx.restore()
      return
    }
    const zoom = 1 + (maxZoom - 1) * progress
    const panX = (progress - 0.5) * 24
    const panY = (progress - 0.5) * 16
    const destW = w * zoom
    const destH = h * zoom
    const destX = x - (destW - w) / 2 + panX
    const destY = y - (destH - h) / 2 + panY

    const imgAspect = img.naturalWidth / img.naturalHeight
    const boxAspect = destW / destH
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (imgAspect > boxAspect) {
      sw = img.naturalHeight * boxAspect
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth / boxAspect
      sy = (img.naturalHeight - sh) / 2
    }
    ctx.drawImage(img, sx, sy, sw, sh, destX, destY, destW, destH)

    const grad = ctx.createLinearGradient(x, y, x, y + h)
    grad.addColorStop(0, "rgba(0,0,0,0.02)")
    grad.addColorStop(0.7, "rgba(0,0,0,0.05)")
    grad.addColorStop(1, "rgba(0,0,0,0.35)")
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)
    ctx.restore()
  }

  const brandMarkPath2D = useRef<Path2D | null>(null)
  if (!brandMarkPath2D.current && typeof window !== "undefined") {
    brandMarkPath2D.current = new Path2D(BRAND_MARK_PATH)
  }

  const drawBrandMark = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) => {
    if (!brandMarkPath2D.current) return
    ctx.save()
    ctx.translate(cx - size / 2, cy - size / 2)
    ctx.scale(size / 100, size / 100)
    ctx.fillStyle = color
    ctx.fill(brandMarkPath2D.current)
    ctx.restore()
  }

  const renderFrame = useCallback((t: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const isVertical = ratio === "9:16"

    let scene = 0
    if (t < 7.5) scene = 0
    else if (t < 16.5) scene = 1
    else if (t < 25.5) scene = 2
    else if (t < 34.0) scene = 3
    else scene = 4

    if (scene !== activeSceneRef.current) {
      activeSceneRef.current = scene
      playSoundTransition(scene)
    }

    const GROUND = "#F5F5F3"
    const INK = "#1B1A16"
    const INK_SOFT = "#45443D"
    const KICKER = "#6F6D63"
    const HAIRLINE = "#D9D7CD"
    const HAIRLINE_DARK = "#3A3932"

    const imgs = imagesRef.current

    ctx.save()

    // SCENE 0: GENESIS
    if (scene === 0) {
      const p = t / 7.5
      const enter = Math.min(1, p / 0.3)
      const exit = t > 6.8 ? (t - 6.8) / 0.7 : 0

      ctx.fillStyle = GROUND
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = "rgba(217, 215, 205, 0.45)"
      ctx.lineWidth = 1
      const gridStep = W / 16
      for (let x = -H; x < W + H; x += gridStep) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + H, H)
        ctx.stroke()
      }

      const markSize = isVertical ? 180 : 160
      const markX = W / 2
      const markY = isVertical ? H * 0.38 : H * 0.42
      const scaleVal = 0.85 + 0.15 * enter - exit * 0.1

      ctx.save()
      ctx.translate(markX, markY)
      ctx.scale(scaleVal, scaleVal)

      ctx.strokeStyle = "rgba(27, 26, 22, 0.15)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 6])
      ctx.beginPath()
      ctx.arc(0, 0, markSize * 0.78, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      drawBrandMark(ctx, 0, 0, markSize, INK)
      ctx.restore()

      const textY = isVertical ? H * 0.58 : H * 0.65
      ctx.textAlign = "center"

      ctx.font = '500 14px "Geist Mono", monospace'
      ctx.fillStyle = KICKER
      ctx.fillText("01 / BRAND IDENTITY ARCHITECTURE", W / 2, textY - 35)

      ctx.font = 'italic 72px "Instrument Serif", Georgia, serif'
      ctx.fillStyle = INK
      ctx.fillText("Prajesh Shakya", W / 2, textY + 30)

      ctx.font = '500 18px "Instrument Sans", sans-serif'
      ctx.fillStyle = INK_SOFT
      ctx.fillText("Portfolio & Content Studio · 2026 Edition", W / 2, textY + 70)

      ctx.font = '400 13px "Geist Mono", monospace'
      ctx.fillStyle = KICKER
      ctx.fillText("Quiet Editorial Confidence · Typographic Truth · Digital Craft", W / 2, textY + 115)
    }

    // SCENE 1: AURORA WELLNESS
    else if (scene === 1) {
      const p = (t - 7.5) / 9.0
      ctx.fillStyle = GROUND
      ctx.fillRect(0, 0, W, H)

      if (!isVertical && imgs) {
        const margin = W * 0.08
        const leftW = W * 0.44
        const rightX = margin + leftW + W * 0.05
        const rightW = W - rightX - margin
        const boxY = H * 0.15
        const boxH = H * 0.70

        drawKenBurns(ctx, imgs.aurora, margin, boxY, leftW, boxH, p, 1.08, 6)
        ctx.strokeStyle = HAIRLINE
        ctx.lineWidth = 1
        ctx.strokeRect(margin, boxY, leftW, boxH)

        ctx.textAlign = "left"
        let ty = boxY + 40

        ctx.font = '500 13px "Geist Mono", monospace'
        ctx.fillStyle = KICKER
        ctx.fillText("SELECTED WORK · HOSPITALITY", rightX, ty)
        ty += 55

        ctx.font = 'italic 58px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = INK
        ctx.fillText("Aurora Wellness", rightX, ty)
        ty += 35

        ctx.font = '400 18px "Instrument Sans", sans-serif'
        ctx.fillStyle = INK_SOFT
        ctx.fillText("Mindful luxury retreat identity & brand experience", rightX, ty)
        ty += 60

        ctx.fillStyle = "#ECEBE5"
        ctx.beginPath()
        ctx.roundRect(rightX, ty, rightW, 110, 6)
        ctx.fill()
        ctx.strokeStyle = HAIRLINE
        ctx.stroke()

        ctx.font = 'italic 44px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = INK
        ctx.fillText("+45%", rightX + 24, ty + 50)

        ctx.font = '600 14px "Instrument Sans", sans-serif'
        ctx.fillStyle = INK
        ctx.fillText("Direct Bookings Surge", rightX + 150, ty + 38)

        ctx.font = '400 12px "Geist Mono", monospace'
        ctx.fillStyle = KICKER
        ctx.fillText("Himalayan sanctuary rebrand · $2.4M pipeline", rightX + 150, ty + 62)
        ty += 145

        ctx.font = '500 12px "Geist Mono", monospace'
        ctx.fillStyle = INK_SOFT
        ctx.fillText("FIELDS: Brand Identity · Packaging · Spatial Architecture", rightX, ty)
      } else if (imgs) {
        const margin = W * 0.08
        const boxW = W - margin * 2
        const imgH = H * 0.42
        const imgY = H * 0.12

        drawKenBurns(ctx, imgs.aurora, margin, imgY, boxW, imgH, p, 1.08, 8)
        ctx.strokeStyle = HAIRLINE
        ctx.strokeRect(margin, imgY, boxW, imgH)

        ctx.textAlign = "center"
        let ty = imgY + imgH + 45

        ctx.font = '500 13px "Geist Mono", monospace'
        ctx.fillStyle = KICKER
        ctx.fillText("SELECTED WORK · HOSPITALITY", W / 2, ty)
        ty += 50

        ctx.font = 'italic 52px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = INK
        ctx.fillText("Aurora Wellness", W / 2, ty)
        ty += 35

        ctx.font = '400 18px "Instrument Sans", sans-serif'
        ctx.fillStyle = INK_SOFT
        ctx.fillText("Mindful luxury retreat identity system", W / 2, ty)
        ty += 65

        ctx.fillStyle = "#ECEBE5"
        ctx.beginPath()
        ctx.roundRect(margin, ty, boxW, 90, 6)
        ctx.fill()
        ctx.strokeStyle = HAIRLINE
        ctx.stroke()

        ctx.font = 'italic 38px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = INK
        ctx.fillText("+45% Direct Bookings Surge", W / 2, ty + 42)
        ctx.font = '400 13px "Geist Mono", monospace'
        ctx.fillStyle = KICKER
        ctx.fillText("Himalayan retreat rebrand · 6-month metric", W / 2, ty + 68)
      }
    }

    // SCENE 2: ATLAS VENTURES ($120M REBRAND)
    else if (scene === 2) {
      const p = (t - 16.5) / 9.0
      ctx.fillStyle = "#1B1A16"
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = "rgba(58, 57, 50, 0.6)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(W * 0.8, H * 0.5, H * 0.35, 0, Math.PI * 2)
      ctx.stroke()

      if (!isVertical && imgs) {
        const margin = W * 0.08
        const leftW = W * 0.44
        const rightX = margin + leftW + W * 0.05
        const rightW = W - rightX - margin
        const boxY = H * 0.15
        const boxH = H * 0.70

        drawKenBurns(ctx, imgs.atlas, margin, boxY, leftW, boxH, p, 1.08, 6)
        ctx.strokeStyle = HAIRLINE_DARK
        ctx.strokeRect(margin, boxY, leftW, boxH)

        ctx.textAlign = "left"
        let ty = boxY + 40

        ctx.font = '500 13px "Geist Mono", monospace'
        ctx.fillStyle = "#A3A196"
        ctx.fillText("VENTURE CAPITAL · CORPORATE IDENTITY", rightX, ty)
        ty += 55

        ctx.font = 'italic 58px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = "#F5F5F3"
        ctx.fillText("Atlas Ventures", rightX, ty)
        ty += 35

        ctx.font = '400 18px "Instrument Sans", sans-serif'
        ctx.fillStyle = "#C7C5BA"
        ctx.fillText("Precision monogram & institutional investor collateral", rightX, ty)
        ty += 60

        ctx.fillStyle = "#2C2B25"
        ctx.beginPath()
        ctx.roundRect(rightX, ty, rightW, 110, 6)
        ctx.fill()
        ctx.strokeStyle = HAIRLINE_DARK
        ctx.stroke()

        ctx.font = 'italic 44px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = "#F5F5F3"
        ctx.fillText("$120M", rightX + 24, ty + 50)

        ctx.font = '600 14px "Instrument Sans", sans-serif'
        ctx.fillStyle = "#F5F5F3"
        ctx.fillText("Closed Institutional Fund", rightX + 170, ty + 38)

        ctx.font = '400 12px "Geist Mono", monospace'
        ctx.fillStyle = "#A3A196"
        ctx.fillText("Global founder network & dealflow monograph", rightX + 170, ty + 62)
        ty += 145

        ctx.font = 'italic 16px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = "#C7C5BA"
        ctx.fillText('"The identity immediately commands respect in boardroom presentations."', rightX, ty)
      } else if (imgs) {
        const margin = W * 0.08
        const boxW = W - margin * 2
        const imgH = H * 0.42
        const imgY = H * 0.12

        drawKenBurns(ctx, imgs.atlas, margin, imgY, boxW, imgH, p, 1.08, 8)
        ctx.strokeStyle = HAIRLINE_DARK
        ctx.strokeRect(margin, imgY, boxW, imgH)

        ctx.textAlign = "center"
        let ty = imgY + imgH + 45

        ctx.font = '500 13px "Geist Mono", monospace'
        ctx.fillStyle = "#A3A196"
        ctx.fillText("VENTURE CAPITAL · INSTITUTIONAL", W / 2, ty)
        ty += 50

        ctx.font = 'italic 52px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = "#F5F5F3"
        ctx.fillText("Atlas Ventures", W / 2, ty)
        ty += 35

        ctx.font = '400 18px "Instrument Sans", sans-serif'
        ctx.fillStyle = "#C7C5BA"
        ctx.fillText("Monogram system & investor collateral", W / 2, ty)
        ty += 65

        ctx.fillStyle = "#2C2B25"
        ctx.beginPath()
        ctx.roundRect(margin, ty, boxW, 90, 6)
        ctx.fill()
        ctx.strokeStyle = HAIRLINE_DARK
        ctx.stroke()

        ctx.font = 'italic 38px "Instrument Serif", Georgia, serif'
        ctx.fillStyle = "#F5F5F3"
        ctx.fillText("$120M Closed Fund", W / 2, ty + 42)
        ctx.font = '400 13px "Geist Mono", monospace'
        ctx.fillStyle = "#A3A196"
        ctx.fillText("Modern frontier technology & sustainable commerce", W / 2, ty + 68)
      }
    }

    // SCENE 3: PROPRIETARY CONTENT STUDIO
    else if (scene === 3) {
      ctx.fillStyle = GROUND
      ctx.fillRect(0, 0, W, H)

      ctx.textAlign = "center"
      const topY = isVertical ? H * 0.08 : H * 0.12

      ctx.font = '500 13px "Geist Mono", monospace'
      ctx.fillStyle = KICKER
      ctx.fillText("03 / PROPRIETARY CONTENT STUDIO", W / 2, topY)

      ctx.font = 'italic 48px "Instrument Serif", Georgia, serif'
      ctx.fillStyle = INK
      ctx.fillText("Engineered for Creative Precision", W / 2, topY + 50)

      const cardY = topY + 95
      const cardH = 220

      if (!isVertical) {
        const cardW = (W * 0.84 - 40) / 3
        const startX = W * 0.08

        const cards = [
          { num: "01", title: "Behance-Style Studio", sub: "15 Content Blocks", desc: "Carousels, Before/After Slider, Video MP4, Focal crop & Multi-device preview." },
          { num: "02", title: "Client Moodboards", sub: "Infinite Pinboard (/m/)", desc: "Tokenized client review boards with interactive commenting & live approval." },
          { num: "03", title: "Automated Invoicing", sub: "Multi-Currency Engine (/i/)", desc: "Direct client quotes & invoices with high-precision automated PDF generation." },
        ]

        cards.forEach((c, idx) => {
          const cx = startX + idx * (cardW + 20)
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.roundRect(cx, cardY, cardW, cardH, 8)
          ctx.fill()
          ctx.strokeStyle = HAIRLINE
          ctx.stroke()

          ctx.textAlign = "left"
          ctx.font = '600 12px "Geist Mono", monospace'
          ctx.fillStyle = KICKER
          ctx.fillText(c.num + " / ARCHITECTURE", cx + 24, cardY + 36)

          ctx.font = 'italic 26px "Instrument Serif", Georgia, serif'
          ctx.fillStyle = INK
          ctx.fillText(c.title, cx + 24, cardY + 75)

          ctx.font = '600 13px "Instrument Sans", sans-serif'
          ctx.fillStyle = "#2447FF"
          ctx.fillText(c.sub, cx + 24, cardY + 105)

          ctx.font = '400 13px "Instrument Sans", sans-serif'
          ctx.fillStyle = INK_SOFT
          ctx.fillText(c.desc, cx + 24, cardY + 140)
        })

        ctx.textAlign = "center"
        ctx.font = '500 13px "Geist Mono", monospace'
        ctx.fillStyle = KICKER
        ctx.fillText("TECH STACK: Next.js 16 App Router · Neon Postgres · Drizzle · Better Auth · Vercel Blob", W / 2, H * 0.88)
      } else {
        const cardW = W * 0.84
        const cx = W * 0.08
        const cards = [
          { num: "01", title: "Behance Studio", sub: "15 Modular CMS Blocks & Preview" },
          { num: "02", title: "Client Portals", sub: "Tokenized Infinite Canvas Moodboards" },
          { num: "03", title: "Invoicing Engine", sub: "Automated Multi-Currency PDF Generation" },
        ]
        cards.forEach((c, idx) => {
          const cy = cardY + idx * 170
          ctx.fillStyle = "#FFFFFF"
          ctx.beginPath()
          ctx.roundRect(cx, cy, cardW, 140, 8)
          ctx.fill()
          ctx.strokeStyle = HAIRLINE
          ctx.stroke()

          ctx.textAlign = "left"
          ctx.font = '600 12px "Geist Mono", monospace'
          ctx.fillStyle = KICKER
          ctx.fillText(c.num + " / SYSTEM", cx + 20, cy + 32)

          ctx.font = 'italic 28px "Instrument Serif", Georgia, serif'
          ctx.fillStyle = INK
          ctx.fillText(c.title, cx + 20, cy + 72)

          ctx.font = '500 14px "Instrument Sans", sans-serif'
          ctx.fillStyle = INK_SOFT
          ctx.fillText(c.sub, cx + 20, cy + 105)
        })
      }
    }

    // SCENE 4: MANIFESTO & OUTRO
    else if (scene === 4) {
      const exit = t > 40.8 ? (t - 40.8) / 1.2 : 0

      ctx.fillStyle = GROUND
      ctx.fillRect(0, 0, W, H)

      const markSize = isVertical ? 150 : 130
      const markX = W / 2
      const markY = isVertical ? H * 0.28 : H * 0.30

      ctx.save()
      ctx.translate(markX, markY)
      const ringScale = 1 + Math.sin(t * 2) * 0.05
      ctx.strokeStyle = "rgba(27, 26, 22, 0.12)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, markSize * 0.72 * ringScale, 0, Math.PI * 2)
      ctx.stroke()

      drawBrandMark(ctx, 0, 0, markSize, INK)
      ctx.restore()

      ctx.textAlign = "center"
      let ty = markY + markSize * 0.65 + 30

      ctx.font = 'italic 52px "Instrument Serif", Georgia, serif'
      ctx.fillStyle = INK
      ctx.fillText("Crafted for Visionaries Who Value Restraint.", W / 2, ty)
      ty += 50

      ctx.font = '400 18px "Instrument Sans", sans-serif'
      ctx.fillStyle = INK_SOFT
      ctx.fillText("Independent Creative Direction & Bespoke Identity Systems", W / 2, ty)
      ty += 65

      const pillW = isVertical ? W * 0.84 : 440
      const pillX = (W - pillW) / 2
      ctx.fillStyle = "#ECEBE5"
      ctx.beginPath()
      ctx.roundRect(pillX, ty, pillW, 44, 22)
      ctx.fill()
      ctx.strokeStyle = HAIRLINE
      ctx.stroke()

      ctx.fillStyle = "#10B981"
      ctx.beginPath()
      ctx.arc(pillX + 24, ty + 22, 4.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.font = '600 12px "Geist Mono", monospace'
      ctx.fillStyle = INK
      ctx.textAlign = "left"
      ctx.fillText("ACCEPTING COMMISSIONS · Q1/Q2 2026", pillX + 38, ty + 26)
      ty += 90

      ctx.textAlign = "center"
      ctx.font = 'italic 26px "Instrument Serif", Georgia, serif'
      ctx.fillStyle = INK
      ctx.fillText("shakyaprajesh.com.np", W / 2, ty)
      ty += 28

      ctx.font = '400 13px "Geist Mono", monospace'
      ctx.fillStyle = KICKER
      ctx.fillText("Kathmandu, Nepal · Global Remote · hello@shakyaprajesh.com.np", W / 2, ty)

      if (exit > 0) {
        ctx.fillStyle = `rgba(27, 26, 22, ${Math.min(1, exit)})`
        ctx.fillRect(0, 0, W, H)
      }
    }

    ctx.restore()
  }, [ratio, playSoundTransition])

  // Setup Canvas resolution on ratio change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const spec = RATIO_CONFIG[ratio]
    canvas.width = spec.width
    canvas.height = spec.height
    renderFrame(currentTime)
  }, [ratio, currentTime, renderFrame])

  // Animation Loop
  useEffect(() => {
    let animId: number
    const step = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const dt = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt * speed
          if (next >= duration) {
            setIsPlaying(false)
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop()
            }
            return duration
          }
          return next
        })
      }

      renderFrame(currentTime)
      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, speed, currentTime, duration, renderFrame])

  const togglePlay = () => {
    initAudio()
    lastTimeRef.current = null
    setIsPlaying((prev) => !prev)
  }

  const handleSeek = (value: number) => {
    initAudio()
    lastTimeRef.current = null
    setCurrentTime(value)
    renderFrame(value)
  }

  const restartVideo = () => {
    initAudio()
    lastTimeRef.current = null
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const jumpToScene = (time: number) => {
    initAudio()
    lastTimeRef.current = null
    setCurrentTime(time)
    renderFrame(time)
  }

  const toggleMute = () => {
    initAudio()
    const nextMute = !isMuted
    setIsMuted(nextMute)
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(nextMute ? 0 : 0.4, audioCtxRef.current.currentTime)
    }
  }

  // Export Video Handler
  const startExport = () => {
    initAudio()
    const canvas = canvasRef.current
    if (!canvas) return

    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      return
    }

    try {
      const videoStream = canvas.captureStream(60)
      const tracks = [...videoStream.getVideoTracks()]

      if (audioDestRef.current && audioDestRef.current.stream.getAudioTracks().length > 0) {
        tracks.push(...audioDestRef.current.stream.getAudioTracks())
      }

      const combinedStream = new MediaStream(tracks)

      let mimeType = "video/webm;codecs=vp9,opus"
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm;codecs=vp8,opus"
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm"
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/mp4"

      recordedChunksRef.current = []
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 16000000,
      })

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        setIsRecording(false)
        const blob = new Blob(recordedChunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        const ext = mimeType.includes("mp4") ? "mp4" : "webm"
        const a = document.createElement("a")
        a.href = url
        a.download = `prajesh-shakya-portfolio-2026-promo-${ratio.replace(":", "x")}.${ext}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        toast.success("Promo video successfully generated and downloaded!")
      }

      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setCurrentTime(0)
      setIsPlaying(true)
      lastTimeRef.current = null
      recorder.start()
      toast.info("Recording 60 FPS promo video... It will automatically download when finished.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Video recording failed.")
      setIsRecording(false)
    }
  }

  // Active scene info
  const activeScene = SCENES.slice().reverse().find((s) => currentTime >= s.time) || SCENES[0]

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Portfolio 2026</span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-secondary text-foreground font-mono">Motion Suite</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground italic">
            Promo Video Studio & Exporter
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Cinematic 60 FPS motion graphics showcasing Prajesh Shakya’s brand identity systems, Content Studio, and live portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Aspect Ratio Switcher */}
          <div className="flex bg-secondary p-1 rounded-lg border border-border">
            {(["16:9", "9:16", "1:1"] as AspectRatio[]).map((r) => (
              <button
                key={r}
                onClick={() => setRatio(r)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                  ratio === r ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {RATIO_CONFIG[r].label}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs flex items-center gap-1.5 transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="font-mono hidden sm:inline">{isMuted ? "Off" : "On"}</span>
          </button>

          {/* Export Video Button */}
          <button
            onClick={startExport}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 shadow-sm transition ${
              isRecording
                ? "bg-red-600 text-white animate-pulse"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isRecording ? "Recording 60 FPS..." : "Export Video (MP4/WebM)"}</span>
          </button>
        </div>
      </div>

      {/* Video Viewport Stage */}
      <div className="flex justify-center items-center py-6 bg-secondary/30 rounded-2xl border border-border overflow-hidden">
        <div
          ref={containerRef}
          className={`relative w-full ${RATIO_CONFIG[ratio].aspectClass} bg-black rounded-xl overflow-hidden shadow-2xl border border-border/80 flex items-center justify-center`}
        >
          <canvas
            ref={canvasRef}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Scene Tag Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
            <span className="px-3 py-1 rounded-md font-mono text-[11px] uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
              {activeScene.title}
            </span>
            {isRecording && (
              <span className="px-2.5 py-1 rounded-md font-mono text-[11px] uppercase font-bold tracking-widest bg-red-600 text-white flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> REC 60 FPS
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 pointer-events-none">
            <span className="px-3 py-1 rounded-md font-mono text-[11px] bg-black/60 backdrop-blur-md text-neutral-300 border border-white/20">
              PRARESH SHAKYA © 2026
            </span>
          </div>

          {/* Big Play Overlay */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 cursor-pointer transition"
            >
              <div className="w-16 h-16 rounded-full bg-primary/90 border border-white/30 text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-105 transition">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline & Playback Deck */}
      <div className="mt-6 p-5 bg-card rounded-xl border border-border shadow-sm">
        {/* Scrubber */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-medium text-foreground w-12">
            {String(Math.floor(currentTime / 60)).padStart(2, "0")}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.05}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-xs font-mono text-muted-foreground w-12 text-right">00:42</span>
        </div>

        {/* Action Controls & Scene Jumps */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={restartVideo}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-foreground text-xs font-mono flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay
            </button>
          </div>

          {/* Scene selector tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {SCENES.map((s) => (
              <button
                key={s.id}
                onClick={() => jumpToScene(s.time)}
                className={`px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap transition border ${
                  activeScene.id === s.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Speed:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="bg-secondary border border-border rounded px-2 py-1 text-xs outline-none text-foreground"
            >
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Production Guide & Admin Integration Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-primary mb-2 font-mono text-xs uppercase tracking-wider font-semibold">
            <Sparkles className="w-4 h-4" />
            1. Cinematic Export
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Record a crisp 1080p 60fps MP4/WebM video with synthesized cinematic sub-bass, harmonic drones, and typographic motion graphics. Choose between Landscape (16:9), Vertical (9:16 for Reels/Shorts), and Square (1:1 for LinkedIn).
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-primary mb-2 font-mono text-xs uppercase tracking-wider font-semibold">
            <ExternalLink className="w-4 h-4" />
            2. Homepage Showcase
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Download your promo video and upload it under <Link href="/admin" className="underline font-medium text-foreground hover:text-primary">Admin Dashboard → Video Showcase</Link>. It will immediately activate the motion hero video on the homepage!
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-primary mb-2 font-mono text-xs uppercase tracking-wider font-semibold">
            <ShieldCheck className="w-4 h-4" />
            3. Brand Compliance
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Engineered strictly according to the Prajesh Shakya 2026 Design System: Instrument Serif, Instrument Sans, Geist Mono, the 45° isometric PS Monogram, and honest cubic-bezier physics.
          </p>
        </div>
      </div>
    </div>
  )
}
