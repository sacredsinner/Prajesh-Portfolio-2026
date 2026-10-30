"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Download, Code2, FileJson } from "lucide-react"
import { exportDesignSystemJson, exportDesignTokensCss } from "@/lib/design-system"

const TAILWIND_THEME_SNIPPET = `@theme inline {
  --font-sans: var(--font-instrument-sans), system-ui, sans-serif;
  --font-serif: var(--font-instrument-serif), Georgia, serif;
  --font-mono: 'Geist Mono', 'Geist Mono Fallback', monospace;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}`

const TYPESCRIPT_IMPORT_SNIPPET = `import {
  COLOR_TOKENS,
  TYPOGRAPHY_SCALE,
  SPACING_SCALE,
  RADIUS_TOKENS,
  MOTION_TOKENS,
  BRAND_MARK_RULES,
  calculateContrast,
} from "@/lib/design-system"

// Example usage:
const inkContrast = calculateContrast("#F5F5F3", "#1B1A16") // => 14.2:1`

export function CodeExporter() {
  const [activeTab, setActiveTab] = useState<"css" | "tailwind" | "ts" | "json">("css")
  const [copied, setCopied] = useState(false)

  const activeContent =
    activeTab === "css"
      ? exportDesignTokensCss()
      : activeTab === "tailwind"
      ? TAILWIND_THEME_SNIPPET
      : activeTab === "ts"
      ? TYPESCRIPT_IMPORT_SNIPPET
      : exportDesignSystemJson()

  function handleCopy() {
    navigator.clipboard.writeText(activeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportDesignSystemJson())
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "prajesh-design-tokens-2026.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Exporter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-secondary/30 p-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("css")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              activeTab === "css"
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            CSS Variables
          </button>
          <button
            onClick={() => setActiveTab("tailwind")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              activeTab === "tailwind"
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Tailwind @theme
          </button>
          <button
            onClick={() => setActiveTab("ts")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              activeTab === "ts"
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            TypeScript Tokens
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              activeTab === "json"
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            JSON Raw
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="gap-2 text-xs h-8"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-foreground" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> Copy Code
              </>
            )}
          </Button>

          {activeTab === "json" && (
            <Button
              size="sm"
              variant="default"
              onClick={handleDownloadJson}
              className="gap-2 text-xs h-8"
            >
              <Download className="size-3.5" /> Download JSON
            </Button>
          )}
        </div>
      </div>

      {/* Code Window */}
      <div className="p-6 bg-background font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
        <pre className="text-foreground/90 whitespace-pre">
          <code>{activeContent}</code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-border/60 bg-secondary/20 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span>Ready for import into Next.js, Figma Tokens Studio, or Style Dictionary</span>
        <span>Prajesh Shakya Design System v2.0</span>
      </div>
    </div>
  )
}
