"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SentenceConfig {
  anchorSlot: number
  anchorWord?: string
  words: string[]
}

// 6-slot aligned sentence mapping:
// Every narrative maps 1:1 to the 6 slots so the anchor word never leaves its horizontal slot.
const SENTENCES: Record<string | number, SentenceConfig> = {
  default: {
    anchorSlot: -1,
    words: ["Crafting", "Authentic", "Brand", "Identities", "That", "Resonate"],
  },
  // Hover on "Crafting" (Slot 0)
  0: {
    anchorSlot: 0,
    anchorWord: "Crafting",
    words: ["Crafting", "Timeless", "Visual", "Worlds", "With", "Precision"],
  },
  // Hover on "Authentic" (Slot 1)
  1: {
    anchorSlot: 1,
    anchorWord: "Authentic",
    words: ["Uncovering", "Authentic", "Truth", "Behind", "Every", "Founder"],
  },
  // Hover on "Brand" (Slot 2)
  2: {
    anchorSlot: 2,
    anchorWord: "Brand",
    words: ["Defining", "Strategic", "Brand", "Systems", "Built", "To Endure"],
  },
  // Hover on "Identities" (Slot 3)
  3: {
    anchorSlot: 3,
    anchorWord: "Identities",
    words: ["Designing", "Timeless", "Brand", "Identities", "That", "Endure"],
  },
  // Hover on "That" (Slot 4)
  4: {
    anchorSlot: 4,
    anchorWord: "That",
    words: ["Shaping", "Distinct", "Brands", "Stories", "That", "Inspire"],
  },
  // Hover on "Resonate" (Slot 5)
  5: {
    anchorSlot: 5,
    anchorWord: "Resonate",
    words: ["Creating", "Human", "Brand", "Identities", "That", "Resonate"],
  },
}

const DEFAULT_WORDS = SENTENCES.default.words

export function InteractiveHeroTitle() {
  const [activeSlot, setActiveSlot] = useState<number>(-1)
  const [mounted, setMounted] = useState(false)
  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSwitchedTimeRef = useRef<number>(0)
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    return () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current)
    }
  }, [])

  const handleSlotEnter = (slotIndex: number, e: React.MouseEvent) => {
    if (!SENTENCES[slotIndex]) return

    // Immediately cancel any pending release countdown
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current)
      releaseTimerRef.current = null
    }

    if (activeSlot === slotIndex) return

    const now = Date.now()
    const dx = Math.abs(e.clientX - lastMousePosRef.current.x)
    const dy = Math.abs(e.clientY - lastMousePosRef.current.y)

    // Anti-flicker protection:
    // If a switch happened recently (< 300ms) and the cursor hasn't moved significantly,
    // this event is synthesized by layout shift under a stationary cursor — ignore it.
    if (now - lastSwitchedTimeRef.current < 300 && dx < 12 && dy < 12) {
      return
    }

    lastMousePosRef.current = { x: e.clientX, y: e.clientY }

    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current)
    }

    // Hover intent delay (80ms): prevents flicker when cursor rapidly sweeps across words
    enterTimerRef.current = setTimeout(() => {
      lastSwitchedTimeRef.current = Date.now()
      setActiveSlot(slotIndex)
      enterTimerRef.current = null
    }, 80)
  }

  const handleSlotMouseMove = (slotIndex: number, e: React.MouseEvent) => {
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }

    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current)
      releaseTimerRef.current = null
    }

    if (activeSlot !== slotIndex && !enterTimerRef.current && SENTENCES[slotIndex]) {
      handleSlotEnter(slotIndex, e)
    }
  }

  const handleContainerEnter = () => {
    // If cursor re-enters the title area during release delay, keep the current narrative alive
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current)
      releaseTimerRef.current = null
    }
  }

  const handleContainerLeave = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current)
      enterTimerRef.current = null
    }
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current)
    }

    // Generous release delay (1400ms):
    // Holds the hovered narrative so the user can comfortably finish reading it,
    // before initiating a slow, silky return back to the canonical title.
    releaseTimerRef.current = setTimeout(() => {
      setActiveSlot(-1)
      lastSwitchedTimeRef.current = Date.now()
      releaseTimerRef.current = null
    }, 1400)
  }

  const currentConfig = activeSlot !== -1 && SENTENCES[activeSlot] ? SENTENCES[activeSlot] : SENTENCES.default
  const hasActiveAnchor = activeSlot !== -1
  const isReturning = activeSlot === -1

  // Server render / pre-hydration: Render canonical heading directly for fast LCP & SEO
  if (!mounted) {
    return (
      <div className="min-h-[130px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[210px] flex items-center justify-center">
        <h1
          className="hero-animate-title font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance select-none"
          aria-label="Crafting Authentic Brand Identities That Resonate"
        >
          {DEFAULT_WORDS.map((word, idx) => (
            <span key={word} className="inline-block px-1">
              {word}
              {idx < DEFAULT_WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
      </div>
    )
  }

  return (
    <div
      className="min-h-[130px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[210px] flex items-center justify-center"
      onMouseEnter={handleContainerEnter}
      onMouseLeave={handleContainerLeave}
    >
      <h1
        className="hero-animate-title font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance select-none"
        aria-label="Crafting Authentic Brand Identities That Resonate"
      >
        {currentConfig.words.map((word, idx) => {
          const isAnchor = idx === currentConfig.anchorSlot

          return (
            <span key={idx} className="inline-block">
              <span
                className="inline-grid relative cursor-pointer px-1 py-0.5 align-baseline"
                style={{ gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }}
                onMouseEnter={(e) => handleSlotEnter(idx, e)}
                onMouseMove={(e) => handleSlotMouseMove(idx, e)}
              >
                <AnimatePresence initial={false}>
                  <motion.span
                    key={word}
                    style={{ gridArea: "1 / 1" }}
                    initial={{
                      opacity: 0,
                      y: 12,
                      filter: "blur(5px)",
                    }}
                    animate={{
                      opacity: isAnchor ? 1 : hasActiveAnchor ? 0.65 : 1,
                      y: isAnchor ? -4 : 0,
                      scale: isAnchor ? 1.025 : 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      filter: "blur(5px)",
                    }}
                    transition={{
                      duration: isReturning ? 1.35 : 1.2,
                      ease: [0.16, 1, 0.3, 1],
                      delay: isAnchor
                        ? 0
                        : isReturning
                        ? idx * 0.035
                        : Math.abs(idx - (activeSlot === -1 ? 0 : activeSlot)) * 0.035,
                    }}
                    className={`inline-block will-change-[transform,opacity,filter] ${
                      isAnchor
                        ? "text-foreground font-serif italic"
                        : "text-foreground"
                    }`}
                  >
                    {word}
                  </motion.span>
                </AnimatePresence>
              </span>
              {idx < currentConfig.words.length - 1 ? " " : ""}
            </span>
          )
        })}
      </h1>
    </div>
  )
}
