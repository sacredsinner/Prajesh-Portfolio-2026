"use client"

import { BRAND_MARK_RULES } from "@/lib/design-system/tokens"
import { BrandMark } from "@/components/brand-mark"
import { Check, X, ShieldCheck } from "lucide-react"

export function BrandmarkBreakdown() {
  return (
    <div className="space-y-12">
      {/* Anatomy and Construction */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-8">
        <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Identity Core
            </span>
            <h3 className="font-serif text-2xl mt-1">PS Monogram Geometry & Grid</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Strict 45° Angle Isometric Projection
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual Grid Anatomy Box */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-lg border border-border relative overflow-hidden">
            {/* Background 45° grid simulation */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--foreground) 0, var(--foreground) 1px, transparent 0, transparent 20px), repeating-linear-gradient(-45deg, var(--foreground) 0, var(--foreground) 1px, transparent 0, transparent 20px)",
              }}
            />

            {/* Clear space boundary indicator */}
            <div className="relative border border-dashed border-foreground/40 p-8 rounded-sm">
              <span className="absolute -top-3 left-2 bg-background px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground uppercase border border-border">
                Clear Space: 1x Stroke
              </span>
              <BrandMark className="size-32 text-foreground relative z-10 transition-transform hover:scale-105 duration-300" />
            </div>

            <p className="mt-4 text-[11px] font-mono text-muted-foreground text-center">
              Master artwork traced at 100 × 100 viewBox. Continuous rounded stroke.
            </p>
          </div>

          {/* Rules and Construction Info */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h4 className="font-serif text-lg">Continuous 45° Flow</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {BRAND_MARK_RULES.geometry} The loop of the &lsquo;P&rsquo; establishes structural stability at the summit, while the descending path interweaves to form the &lsquo;S&rsquo; terminal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-lg border border-border bg-background space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">
                  Min Digital Size
                </span>
                <p className="font-mono text-sm font-semibold">{BRAND_MARK_RULES.minimumSizeDigital}</p>
                <div className="pt-2 flex items-center gap-2">
                  <BrandMark className="size-[18px]" />
                  <span className="text-[11px] text-muted-foreground">18px favicon test</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-background space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">
                  Min Print Size
                </span>
                <p className="font-mono text-sm font-semibold">{BRAND_MARK_RULES.minimumSizePrint}</p>
                <div className="pt-2 flex items-center gap-2">
                  <BrandMark className="size-6" />
                  <span className="text-[11px] text-muted-foreground">Print vector test</span>
                </div>
              </div>
            </div>

            {/* Light / Dark Mode Pairings */}
            <div className="pt-2 space-y-2">
              <span className="text-xs uppercase font-mono text-muted-foreground">
                Ground & Inverted Boards
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded border border-border bg-[#F5F5F3] text-[#1B1A16]">
                  <BrandMark className="size-6" />
                  <div>
                    <p className="text-xs font-semibold">Standard Board</p>
                    <p className="text-[10px] opacity-75">Ink on Ground</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded border border-border bg-[#1B1A16] text-[#F5F5F3]">
                  <BrandMark className="size-6" />
                  <div>
                    <p className="text-xs font-semibold">Inverted Board</p>
                    <p className="text-[10px] opacity-75">Ground on Ink</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dos & Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Check className="size-4" />
            <h4 className="font-serif text-lg">Mark Guidelines (Dos)</h4>
          </div>
          <ul className="space-y-3">
            {BRAND_MARK_RULES.dos.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <span className="mt-0.5 size-1.5 rounded-full bg-foreground shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive font-medium">
            <X className="size-4" />
            <h4 className="font-serif text-lg text-foreground">Usage Restrictions (Don&rsquo;ts)</h4>
          </div>
          <ul className="space-y-3">
            {BRAND_MARK_RULES.donts.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <span className="mt-0.5 size-1.5 rounded-full bg-destructive shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
