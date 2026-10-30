"use client"

import { useState } from "react"
import {
  Download,
  FileImage,
  FileText,
  Share2,
  Copy,
  Check,
  X,
  Loader2,
  Sparkles,
} from "lucide-react"
import type { DesignerProject } from "./types"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { toast } from "sonner"

interface DesignerExportModalProps {
  project: DesignerProject
  isOpen: boolean
  onClose: () => void
  canvasElement?: HTMLDivElement | null
}

export function DesignerExportModal({
  project,
  isOpen,
  onClose,
  canvasElement,
}: DesignerExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "pdf">("png")
  const [isExporting, setIsExporting] = useState(false)
  const [hasCopiedLink, setHasCopiedLink] = useState(false)

  if (!isOpen) return null

  // Export as PDF using pdf-lib
  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([1920, 1080])
      const { width, height } = page.getSize()

      // Dark background
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.07, 0.07, 0.06),
      })

      const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Header
      page.drawText(project.name.toUpperCase(), {
        x: 100,
        y: height - 120,
        size: 36,
        font: fontSerif,
        color: rgb(0.95, 0.95, 0.92),
      })

      page.drawText(`CREATIVE DIRECTION: ${project.stylePreset.toUpperCase()} · ${project.visualSettings.mood.toUpperCase()}`, {
        x: 100,
        y: height - 160,
        size: 14,
        font: fontRegular,
        color: rgb(0.83, 0.69, 0.22), // gold
      })

      // Brief summary
      const briefSnippet = project.brief.slice(0, 240) + "..."
      page.drawText(briefSnippet, {
        x: 100,
        y: height - 200,
        size: 12,
        font: fontRegular,
        color: rgb(0.65, 0.65, 0.62),
        maxWidth: 1720,
      })

      // Draw item placeholder summaries
      let currX = 100
      let currY = height - 280

      for (const item of project.items.slice(0, 6)) {
        if (item.type === "image") {
          page.drawRectangle({
            x: currX,
            y: currY - 320,
            width: 480,
            height: 300,
            color: rgb(0.12, 0.12, 0.11),
            borderColor: rgb(0.25, 0.25, 0.23),
            borderWidth: 1,
          })

          if (item.caption) {
            page.drawText(item.caption.slice(0, 50), {
              x: currX + 20,
              y: currY - 300,
              size: 12,
              font: fontRegular,
              color: rgb(0.9, 0.9, 0.9),
            })
          }

          currX += 520
          if (currX > width - 500) {
            currX = 100
            currY -= 360
          }
        }
      }

      // Footer
      page.drawText("PRAJESH SHAKYA STUDIO · AI MOODBOARD DESIGNER", {
        x: 100,
        y: 60,
        size: 11,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.48),
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-moodboard.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast.success("Moodboard PDF presentation generated!")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  // Export as Image (PNG / JPG)
  const handleExportImage = async () => {
    setIsExporting(true)
    try {
      // Create high-res canvas composite
      const canvas = document.createElement("canvas")
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context unavailable")

      // Background
      ctx.fillStyle = project.canvasBackground === "studio-paper" ? "#F5F5F3" : "#11110F"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Gold dots
      ctx.fillStyle = "rgba(212, 175, 55, 0.25)"
      for (let x = 0; x < canvas.width; x += 32) {
        for (let y = 0; y < canvas.height; y += 32) {
          ctx.beginPath()
          ctx.arc(x, y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Title & Header
      ctx.fillStyle = project.canvasBackground === "studio-paper" ? "#1B1A16" : "#FAFAFA"
      ctx.font = "bold 38px serif"
      ctx.fillText(project.name, 80, 100)

      ctx.fillStyle = "#D4AF37"
      ctx.font = "14px sans-serif"
      ctx.fillText(`STYLE: ${project.stylePreset.toUpperCase()} · ${project.visualSettings.mood.toUpperCase()}`, 80, 135)

      // Render cards
      project.items.forEach((item) => {
        const x = Math.min(canvas.width - item.w - 80, Math.max(80, item.x + 80))
        const y = Math.min(canvas.height - item.h - 80, Math.max(160, item.y + 160))

        if (item.type === "color") {
          ctx.fillStyle = item.hex
          ctx.beginPath()
          ctx.roundRect(x, y, item.w, item.h, 12)
          ctx.fill()

          ctx.fillStyle = "#FFFFFF"
          ctx.font = "bold 14px sans-serif"
          ctx.fillText(item.name || item.hex, x + 16, y + item.h - 24)
        } else if (item.type === "palette") {
          const sliceW = item.w / item.colors.length
          item.colors.forEach((c, idx) => {
            ctx.fillStyle = c
            ctx.fillRect(x + idx * sliceW, y, sliceW, item.h - 40)
          })
          ctx.fillStyle = "#222220"
          ctx.fillRect(x, y + item.h - 40, item.w, 40)
          ctx.fillStyle = "#FFFFFF"
          ctx.font = "12px sans-serif"
          ctx.fillText(item.name || "Curated Palette", x + 14, y + item.h - 15)
        } else {
          ctx.fillStyle = "#1E1E1C"
          ctx.beginPath()
          ctx.roundRect(x, y, item.w, item.h, 12)
          ctx.fill()

          ctx.fillStyle = "#8E8E88"
          ctx.font = "13px serif"
          const txt = item.type === "image" ? item.caption || "Concept Visual" : item.type === "typography" ? item.heading : "Note"
          ctx.fillText(txt.slice(0, 40), x + 20, y + item.h / 2)
        }
      })

      const mimeType = exportFormat === "png" ? "image/png" : "image/jpeg"
      const dataUrl = canvas.toDataURL(mimeType, 0.95)
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${exportFormat}`
      a.click()

      toast.success(`Exported high-res ${exportFormat.toUpperCase()}!`)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyClientLink = () => {
    const url = `${window.location.origin}/m/apple`
    navigator.clipboard.writeText(url)
    setHasCopiedLink(true)
    toast.success("Client moodboard link copied to clipboard!")
    setTimeout(() => setHasCopiedLink(false), 2500)
  }

  return (
    <div
      data-control="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#383834] bg-[#161615] p-6 text-[#E6E6E3] shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A26] pb-4">
          <div className="flex items-center gap-2.5">
            <Download className="h-5 w-5 text-amber-400" />
            <h3 className="font-serif text-lg font-medium text-white">Export Moodboard</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#8E8E88] hover:bg-[#252522] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="mt-5 space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#A6A6A0]">
            Select Export Format
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setExportFormat("png")}
              className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
                exportFormat === "png"
                  ? "border-amber-500 bg-[#252219] text-white ring-1 ring-amber-500/30"
                  : "border-[#2A2A26] bg-[#1A1A18] text-[#8E8E88] hover:border-[#3E3E38] hover:text-white"
              }`}
            >
              <FileImage className="h-6 w-6 mb-2 text-amber-400" />
              <span className="text-xs font-bold">PNG</span>
              <span className="text-[10px] text-[#7E7E78]">High-Res Raster</span>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat("jpg")}
              className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
                exportFormat === "jpg"
                  ? "border-amber-500 bg-[#252219] text-white ring-1 ring-amber-500/30"
                  : "border-[#2A2A26] bg-[#1A1A18] text-[#8E8E88] hover:border-[#3E3E38] hover:text-white"
              }`}
            >
              <FileImage className="h-6 w-6 mb-2 text-amber-400" />
              <span className="text-xs font-bold">JPG</span>
              <span className="text-[10px] text-[#7E7E78]">Optimized Web</span>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat("pdf")}
              className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
                exportFormat === "pdf"
                  ? "border-amber-500 bg-[#252219] text-white ring-1 ring-amber-500/30"
                  : "border-[#2A2A26] bg-[#1A1A18] text-[#8E8E88] hover:border-[#3E3E38] hover:text-white"
              }`}
            >
              <FileText className="h-6 w-6 mb-2 text-amber-400" />
              <span className="text-xs font-bold">PDF</span>
              <span className="text-[10px] text-[#7E7E78]">Design Deck</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={exportFormat === "pdf" ? handleExportPDF : handleExportImage}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-semibold text-[#111110] shadow-lg transition hover:brightness-110 active:scale-98 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating {exportFormat.toUpperCase()}…</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download {exportFormat.toUpperCase()} ({project.items.length} Elements)</span>
                </>
              )}
            </button>
          </div>

          {/* Shareable Client Link Box */}
          <div className="rounded-xl border border-[#2E2E2A] bg-[#1A1A18] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-white">
                <Share2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Client Presentation View</span>
              </span>
              <span className="text-[10px] text-[#7E7E78]">Live Interactive URL</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/m/apple`}
                className="w-full rounded border border-[#262624] bg-[#121211] px-2.5 py-1.5 font-mono text-[11px] text-[#A6A6A0] outline-none"
              />
              <button
                type="button"
                onClick={handleCopyClientLink}
                className="flex cursor-pointer items-center gap-1 rounded bg-[#282824] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#343430]"
              >
                {hasCopiedLink ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{hasCopiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
