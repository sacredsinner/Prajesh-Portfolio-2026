"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Search,
  Mail,
  Send,
  Eye,
  Layers,
  Heart,
  SlidersHorizontal,
} from "lucide-react"

export function ComponentShowcase() {
  const [btnLoading, setBtnLoading] = useState(false)
  const [switchActive, setSwitchActive] = useState(true)
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [sliderVal, setSliderVal] = useState([65])
  const [demoInput, setDemoInput] = useState("prajeshshakya@gmail.com")

  return (
    <div className="space-y-16">
      {/* 1. Buttons */}
      <div className="space-y-6">
        <div className="border-b border-border pb-3 flex items-baseline justify-between">
          <h3 className="font-serif text-2xl">Button Architecture</h3>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            components/ui/button.tsx
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-8">
          {/* Variants */}
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
              Variants (Primary, Secondary, Outline, Ghost, Destructive, Link)
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link Style</Button>
            </div>
          </div>

          {/* Sizes and Icons */}
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
              Sizes & Icon Pairing (sm, default, lg, icon)
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">
                Small <ArrowRight className="size-3.5" />
              </Button>
              <Button size="default">
                Standard <ArrowRight className="size-4" />
              </Button>
              <Button size="lg">
                Large Display <ArrowRight className="size-4" />
              </Button>
              <Button size="icon" variant="outline" aria-label="Copy">
                <Copy className="size-4" />
              </Button>
              <Button size="icon" variant="secondary" aria-label="View">
                <Eye className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBtnLoading(true)
                  setTimeout(() => setBtnLoading(false), 2000)
                }}
              >
                {btnLoading ? (
                  <>
                    <Spinner className="size-3.5" /> Loading...
                  </>
                ) : (
                  "Click for Loading State"
                )}
              </Button>
              <Button disabled variant="default">
                Disabled State
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Badges & Status Tags */}
      <div className="space-y-6">
        <div className="border-b border-border pb-3 flex items-baseline justify-between">
          <h3 className="font-serif text-2xl">Badges & Editorial Tags</h3>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            components/ui/badge.tsx
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
              Semantic Status Pills
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-mono">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Published
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-mono">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Scheduled
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-mono">
                <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                Draft
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-mono text-destructive">
                <span className="size-1.5 rounded-full bg-destructive" />
                Archived
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
              Editorial Categories & Tags
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">Brand Strategy</Badge>
              <Badge variant="secondary">Visual Identity</Badge>
              <Badge variant="outline">Art Direction</Badge>
              <Badge variant="secondary">Typography</Badge>
              <Badge variant="outline">2026 Collection</Badge>
              <Badge variant="destructive">Hot Deliverable</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Form Controls & Inputs */}
      <div className="space-y-6">
        <div className="border-b border-border pb-3 flex items-baseline justify-between">
          <h3 className="font-serif text-2xl">Form Architecture & Inputs</h3>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            WCAG 1.4.11 Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-xl border border-border bg-card p-6 md:p-8">
          {/* Text Input & Search */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  className="pl-9 bg-background"
                  placeholder="Enter your email"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                High-contrast border with 3.2:1 contrast against ground.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Search Projects
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background"
                  placeholder="Brand identity, packaging, typography..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Project Inquiry Details
              </label>
              <Textarea
                rows={3}
                className="bg-background"
                placeholder="Tell me about your business, vision, and timeline..."
                defaultValue="Looking to refresh our architectural identity with modern editorial typography and brand guidelines."
              />
            </div>
          </div>

          {/* Toggles, Checkboxes & Sliders */}
          <div className="space-y-6 bg-secondary/30 p-5 rounded-lg border border-border/60">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">Automatic Client Sync</span>
                <p className="text-xs text-muted-foreground">
                  Synchronize active moodboards and invoice PDF links
                </p>
              </div>
              <Switch checked={switchActive} onCheckedChange={setSwitchActive} />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={checkboxChecked}
                onCheckedChange={(c) => setCheckboxChecked(!!c)}
              />
              <label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer select-none">
                <span className="font-medium text-foreground">Include Full Commercial Rights</span>
                <span className="block text-muted-foreground">
                  Perpetual exclusive license for digital, packaging, and print media.
                </span>
              </label>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Visual System Complexity</span>
                <span className="font-semibold">{sliderVal[0]}%</span>
              </div>
              <Slider
                value={sliderVal}
                onValueChange={setSliderVal}
                max={100}
                step={5}
                className="py-1"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" className="gap-2">
                <Send className="size-3.5" /> Submit Brief
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Editorial Cards */}
      <div className="space-y-6">
        <div className="border-b border-border pb-3 flex items-baseline justify-between">
          <h3 className="font-serif text-2xl">Editorial Cards & Surfaces</h3>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Clean 1px Hairline Systems
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Metric Card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-foreground/40 transition-colors">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Experience
              </span>
              <p className="font-serif text-5xl tracking-tight mt-3">6+ Years</p>
            </div>
            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border/60">
              Directing brand identity systems in Nepal, Australia, and worldwide.
            </p>
          </div>

          {/* Card 2: Editorial Teaser */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-foreground/40 transition-colors group">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                  Brand Identity
                </span>
                <span className="text-xs text-muted-foreground font-mono">2026</span>
              </div>
              <h4 className="font-serif text-2xl mt-3 group-hover:text-foreground/80 transition-colors">
                Meridian Architecture
              </h4>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Comprehensive identity featuring a geometric monogram, warm alabaster palette, and custom monographs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium">
              <span>View Case Study</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Testimonial Card */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:border-foreground/40 transition-colors">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Client Perspective
              </span>
              <p className="font-serif text-lg leading-snug mt-3 italic text-foreground/90">
                &ldquo;Prajesh created a visual identity that felt remarkably grounded yet timeless. The system scaled across our entire product line effortlessly.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-3">
              <div className="size-8 rounded-full bg-secondary flex items-center justify-center font-serif text-sm">
                MK
              </div>
              <div>
                <p className="text-xs font-medium">Milan Karki</p>
                <p className="text-[11px] text-muted-foreground">Founder, Meridian Studio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
