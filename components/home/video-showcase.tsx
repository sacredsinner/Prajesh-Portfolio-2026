"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react"

interface VideoProps {
  video: { url: string; filename: string } | null
}

const BRAG_STATS = [
  {
    index: "01",
    value: "6+",
    unit: "Yrs",
    label: "Brand Craft & Strategy",
    description: "Deep research, positioning & visual systems",
  },
  {
    index: "02",
    value: "80+",
    unit: "Works",
    label: "Brand Identities",
    description: "Distinctive logos, typography & design guidelines",
  },
  {
    index: "03",
    value: "7+",
    unit: "Regions",
    label: "Global Reach",
    description: "Australia, Nepal, United States & remote teams",
  },
  {
    index: "04",
    value: "100%",
    unit: "Tailored",
    label: "Bespoke Vision",
    description: "Every identity crafted with intention and truth",
  },
]

// Fallback high-craft motion video in case no custom upload is active in the database
const FALLBACK_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function VideoShowcase({ video }: VideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  const [hasVideoError, setHasVideoError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverProgress, setHoverProgress] = useState<number | null>(null)

  const activeVideoUrl = video?.url || FALLBACK_VIDEO_URL
  const videoTitle = video?.filename
    ? video.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    : "Brand Identity in Motion — 2026 Reel"

  // Handle video progress update
  const handleTimeUpdate = useCallback(() => {
    if (isDragging || !videoRef.current) return
    const cur = videoRef.current.currentTime
    const dur = videoRef.current.duration || 0
    setCurrentTime(cur)
    if (dur > 0) {
      setProgress((cur / dur) * 100)
    }
  }, [isDragging])

  // Handle video loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0)
    }
  }, [])

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    const nextMuted = !videoRef.current.muted
    videoRef.current.muted = nextMuted
    setIsMuted(nextMuted)
  }, [])

  // Toggle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  // Scrub calculation helper
  const seekTo = useCallback(
    (clientX: number) => {
      if (!scrubberRef.current || !videoRef.current) return
      const rect = scrubberRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const targetTime = ratio * (videoRef.current.duration || duration)
      videoRef.current.currentTime = targetTime
      setCurrentTime(targetTime)
      setProgress(ratio * 100)
    },
    [duration]
  )

  // Drag scrubber interaction
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(true)
      seekTo(event.clientX)

      const onPointerMove = (e: PointerEvent) => {
        seekTo(e.clientX)
      }

      const onPointerUp = () => {
        setIsDragging(false)
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("pointerup", onPointerUp)
      }

      window.addEventListener("pointermove", onPointerMove)
      window.addEventListener("pointerup", onPointerUp)
    },
    [seekTo]
  )

  const handlePointerHover = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!scrubberRef.current) return
      const rect = scrubberRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      setHoverProgress(ratio * 100)
    },
    []
  )

  // Sync fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full border-y border-border bg-[#151410] text-[#F5F5F3] overflow-hidden"
      aria-label="Selected work motion and brag showcase"
    >
      <div ref={containerRef} className="group relative w-full select-none">
        {/* Top Header Overlay: Brag Badges & Controls */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none transition-opacity duration-300">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2.5">
            {/* Live Reel Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Reel 2026
            </span>

            {/* Title / Reel name */}
            <span className="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-sans text-[11px] text-white/80 backdrop-blur-md capitalize">
              {videoTitle}
            </span>
          </div>

          {/* Action Controls */}
          <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2">
            {/* Sound Toggle with Waveform */}
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 font-mono text-[11px] text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40 transition-colors cursor-pointer"
              aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
              title={isMuted ? "Unmute reel" : "Mute reel"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-white/70" />
                  <span className="hidden sm:inline text-[10px] tracking-wider uppercase text-white/70">Sound Off</span>
                </>
              ) : (
                <>
                  <span className="flex items-end gap-[2px] h-3 w-3 text-emerald-400">
                    <span className="w-[2px] bg-current animate-[pulse_0.6s_ease-in-out_infinite] h-full rounded-full" />
                    <span className="w-[2px] bg-current animate-[pulse_0.9s_ease-in-out_infinite_0.15s] h-3/4 rounded-full" />
                    <span className="w-[2px] bg-current animate-[pulse_0.5s_ease-in-out_infinite_0.3s] h-1/2 rounded-full" />
                    <span className="w-[2px] bg-current animate-[pulse_0.75s_ease-in-out_infinite_0.1s] h-4/5 rounded-full" />
                  </span>
                  <span className="hidden sm:inline text-[10px] tracking-wider uppercase text-emerald-400">Audio Live</span>
                </>
              )}
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40 transition-colors cursor-pointer"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause reel" : "Play reel"}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40 transition-colors cursor-pointer"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Expand fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Video Canvas */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
          {!hasVideoError ? (
            <video
              ref={videoRef}
              src={activeVideoUrl}
              className="block h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => setHasVideoError(true)}
              aria-label={`Showcase motion reel: ${videoTitle}`}
            >
              <track kind="captions" />
              Your browser does not support video playback.
            </video>
          ) : (
            // Resilient aesthetic animated canvas fallback if video source is offline
            <div className="flex h-full w-full flex-col items-center justify-center bg-radial from-neutral-900 to-[#12110e] p-8 text-center">
              <div className="h-16 w-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm mb-4">
                <span className="font-serif text-2xl text-white">PS</span>
              </div>
              <p className="font-serif text-2xl md:text-3xl tracking-tight text-white">
                Authentic Brand Identities in Motion
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-white/50">
                Prajesh Shakya · Visual Systems Reel
              </p>
            </div>
          )}

          {/* Interactive Drag to Scrub Overlay Banner (subtle hint on hover) */}
          <div className="pointer-events-none absolute bottom-5 left-5 z-20 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
              Drag to scrub frames
            </span>
            <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/80 backdrop-blur-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Interactive Draggable Timeline Scrubber */}
        <div
          ref={scrubberRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerHover}
          onPointerLeave={() => setHoverProgress(null)}
          className="relative z-30 h-3 w-full -mt-3 flex items-end cursor-pointer touch-none bg-gradient-to-t from-black/60 to-transparent"
          role="slider"
          aria-label="Video scrubber: drag or click to seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          {/* Track line */}
          <div className="relative h-1 w-full bg-white/20 transition-all duration-150 group-hover:h-1.5">
            {/* Hover preview ghost bar */}
            {hoverProgress !== null && (
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/30 pointer-events-none"
                style={{ width: `${hoverProgress}%` }}
              />
            )}
            {/* Active progress bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white pointer-events-none transition-none"
              style={{ width: `${progress}%` }}
            />
            {/* Scrubber Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none transition-transform group-hover:scale-125"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Editorial Brag Bar */}
      <div className="border-t border-white/10 bg-[#12110e]">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-white/10">
          {BRAG_STATS.map((stat) => (
            <div
              key={stat.index}
              className="group/stat relative p-6 md:p-8 transition-colors hover:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {stat.index}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/80 opacity-0 group-hover/stat:opacity-100 transition-opacity">
                  {stat.unit}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-serif text-3xl md:text-5xl tracking-tight text-white">
                  {stat.value}
                </span>
              </div>
              <p className="mt-2 font-sans text-xs uppercase tracking-widest text-white/90 font-medium">
                {stat.label}
              </p>
              <p className="mt-1 font-sans text-[12px] leading-relaxed text-white/50">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Editorial Callout Strip */}
        <div className="border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left bg-black/20">
          <p className="font-sans text-xs text-white/60">
            Have a brand that needs a distinctive visual presence? Let&apos;s build something enduring.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-white hover:text-emerald-400 transition-colors"
            >
              Start a Project <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-white/20">|</span>
            <Link
              href="/projects"
              className="font-sans text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            >
              View All Works
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
