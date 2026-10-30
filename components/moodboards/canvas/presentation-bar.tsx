"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, X, Volume2, VolumeX, Play, Pause, FileText } from "lucide-react"
import type { Slide } from "@/lib/presentation"

export function PresentationBar({
  slides,
  activeSlideIndex,
  onSlideChange,
  onExit,
}: {
  slides: Slide[]
  activeSlideIndex: number
  onSlideChange: (index: number) => void
  onExit: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentSlide = slides[activeSlideIndex] || slides[0]
  const total = slides.length

  const handlePrev = useCallback(() => {
    if (activeSlideIndex > 0) {
      onSlideChange(activeSlideIndex - 1)
    } else {
      onSlideChange(total - 1)
    }
  }, [activeSlideIndex, onSlideChange, total])

  const handleNext = useCallback(() => {
    if (activeSlideIndex < total - 1) {
      onSlideChange(activeSlideIndex + 1)
    } else {
      onSlideChange(0)
    }
  }, [activeSlideIndex, onSlideChange, total])

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault()
        handlePrev()
      } else if (e.key === "Escape") {
        e.preventDefault()
        onExit()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleNext, handlePrev, onExit])

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleNext()
      }, 7000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, handleNext])

  // Web Speech API for voice walkthrough narration
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      window.speechSynthesis.cancel()
      const textToRead = `${currentSlide?.title || ""}. ${currentSlide?.subtitle || ""}. ${currentSlide?.notes || ""}`.trim()
      if (!textToRead) return

      const utterance = new SpeechSynthesisUtterance(textToRead)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Cancel speech on unmount or slide change
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [activeSlideIndex])

  return (
    <div
      data-control="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1040] flex flex-col items-center p-4"
    >
      {/* Top Banner Navigation Pill */}
      <div
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-background/95 px-4 py-2 shadow-xl backdrop-blur-md transition-all sm:gap-4 sm:px-6"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handlePrev()
          }}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-foreground transition hover:bg-secondary active:scale-95"
          title="Previous slide (←)"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Slide Title and Stepper */}
        <div className="flex flex-col items-center px-1 text-center sm:px-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {activeSlideIndex + 1} / {total}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">·</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
              Pitch Mode
            </span>
          </div>
          <span className="line-clamp-1 max-w-[200px] font-serif text-sm font-medium text-foreground sm:max-w-xs md:max-w-md">
            {currentSlide?.title}
          </span>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-foreground transition hover:bg-secondary active:scale-95"
          title="Next slide (→ or Space)"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="h-4 w-px bg-border" />

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Auto-play */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsPlaying(!isPlaying)
            }}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition active:scale-95 ${
              isPlaying ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            title={isPlaying ? "Pause auto-tour" : "Play auto-tour"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>

          {/* Audio Narration */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleSpeech()
            }}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition active:scale-95 ${
              isSpeaking ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            title={isSpeaking ? "Mute audio narration" : "Listen to slide rationale"}
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Notes Toggle */}
          {currentSlide?.notes && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowNotes(!showNotes)
              }}
              className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition active:scale-95 ${
                showNotes ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title="Presenter notes"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Exit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onExit()
            }}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95"
            title="Exit Presentation (Esc)"
            aria-label="Exit presentation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Speaker / Rationale Notes Card */}
      {showNotes && currentSlide?.notes && (
        <div
          className="pointer-events-auto mt-3 max-w-lg rounded-xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span>Designer Notes & Intentions</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowNotes(false)
              }}
              className="cursor-pointer hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 whitespace-pre-wrap font-serif text-xs leading-relaxed text-foreground">
            {currentSlide.notes}
          </p>
        </div>
      )}
    </div>
  )
}
