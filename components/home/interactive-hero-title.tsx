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
    words: ["Turning", "Ambitious", "Businesses", "Into", "Unmistakable", "Brands"],
  },
  // Hover on "Turning" (Slot 0)
  0: {
    anchorSlot: 0,
    anchorWord: "Turning",
    words: ["Turning", "Bold", "Visions", "Into", "Market", "Leaders"],
  },
  // Hover on "Ambitious" (Slot 1)
  1: {
    anchorSlot: 1,
    anchorWord: "Ambitious",
    words: ["Elevating", "Ambitious", "Founders", "Into", "Industry", "Icons"],
  },
  // Hover on "Businesses" (Slot 2)
  2: {
    anchorSlot: 2,
    anchorWord: "Businesses",
    words: ["Transforming", "Growing", "Businesses", "With", "Enduring", "Craft"],
  },
  // Hover on "Unmistakable" (Slot 4)
  4: {
    anchorSlot: 4,
    anchorWord: "Unmistakable",
    words: ["Designing", "Singular", "Identities", "Into", "Unmistakable", "Brands"],
  },
  // Hover on "Brands" (Slot 5)
  5: {
    anchorSlot: 5,
    anchorWord: "Brands",
    words: ["Building", "Enduring", "Identities", "Into", "Iconic", "Brands"],
  },
}

const DEFAULT_WORDS = SENTENCES.default.words

export function InteractiveHeroTitle() {
  const [activeSlot, setActiveSlot] = useState<number>(-1)
  const [mounted, setMounted] = useState(false)
  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
    }
  }, [])

  const handleSlotEnter = (slotIndex: number) => {
    if (!SENTENCES[slotIndex]) return
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
    setActiveSlot(slotIndex)
  }

  const handleContainerLeave = () => {
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current)
    // Generous, slow release hold (850ms) before silky smooth return
    releaseTimerRef.current = setTimeout(() => {
      setActiveSlot(-1)
    }, 850)
  }

  const currentConfig = activeSlot !== -1 && SENTENCES[activeSlot] ? SENTENCES[activeSlot] : SENTENCES.default
  const hasActiveAnchor = activeSlot !== -1

  // Server render / pre-hydration: Render canonical heading directly for fast LCP & SEO
  if (!mounted) {
    return (
      <div className="min-h-[130px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[210px] flex items-center justify-center">
        <h1
          className="hero-animate-title font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance select-none"
          aria-label="Turning Ambitious Businesses Into Unmistakable Brands"
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
    <div className="min-h-[130px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[210px] flex items-center justify-center">
      <h1
        className="hero-animate-title font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance select-none transition-all duration-700"
        aria-label="Turning Ambitious Businesses Into Unmistakable Brands"
        onMouseLeave={handleContainerLeave}
      >
        {currentConfig.words.map((word, idx) => {
          const isAnchor = idx === currentConfig.anchorSlot
          return (
            <span
              key={idx}
              className="inline-block relative cursor-pointer px-1 py-0.5 align-baseline"
              onMouseEnter={() => handleSlotEnter(idx)}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{
                    opacity: isAnchor ? 1 : hasActiveAnchor ? 0.72 : 1,
                    y: isAnchor ? -4 : 0,
                    scale: isAnchor ? 1.02 : 1,
                    filter: "blur(0px)",
                  }}
                  exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                    delay: isAnchor ? 0 : idx * 0.02,
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
              {idx < currentConfig.words.length - 1 ? "\u00A0" : ""}
            </span>
          )
        })}
      </h1>
    </div>
  )
}
