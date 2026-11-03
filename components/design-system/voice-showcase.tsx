"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BRAND_TONE_PRINCIPLES,
  LEXICON_GUIDELINES,
  VOICE_CHANNELS,
  type BrandTonePrinciple,
  type LexiconTerm,
  type VoiceChannel,
} from "@/lib/design-system/tokens"
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import Link from "next/link"

export function VoiceShowcase() {
  const [selectedPillarId, setSelectedPillarId] = useState<string>(BRAND_TONE_PRINCIPLES[0].id)
  const [lexiconFilter, setLexiconFilter] = useState<"all" | "own" | "avoid">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChannelId, setSelectedChannelId] = useState<string>(VOICE_CHANNELS[0].id)

  const activePillar =
    BRAND_TONE_PRINCIPLES.find((p) => p.id === selectedPillarId) ?? BRAND_TONE_PRINCIPLES[0]
  const activeChannel =
    VOICE_CHANNELS.find((c) => c.id === selectedChannelId) ?? VOICE_CHANNELS[0]

  const filteredLexicon = LEXICON_GUIDELINES.filter((term) => {
    if (lexiconFilter !== "all" && term.type !== lexiconFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      term.word.toLowerCase().includes(q) ||
      term.context.toLowerCase().includes(q) ||
      term.category.toLowerCase().includes(q) ||
      (term.replacement && term.replacement.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-12">
      {/* 1. Header & Overview */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
              <MessageSquare className="size-3.5" /> Verbal Identity & Copywriting
            </span>
            <h3 className="font-serif text-2xl mt-1">Brand Voice & Editorial Standards</h3>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/start"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-mono text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Intake Funnel (/start) <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl">
          Language is an architectural material. Our copy rules reject the synthetic excitement and jargon common in marketing agencies, establishing a serene, authoritative atmosphere where strategic value commands complete focus.
        </p>

        {/* 2. Four Pillars Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
          {BRAND_TONE_PRINCIPLES.map((pillar) => {
            const isSelected = pillar.id === selectedPillarId
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-foreground bg-secondary/80 shadow-xs"
                    : "border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider block text-muted-foreground">
                  {pillar.kicker}
                </span>
                <span className="text-sm font-medium mt-1 block font-serif text-foreground">
                  {pillar.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Pillar Card (Say This vs Not This) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-border bg-background p-6 space-y-6"
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {activePillar.kicker} — Definition
              </span>
              <h4 className="font-serif text-xl md:text-2xl mt-1 text-foreground">
                {activePillar.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {activePillar.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Say This */}
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="size-3.5" />
                  Prajesh Shakya Standard (Adopt)
                </div>
                <p className="font-serif text-base text-foreground leading-relaxed">
                  &ldquo;{activePillar.exampleGood}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground pt-1 border-t border-emerald-500/20">
                  {activePillar.rationale}
                </p>
              </div>

              {/* Not This */}
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-destructive uppercase tracking-wider">
                  <XCircle className="size-3.5" />
                  Agency Hyperbole (Avoid)
                </div>
                <p className="font-sans text-sm text-foreground/80 leading-relaxed italic line-through decoration-destructive/40">
                  &ldquo;{activePillar.exampleBad}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground pt-1 border-t border-destructive/20">
                  Erodes credibility, adds hollow noise, and sounds identical to template marketing agencies.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. The Lexicon Matrix */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
              <BookOpen className="size-3.5" /> The Lexicon Matrix
            </span>
            <h3 className="font-serif text-2xl mt-1">Words We Own vs. Words We Avoid</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="inline-flex rounded-full border border-border p-0.5 bg-background text-xs">
              <button
                type="button"
                onClick={() => setLexiconFilter("all")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  lexiconFilter === "all" ? "bg-foreground text-background font-medium" : "text-muted-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setLexiconFilter("own")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  lexiconFilter === "own" ? "bg-foreground text-background font-medium" : "text-muted-foreground"
                }`}
              >
                Own
              </button>
              <button
                type="button"
                onClick={() => setLexiconFilter("avoid")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  lexiconFilter === "avoid" ? "bg-foreground text-background font-medium" : "text-muted-foreground"
                }`}
              >
                Avoid
              </button>
            </div>
          </div>
        </div>

        {/* Lexicon Grid Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLexicon.map((item, idx) => (
            <div
              key={`${item.word}-${idx}`}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between space-y-3 transition-colors ${
                item.type === "own"
                  ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
                  : "border-destructive/20 bg-destructive/5 hover:border-destructive/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-medium tracking-tight ${
                      item.type === "own" ? "font-serif text-foreground font-semibold" : "line-through text-muted-foreground"
                    }`}
                  >
                    {item.word}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      item.type === "own"
                        ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
                        : "border-destructive/30 text-destructive bg-destructive/10"
                    }`}
                  >
                    {item.type === "own" ? "Own" : "Avoid"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {item.context}
                </p>
              </div>

              {item.replacement && (
                <div className="text-[11px] pt-2 border-t border-border/40 font-mono text-muted-foreground">
                  <span className="text-foreground/70">Use instead:</span> {item.replacement}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Contextual Tone Spectrum Across Channels */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
              <Sliders className="size-3.5" /> Channel Modulation
            </span>
            <h3 className="font-serif text-2xl mt-1">Contextual Tone Calibration</h3>
          </div>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {VOICE_CHANNELS.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => setSelectedChannelId(channel.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all border ${
                channel.id === selectedChannelId
                  ? "border-foreground bg-foreground text-background font-semibold"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {channel.label}
            </button>
          ))}
        </div>

        {/* Selected Channel Metrics & Specimen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border border-border bg-background p-6">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Parameters
            </span>

            {/* Formality Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span>Formality</span>
                <span>{activeChannel.formality}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-500"
                  style={{ width: `${activeChannel.formality}%` }}
                />
              </div>
            </div>

            {/* Velocity Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span>Pace / Velocity</span>
                <span>{activeChannel.velocity}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-500"
                  style={{ width: `${activeChannel.velocity}%` }}
                />
              </div>
            </div>

            {/* Density Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span>Information Density</span>
                <span>{activeChannel.density}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-500"
                  style={{ width: `${activeChannel.density}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground font-mono">
              <span className="text-foreground">Audience:</span> {activeChannel.primaryAudience}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Channel Objective & Character
              </span>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {activeChannel.description}
              </p>
            </div>

            <div className="rounded-md border border-border/80 bg-secondary/30 p-4 space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block">
                Representative Copy Specimen
              </span>
              <p className="font-serif text-base text-foreground leading-relaxed">
                &ldquo;{activeChannel.exampleCopy}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
