"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { type ColorToken } from "@/lib/design-system/tokens"

export function ColorSwatchCard({ token }: { token: ColorToken }) {
  const [copiedHex, setCopiedHex] = useState(false)
  const [copiedVar, setCopiedVar] = useState(false)

  function copy(text: string, type: "hex" | "var") {
    navigator.clipboard.writeText(text)
    if (type === "hex") {
      setCopiedHex(true)
      setTimeout(() => setCopiedHex(false), 1800)
    } else {
      setCopiedVar(true)
      setTimeout(() => setCopiedVar(false), 1800)
    }
  }

  return (
    <div className="group flex flex-col justify-between rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-foreground/30">
      <div>
        {/* Color preview blocks (Light & Dark preview) */}
        <div className="relative mb-4 overflow-hidden rounded-md border border-border/80">
          <div className="grid grid-cols-2 h-20">
            <div
              className="flex items-end p-2 transition-transform group-hover:scale-[1.02]"
              style={{ backgroundColor: token.hex }}
            >
              <span
                className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: token.hex === "#F5F5F3" ? "#1B1A16" : "#F5F5F3",
                  color: token.hex === "#F5F5F3" ? "#F5F5F3" : "#1B1A16",
                }}
              >
                Light
              </span>
            </div>
            <div
              className="flex items-end p-2 transition-transform group-hover:scale-[1.02]"
              style={{ backgroundColor: token.darkHex }}
            >
              <span
                className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: token.darkHex === "#1B1A16" ? "#F5F5F3" : "#1B1A16",
                  color: token.darkHex === "#1B1A16" ? "#1B1A16" : "#F5F5F3",
                }}
              >
                Dark
              </span>
            </div>
          </div>
        </div>

        {/* Token Name and Role */}
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-serif text-lg tracking-tight">{token.name}</h4>
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
            {token.wcagGround === "AAA"
              ? "WCAG AAA"
              : token.wcagGround === "AA"
              ? "WCAG AA"
              : "Surface"}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {token.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
        {/* Hex copy button */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">HEX:</span>
          <button
            onClick={() => copy(token.hex, "hex")}
            className="inline-flex items-center gap-1.5 font-medium hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-secondary"
            title="Click to copy hex"
          >
            <span>{token.hex}</span>
            {copiedHex ? (
              <Check className="size-3 text-foreground" />
            ) : (
              <Copy className="size-3 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* CSS Variable copy button */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">VAR:</span>
          <button
            onClick={() => copy(`var(${token.cssVar})`, "var")}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-secondary truncate max-w-[170px]"
            title="Click to copy CSS variable"
          >
            <span className="truncate">{token.cssVar}</span>
            {copiedVar ? (
              <Check className="size-3 text-foreground shrink-0" />
            ) : (
              <Copy className="size-3 text-muted-foreground shrink-0" />
            )}
          </button>
        </div>

        {/* Contrast with Ground */}
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
          <span>Contrast (vs Ground):</span>
          <span className="font-medium text-foreground">{token.contrastOnGround}</span>
        </div>
      </div>
    </div>
  )
}
