import type { Metadata } from "next"
import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { COLOR_TOKENS, SPACING_SCALE, RADIUS_TOKENS } from "@/lib/design-system/tokens"
import { ColorSwatchCard } from "@/components/design-system/token-card"
import { TypographyPlayground } from "@/components/design-system/typography-playground"
import { ComponentShowcase } from "@/components/design-system/component-showcase"
import { BrandmarkBreakdown } from "@/components/design-system/brandmark-breakdown"
import { MotionSandbox } from "@/components/design-system/motion-sandbox"
import { CodeExporter } from "@/components/design-system/code-exporter"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Palette,
  Type,
  Maximize2,
  Box,
  Activity,
  Code,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Design System — Prajesh Shakya",
  description:
    "The living design system powering the portfolio and content studio of Prajesh Shakya. Minimal mono palette, editorial typography, and purposeful motion.",
  alternates: {
    canonical: `${SITE_URL}/design-system`,
  },
  openGraph: {
    title: "Design System — Prajesh Shakya",
    description:
      "The living design system powering the portfolio and content studio of Prajesh Shakya: Instrument Serif, Instrument Sans, Ground #F5F5F3 and Ink #1B1A16.",
    url: `${SITE_URL}/design-system`,
  },
}

const navAnchors = [
  { id: "principles", label: "Philosophy", icon: Sparkles },
  { id: "monogram", label: "Brandmark", icon: Box },
  { id: "colors", label: "Color Tokens", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "spacing", label: "Grid & Spacing", icon: Maximize2 },
  { id: "components", label: "UI Components", icon: Layers },
  { id: "motion", label: "Motion", icon: Activity },
  { id: "export", label: "Code Export", icon: Code },
]

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      {/* 1. Hero Section */}
      <section className="page-container mb-16 md:mb-24">
        <div className="border-b border-border pb-12 md:pb-16">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-mono uppercase tracking-wider">
              <span className="size-2 rounded-full bg-foreground" />
              Design System v2.0
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              2026 Studio Edition
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              <ShieldCheck className="size-3 text-foreground" /> WCAG 2.1 AA Compliant
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-balance">
                Prajesh Shakya Design System
              </h1>
              <p className="font-sans text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
                A living system of editorial restraint, typographic precision, and tactile digital craft. Built for quiet confidence, high accessibility, and timeless longevity.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-secondary"
              >
                <span>View Portfolio</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Anchor Jump Navigation */}
        <div className="mt-8 flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {navAnchors.map((anchor) => {
            const Icon = anchor.icon
            return (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
              >
                <Icon className="size-3.5" />
                <span>{anchor.label}</span>
              </a>
            )
          })}
        </div>
      </section>

      {/* 2. Core Philosophy & Principles */}
      <section id="principles" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            Foundation
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">Design Principles</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-base">
            Every token, component, and animation is guided by four uncompromising values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase block mb-3">
                01 · Restraint
              </span>
              <h3 className="font-serif text-2xl tracking-tight mb-2">Ground & Ink</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No loud synthetic accents. Ground (#F5F5F3) and Ink (#1B1A16) establish a quiet, gallery-grade atmosphere where client work takes center stage.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
              Warm Parchment · Pure Mono
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase block mb-3">
                02 · Hierarchy
              </span>
              <h3 className="font-serif text-2xl tracking-tight mb-2">Typographic Truth</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instrument Serif gives human editorial presence to big statements, Instrument Sans handles dense utility, and Geist Mono carries technical precision.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
              Serif · Sans · Monospace
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase block mb-3">
                03 · Structure
              </span>
              <h3 className="font-serif text-2xl tracking-tight mb-2">Hairlines over Shadows</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Heavy dropped shadows are replaced with crisp, tactile 1px hairlines. Spatial clarity is achieved through proportion, margins, and negative space.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
              1px Hairline #D9D7CD
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase block mb-3">
                04 · Purpose
              </span>
              <h3 className="font-serif text-2xl tracking-tight mb-2">Honest Physics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Motion never exists for spectacle. It serves as an informative transition, respecting user agency with instant reduced-motion fallbacks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
              0.6s Editorial Ease · WCAG 2.3.3
            </div>
          </div>
        </div>
      </section>

      {/* 3. Brandmark & Identity Core */}
      <section id="monogram" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            Visual Symbol
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">The PS Monogram</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-base">
            Geometric breakdown, clear space guidelines, and 45° angle isometric construction rules.
          </p>
        </div>

        <BrandmarkBreakdown />
      </section>

      {/* 4. Color System */}
      <section id="colors" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
              Color Tokens & Accessibility
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight">The Color Palette</h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-base">
              Calibrated for warm tactile presence in light mode, obsidian clarity in dark mode, and rigorous WCAG 2.1 AA/AAA accessibility.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Click any token to copy HEX or CSS variable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COLOR_TOKENS.map((token) => (
            <ColorSwatchCard key={token.name} token={token} />
          ))}
        </div>
      </section>

      {/* 5. Typography System */}
      <section id="typography" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            Typography System
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">Type Specimens & Hierarchy</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-base">
            Test the live type specimens, adjust dynamic scale sliders, and review the full editorial type hierarchy.
          </p>
        </div>

        <TypographyPlayground />
      </section>

      {/* 6. Spacing & Grid */}
      <section id="spacing" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            Spatial Architecture
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">Grid, Spacing & Radii</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-base">
            Constructed upon an 8pt baseline rhythm with responsive margins, full-bleed Behance blocks, and restrained corner radii.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Spacing Scale */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-2xl">8pt Baseline Spacing Scale</h3>
            <div className="divide-y divide-border/80">
              {SPACING_SCALE.map((space) => (
                <div key={space.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 w-1/3">
                    <span className="font-mono font-medium text-foreground w-8">
                      {space.name}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {space.px}px ({space.rem})
                    </span>
                  </div>

                  <div className="w-1/3">
                    <div
                      className="h-2 bg-foreground/70 rounded-xs"
                      style={{ width: `${Math.min(space.px * 1.5, 120)}px` }}
                    />
                  </div>

                  <div className="w-1/3 text-right text-muted-foreground font-mono text-[11px] truncate">
                    {space.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Border Radii */}
          <div className="lg:col-span-5 rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-2xl">Corner Radii Tokens</h3>
            <div className="space-y-4">
              {RADIUS_TOKENS.map((rad) => (
                <div key={rad.name} className="flex items-center justify-between p-3 rounded border border-border bg-background">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold">{rad.name}</span>
                    <p className="text-[11px] text-muted-foreground font-mono">{rad.value}</p>
                    <p className="text-[10px] text-muted-foreground">{rad.usage}</p>
                  </div>
                  <div
                    className={`size-10 bg-secondary border border-foreground/40 shrink-0 ${rad.class}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. UI Components Catalog */}
      <section id="components" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            Component Library
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">UI Primitives & States</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-base">
            Standardized, accessible building blocks crafted with React, Radix UI primitives, and Tailwind CSS.
          </p>
        </div>

        <ComponentShowcase />
      </section>

      {/* 8. Motion & Physics */}
      <section id="motion" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            Motion System
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">Choreography & Easings</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-base">
            Physical animations calibrated for quiet editorial transitions and immediate accessibility.
          </p>
        </div>

        <MotionSandbox />
      </section>

      {/* 9. Code & Token Export */}
      <section id="export" className="page-container py-16 border-t border-border scroll-mt-24">
        <div className="mb-12">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono block mb-2">
            Developer Handoff
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">Code Export & Design Tokens</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-base">
            Copy or download design tokens for Next.js, Tailwind v4, TypeScript, Figma Tokens Studio, and CSS.
          </p>
        </div>

        <CodeExporter />
      </section>
    </div>
  )
}
