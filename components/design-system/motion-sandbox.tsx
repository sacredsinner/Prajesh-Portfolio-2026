"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MOTION_TOKENS } from "@/lib/design-system/tokens"
import { Play, RotateCcw, Activity } from "lucide-react"

export function MotionSandbox() {
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="space-y-10">
      {/* Interactive Animation Visualizer */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-1.5">
              <Activity className="size-3.5" /> Motion Physics & Choreography
            </span>
            <h3 className="font-serif text-2xl mt-1">Editorial Easing Sandbox</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReplayKey((k) => k + 1)}
            className="gap-2 text-xs"
          >
            <RotateCcw className="size-3.5" /> Replay Motion
          </Button>
        </div>

        {/* Animation Preview Stages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" key={replayKey}>
          {/* Card 1: Fade Up */}
          <div className="rounded-lg border border-border/80 bg-background p-6 flex flex-col justify-between min-h-[200px]">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              01 · Fade Up (0.6s)
            </span>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 rounded border border-border bg-secondary/50 text-center"
            >
              <h5 className="font-serif text-lg">Deliberate Entrance</h5>
              <p className="text-xs text-muted-foreground mt-1">cubic-bezier(0.16, 1, 0.3, 1)</p>
            </motion.div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Used for: Sections, Hero typography
            </span>
          </div>

          {/* Card 2: Stagger Reveal */}
          <div className="rounded-lg border border-border/80 bg-background p-6 flex flex-col justify-between min-h-[200px]">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              02 · Staggered Flow (0.08s step)
            </span>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                  className="px-3 py-2 rounded border border-border bg-secondary/30 text-xs font-medium flex items-center justify-between"
                >
                  <span>Deliverable item 0{i + 1}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">+{i * 100}ms</span>
                </motion.div>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Used for: Navigation links, Deliverable pills
            </span>
          </div>

          {/* Card 3: Hairline Expand */}
          <div className="rounded-lg border border-border/80 bg-background p-6 flex flex-col justify-between min-h-[200px]">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              03 · Hairline Accordion
            </span>
            <motion.div
              initial={{ height: 28, opacity: 0.6 }}
              animate={{ height: 96, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden rounded border border-border bg-secondary/30 p-3 space-y-1"
            >
              <span className="font-serif text-sm block">Interactive Block Expansion</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Smooth height transition without jarring reflow.
              </p>
            </motion.div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Used for: Services accordion, Mobile menu
            </span>
          </div>
        </div>
      </div>

      {/* Motion Token Specifications */}
      <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
        {MOTION_TOKENS.map((motionToken) => (
          <div
            key={motionToken.name}
            className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-md">
              <h4 className="font-serif text-lg">{motionToken.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {motionToken.description}
              </p>
              <span className="text-[11px] font-mono text-muted-foreground block pt-0.5">
                Role: {motionToken.usage}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="rounded bg-secondary px-2.5 py-1 text-foreground">
                {motionToken.duration}
              </span>
              <span className="rounded border border-border px-2.5 py-1 text-muted-foreground">
                {motionToken.easing}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
