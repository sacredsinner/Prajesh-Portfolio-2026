"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BRAND_MARK_PATH } from "@/components/brand-mark"
import { Play, RotateCcw, Sparkles, Layers, Sliders, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export type AnimationMode = "trace" | "isometric" | "stamp"

interface AnimatedLogoProps {
  mode?: AnimationMode
  autoPlay?: boolean
  showControls?: boolean
  size?: number
  className?: string
  theme?: "ground" | "dark"
}

export function AnimatedLogo({
  mode: initialMode = "trace",
  autoPlay = true,
  showControls = true,
  size = 140,
  className = "",
  theme: initialTheme = "ground",
}: AnimatedLogoProps) {
  const [mode, setMode] = useState<AnimationMode>(initialMode)
  const [key, setKey] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [speed, setSpeed] = useState<number>(1)
  const [theme, setTheme] = useState<"ground" | "dark">(initialTheme)

  const handleReplay = () => {
    setIsPlaying(false)
    setTimeout(() => {
      setKey((k) => k + 1)
      setIsPlaying(true)
    }, 50)
  }

  const isDark = theme === "dark"
  const bgFill = isDark ? "#1B1A16" : "#F5F5F3"
  const inkColor = isDark ? "#F5F5F3" : "#1B1A16"
  const hairColor = isDark ? "#3A3932" : "#D9D7CD"
  const mutedColor = isDark ? "#A3A196" : "#6F6D63"

  // Durations scaled by speed
  const d = (baseSeconds: number) => baseSeconds / speed

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Animation Stage */}
      <div
        className="relative w-full max-w-xl aspect-square md:aspect-[16/10] rounded-xl border flex flex-col items-center justify-center p-8 transition-colors duration-500 overflow-hidden shadow-xs select-none"
        style={{
          backgroundColor: bgFill,
          borderColor: hairColor,
        }}
      >
        {/* Mode 1: 45° Isometric Background Grid Lines */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            opacity: mode === "trace" ? (isDark ? 0.08 : 0.12) : 0.04,
            backgroundImage: `repeating-linear-gradient(45deg, ${inkColor} 0, ${inkColor} 1px, transparent 0, transparent 24px), repeating-linear-gradient(-45deg, ${inkColor} 0, ${inkColor} 1px, transparent 0, transparent 24px)`,
          }}
        />

        {/* Framing Diamond Border */}
        <AnimatePresence mode="wait">
          {mode === "trace" && (
            <motion.div
              key={`diamond-${key}`}
              initial={{ opacity: 0, scale: 0.9, rotate: 45 }}
              animate={{ opacity: 1, scale: 1, rotate: 45 }}
              transition={{ duration: d(0.8), ease: [0.16, 1, 0.3, 1] }}
              className="absolute pointer-events-none border border-dashed rounded-xs"
              style={{
                width: size * 1.5,
                height: size * 1.5,
                borderColor: hairColor,
              }}
            />
          )}
        </AnimatePresence>

        {/* Central Logo Animated Mark */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            key={`mark-${key}-${mode}`}
            initial={
              mode === "trace"
                ? { scale: 0.96, opacity: 0 }
                : mode === "isometric"
                ? { rotateX: 45, rotateY: -35, scale: 0.85, opacity: 0 }
                : { y: -24, scale: 1.12, opacity: 0 }
            }
            animate={
              mode === "trace"
                ? { scale: 1, opacity: 1 }
                : mode === "isometric"
                ? { rotateX: 0, rotateY: 0, scale: 1, opacity: 1 }
                : { y: 0, scale: 1, opacity: 1 }
            }
            transition={{
              duration: mode === "stamp" ? d(0.35) : d(1.2),
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ width: size, height: size }}
            className="relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="w-full h-full"
            >
              {/* 1. Stroke Trace Layer */}
              {mode === "trace" && (
                <motion.path
                  d={BRAND_MARK_PATH}
                  fill="none"
                  stroke={inkColor}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{
                    pathLength: { duration: d(1.8), ease: [0.2, 0.8, 0.2, 1] },
                    opacity: { delay: d(1.8), duration: d(0.4) },
                  }}
                />
              )}

              {/* 2. Solid Fill Bloom */}
              <motion.path
                d={BRAND_MARK_PATH}
                fill={inkColor}
                fillRule="evenodd"
                initial={{ opacity: mode === "trace" ? 0 : mode === "stamp" ? 0 : 0.4 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: mode === "trace" ? d(1.6) : mode === "stamp" ? d(0.05) : d(0.6),
                  duration: mode === "stamp" ? d(0.2) : d(0.8),
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </svg>
          </motion.div>

          {/* Wordmark Cascade */}
          <motion.div
            key={`wordmark-${key}-${mode}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: mode === "trace" ? d(2.2) : mode === "isometric" ? d(1.4) : d(0.4),
              duration: d(0.6),
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-6 flex flex-col items-center text-center space-y-1.5"
          >
            <motion.h4
              initial={{ letterSpacing: "0.1em" }}
              animate={{ letterSpacing: "0.25em" }}
              transition={{
                delay: mode === "trace" ? d(2.2) : mode === "isometric" ? d(1.4) : d(0.4),
                duration: d(0.8),
                ease: "easeOut",
              }}
              style={{ color: inkColor }}
              className="font-sans font-bold text-xs uppercase"
            >
              PRAJESH SHAKYA
            </motion.h4>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: mode === "trace" ? d(2.6) : mode === "isometric" ? d(1.8) : d(0.6),
                duration: d(0.4),
              }}
              style={{ color: mutedColor }}
              className="font-mono text-[9px] uppercase tracking-wider block"
            >
              BRAND STRATEGY & IDENTITY
            </motion.span>
          </motion.div>
        </div>

        {/* Watermark Tag */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono pointer-events-none">
          <span style={{ color: mutedColor }}>
            CONCEPT: {mode.toUpperCase()} · 60 FPS
          </span>
          <span style={{ color: mutedColor }}>
            SPEED: {speed}X
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      {showControls && (
        <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-card">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground mr-1 hidden sm:inline">
              Mode:
            </span>
            {(["trace", "isometric", "stamp"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  handleReplay()
                }}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  mode === m
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground bg-secondary/50"
                }`}
              >
                {m === "trace" ? "Trace" : m === "isometric" ? "Spatial" : "Stamp"}
              </button>
            ))}
          </div>

          {/* Speed & Theme Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded overflow-hidden text-[11px] font-mono">
              {([0.5, 1, 2] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 ${
                    speed === s
                      ? "bg-foreground text-background font-bold"
                      : "text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Board Background Toggle */}
            <button
              onClick={() => setTheme((t) => (t === "ground" ? "dark" : "ground"))}
              className="px-2 py-1 text-[11px] font-mono rounded border border-border text-muted-foreground hover:text-foreground bg-secondary/30"
              title="Toggle Light / Dark Board"
            >
              {theme === "ground" ? "Dark" : "Light"}
            </button>

            {/* Replay Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleReplay}
              className="gap-1.5 text-xs h-7 px-2.5"
            >
              <RotateCcw className="size-3" /> Replay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
