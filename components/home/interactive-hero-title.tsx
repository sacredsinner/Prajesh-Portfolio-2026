"use client"

import { useState, useRef, useEffect } from "react"

interface Narrative {
  anchorWord: string
  prefix: string[]
  suffix: string[]
}

const NARRATIVES: Record<string, Narrative> = {
  brand: {
    anchorWord: "Brand",
    prefix: ["Defining", "Strategic"],
    suffix: ["Systems", "Built", "To", "Endure"],
  },
  authentic: {
    anchorWord: "Authentic",
    prefix: ["Uncovering", "The"],
    suffix: ["Truth", "Behind", "Every", "Founder"],
  },
  identities: {
    anchorWord: "Identities",
    prefix: ["Designing", "Timeless"],
    suffix: ["For", "Ambitious", "Companies"],
  },
  crafting: {
    anchorWord: "Crafting",
    prefix: [],
    suffix: ["Distinct", "Worlds", "Through", "Vision", "&", "Precision"],
  },
  resonate: {
    anchorWord: "Resonate",
    prefix: ["Creating", "Human", "Work", "That", "Will", "Truly"],
    suffix: [],
  },
}

const DEFAULT_WORDS = [
  { word: "Crafting", key: "crafting" },
  { word: "Authentic", key: "authentic" },
  { word: "Brand", key: "brand" },
  { word: "Identities", key: "identities" },
  { word: "That", key: "that" },
  { word: "Resonate", key: "resonate" },
]

export function InteractiveHeroTitle() {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [isReverting, setIsReverting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const revertAnimationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (revertAnimationRef.current) clearTimeout(revertAnimationRef.current)
    }
  }, [])

  const handleMouseEnter = (key: string) => {
    if (!NARRATIVES[key]) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (revertAnimationRef.current) clearTimeout(revertAnimationRef.current)
    setIsReverting(false)
    setActiveKey(key)
  }

  const handleContainerLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // Generous, slow release hold (950ms)
    timeoutRef.current = setTimeout(() => {
      setIsReverting(true)
      setActiveKey(null)
      // Reset isReverting after slow animation completes (1200ms)
      revertAnimationRef.current = setTimeout(() => {
        setIsReverting(false)
      }, 1200)
    }, 950)
  }

  // Pre-hydration or non-hover devices fallback to clean canonical H1
  if (!mounted || !activeKey || !NARRATIVES[activeKey]) {
    return (
      <h1
        className="hero-animate-title font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance select-none transition-all duration-1000"
        aria-label="Crafting Authentic Brand Identities That Resonate"
        onMouseLeave={handleContainerLeave}
      >
        {DEFAULT_WORDS.map((item, idx) => (
          <span key={item.key}>
            <span
              onMouseEnter={() => handleMouseEnter(item.key)}
              className={`hero-title-word inline-block cursor-pointer transition-all duration-1000 ease-out hover:-translate-y-1 hover:italic ${
                isReverting ? "animate-hero-return" : ""
              }`}
              style={isReverting ? { animationDelay: `${idx * 50}ms` } : undefined}
            >
              {item.word}
            </span>
            {idx < DEFAULT_WORDS.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>
    )
  }

  const activeNarrative = NARRATIVES[activeKey]

  return (
    <h1
      className="hero-animate-title font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[1.05] text-balance select-none transition-all duration-1000"
      aria-label="Crafting Authentic Brand Identities That Resonate"
      onMouseLeave={handleContainerLeave}
    >
      {/* Prefix morph words */}
      {activeNarrative.prefix.map((word, idx) => (
        <span key={`p-${activeKey}-${idx}`}>
          <span
            className="inline-block animate-hero-morph text-foreground/80 font-normal tracking-normal transition-all duration-1000 ease-out"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {word}
          </span>
          {" "}
        </span>
      ))}

      {/* The Anchored Word */}
      <span>
        <span
          onMouseEnter={() => handleMouseEnter(activeKey)}
          className="inline-block font-serif italic text-foreground -translate-y-1.5 transition-all duration-1000 ease-out cursor-default scale-[1.02]"
        >
          {activeNarrative.anchorWord}
        </span>
        {activeNarrative.suffix.length > 0 ? " " : ""}
      </span>

      {/* Suffix morph words */}
      {activeNarrative.suffix.map((word, idx) => (
        <span key={`s-${activeKey}-${idx}`}>
          <span
            className="inline-block animate-hero-morph text-foreground/80 font-normal tracking-normal transition-all duration-1000 ease-out"
            style={{ animationDelay: `${(idx + activeNarrative.prefix.length) * 40}ms` }}
          >
            {word}
          </span>
          {idx < activeNarrative.suffix.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  )
}
