"use client"

import { useState } from "react"
import { TYPOGRAPHY_SCALE, type TypographyToken } from "@/lib/design-system/tokens"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Type, Sparkles } from "lucide-react"

export function TypographyPlayground() {
  const [sampleText, setSampleText] = useState(
    "Great brands are built on truth. Editorial restraint, typographic precision, purposeful craft."
  )
  const [selectedFont, setSelectedFont] = useState<"serif" | "sans" | "mono">("serif")
  const [fontSize, setFontSize] = useState(48)
  const [isItalic, setIsItalic] = useState(false)
  const [isUppercase, setIsUppercase] = useState(false)
  const [lineHeight, setLineHeight] = useState(1.1)

  const fontClass =
    selectedFont === "serif"
      ? "font-serif"
      : selectedFont === "sans"
      ? "font-sans"
      : "font-mono"

  return (
    <div className="space-y-12">
      {/* Interactive Typography Lab */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Type className="size-3.5" /> Interactive Type Specimen
            </span>
            <h3 className="font-serif text-2xl">Type Specimen Lab</h3>
          </div>

          {/* Font Family Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedFont("serif")
                setFontSize(54)
                setLineHeight(1.05)
              }}
              className={`px-3 py-1.5 rounded-md text-xs tracking-wide transition-all ${
                selectedFont === "serif"
                  ? "bg-foreground text-background font-medium"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Instrument Serif
            </button>
            <button
              onClick={() => {
                setSelectedFont("sans")
                setFontSize(32)
                setLineHeight(1.3)
              }}
              className={`px-3 py-1.5 rounded-md text-xs tracking-wide transition-all ${
                selectedFont === "sans"
                  ? "bg-foreground text-background font-medium"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Instrument Sans
            </button>
            <button
              onClick={() => {
                setSelectedFont("mono")
                setFontSize(20)
                setLineHeight(1.5)
              }}
              className={`px-3 py-1.5 rounded-md text-xs tracking-wide transition-all ${
                selectedFont === "mono"
                  ? "bg-foreground text-background font-medium"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Geist Mono
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-secondary/40 p-4 rounded-lg border border-border/60">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Size</span>
              <span className="font-semibold">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              min={12}
              max={96}
              step={1}
              onValueChange={(val) => setFontSize(val[0] ?? 48)}
              className="py-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Line Height</span>
              <span className="font-semibold">{lineHeight.toFixed(2)}</span>
            </div>
            <Slider
              value={[Math.round(lineHeight * 100)]}
              min={85}
              max={200}
              step={5}
              onValueChange={(val) => setLineHeight((val[0] ?? 110) / 100)}
              className="py-1"
            />
          </div>

          <div className="flex items-center gap-2 pt-4 md:pt-0">
            <Button
              variant={isItalic ? "default" : "outline"}
              size="sm"
              onClick={() => setIsItalic(!isItalic)}
              className="text-xs flex-1"
            >
              Italic
            </Button>
            <Button
              variant={isUppercase ? "default" : "outline"}
              size="sm"
              onClick={() => setIsUppercase(!isUppercase)}
              className="text-xs flex-1 uppercase tracking-widest"
            >
              Caps
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSampleText(
                  "Great brands are built on truth. Editorial restraint, typographic precision, purposeful craft."
                )
                setFontSize(48)
                setLineHeight(1.1)
                setIsItalic(false)
                setIsUppercase(false)
              }}
              className="text-xs px-2"
              title="Reset"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Live Specimen Preview Canvas */}
        <div className="min-h-[220px] rounded-lg border border-border/80 bg-background p-6 md:p-8 flex items-center overflow-x-hidden">
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => setSampleText(e.currentTarget.textContent || "")}
            className={`${fontClass} ${
              isItalic ? "italic" : ""
            } ${isUppercase ? "uppercase tracking-widest" : "tracking-tight"} text-foreground transition-all duration-100 outline-none select-text focus:ring-1 focus:ring-border rounded px-1`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
            }}
          >
            {sampleText}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>Click directly on the specimen above to edit sample copy live</span>
          <span>Prajesh Shakya Typography System</span>
        </div>
      </div>

      {/* Complete Type Scale Table */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <h4 className="font-serif text-xl tracking-tight">Standard Editorial Type Scale</h4>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Instrument Serif · Instrument Sans · Geist Mono
          </span>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {TYPOGRAPHY_SCALE.map((token) => (
            <div
              key={token.name}
              className="p-5 md:p-6 transition-colors hover:bg-secondary/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="w-full lg:w-1/3 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-lg">{token.name}</span>
                  <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                    {token.family}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{token.usage}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground pt-1">
                  <span>{token.sizePx}px ({token.sizeRem})</span>
                  <span>·</span>
                  <span>Leading: {token.lineHeight}</span>
                  <span>·</span>
                  <span>Tracking: {token.letterSpacing}</span>
                </div>
              </div>

              <div className="w-full lg:w-2/3 overflow-hidden">
                <div
                  className={`${token.fontClass} text-foreground truncate select-all`}
                  title={token.sample}
                >
                  {token.sample}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
