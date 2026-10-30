"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BrandMark } from "@/components/brand-mark"
import { ArrowRight, Lock, Sparkles, Smartphone, ShieldCheck } from "lucide-react"

interface MobileAuthGateProps {
  allowDemo?: boolean
}

export function MobileAuthGate({ allowDemo = true }: MobileAuthGateProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between px-6 py-12 max-w-md mx-auto text-center antialiased">
      <div className="flex justify-center pt-8">
        <BrandMark className="h-12 w-12 text-foreground" />
      </div>

      <div className="space-y-4 my-auto py-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
          Studio Overview · MFE
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          Prajesh Shakya
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground max-w-xs mx-auto">
          Mobile command center & micro frontend for studio cashflow, client moodboards, and operational pipeline.
        </p>

        <div className="pt-6 space-y-3">
          {allowDemo && (
            <button
              onClick={() => router.push("/overview?demo=true")}
              className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-foreground text-background font-medium text-xs tracking-wider uppercase transition-transform active:scale-[0.98] shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Launch Studio Preview
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          )}

          <Link
            href="/admin"
            className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-foreground font-medium text-xs tracking-wider uppercase transition-colors active:scale-[0.98]"
          >
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            Admin Studio Sign In
          </Link>
        </div>
      </div>

      <footer className="pt-6 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
        <span>Vercel Micro Frontend · 2026 Edition</span>
      </footer>
    </div>
  )
}
