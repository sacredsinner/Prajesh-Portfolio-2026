import "server-only"

import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, rgb, setCharacterSpacing, type PDFFont, type PDFPage } from "pdf-lib"
import { BRAND_MARK_PATH } from "@/components/brand-mark"
import { STATUS_LABELS, documentTotals, formatDate, lineAmount, type BusinessSettings, type DisplayStatus, type DocumentKind, type InvoiceItem } from "@/lib/invoices"
import { formatMoney, type Currency } from "@/lib/money"
import { SANS_REGULAR, SANS_SEMIBOLD, SERIF_ITALIC, SERIF_REGULAR } from "@/lib/pdf/fonts"
import { SITE_URL } from "@/lib/site"

// A4 quote / invoice PDF in the brand's style: Instrument Serif headings, Instrument Sans
// text, ink on white, hairlines. Built with pdf-lib, so it runs in any Node function.

export type PdfDocumentData = {
  kind: DocumentKind
  number: string
  status: DisplayStatus
  clientName: string
  clientCompany: string | null
  clientEmail: string | null
  clientAddress: string | null
  currency: Currency
  items: InvoiceItem[]
  taxLabel: string | null
  taxRate: number
  issueDate: string
  dueDate: string | null
  notes: string | null
  paymentLink: string | null
  publicUrl: string
}

const INK = rgb(27 / 255, 26 / 255, 22 / 255)
const SOFT = rgb(69 / 255, 68 / 255, 61 / 255)
const MUTED = rgb(111 / 255, 109 / 255, 99 / 255)
const HAIR = rgb(217 / 255, 215 / 255, 205 / 255)

const PAGE = { width: 595.28, height: 841.89 }
const MARGIN = 56
const CONTENT = PAGE.width - MARGIN * 2

type Fonts = { sans: PDFFont; sansBold: PDFFont; serif: PDFFont; serifItalic: PDFFont }

const fromBase64 = (value: string) => Uint8Array.from(Buffer.from(value, "base64"))

// Splits text into lines that fit the width (keeps the author's line breaks).
function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = []
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!paragraph.trim()) {
      lines.push("")
      continue
    }
    let line = ""
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(next, size) <= width) line = next
      else {
        if (line) lines.push(line)
        // A single word longer than the line (e.g. a long URL) is cut to fit.
        let rest = word
        while (font.widthOfTextAtSize(rest, size) > width && rest.length > 1) {
          let cut = rest.length - 1
          while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > width) cut--
          lines.push(rest.slice(0, cut))
          rest = rest.slice(cut)
        }
        line = rest
      }
    }
    lines.push(line)
  }
  return lines
}

// Characters outside the embedded subset would throw; swap the common ones and drop the rest.
const characterSets = new WeakMap<PDFFont, Set<number>>()
function safe(text: string, font: PDFFont) {
  let supported = characterSets.get(font)
  if (!supported) {
    supported = new Set(font.getCharacterSet())
    characterSets.set(font, supported)
  }
  return [...text.replace(/\t/g, " ")]
    .map((char) => (supported.has(char.codePointAt(0) ?? 0) ? char : "?"))
    .join("")
}

export async function buildDocumentPdf(data: PdfDocumentData, business: BusinessSettings) {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const fonts: Fonts = {
    sans: await pdf.embedFont(fromBase64(SANS_REGULAR), { subset: true }),
    sansBold: await pdf.embedFont(fromBase64(SANS_SEMIBOLD), { subset: true }),
    serif: await pdf.embedFont(fromBase64(SERIF_REGULAR), { subset: true }),
    serifItalic: await pdf.embedFont(fromBase64(SERIF_ITALIC), { subset: true }),
  }
  const label = data.kind === "quote" ? "Quote" : "Invoice"
  pdf.setTitle(`${label} ${data.number} — ${business.businessName}`)
  pdf.setAuthor(business.businessName)
  pdf.setCreator(SITE_URL)

  let page: PDFPage = pdf.addPage([PAGE.width, PAGE.height])
  let y = PAGE.height - MARGIN

  const text = (value: string, x: number, top: number, size: number, font: PDFFont, color = INK, spacing = 0) => {
    if (spacing) page.pushOperators(setCharacterSpacing(spacing))
    page.drawText(safe(value, font), { x, y: top - size, size, font, color })
    if (spacing) page.pushOperators(setCharacterSpacing(0))
  }
  const width = (value: string, size: number, font: PDFFont, spacing = 0) => font.widthOfTextAtSize(safe(value, font), size) + spacing * Math.max(0, safe(value, font).length - 1)
  const textRight = (value: string, right: number, top: number, size: number, font: PDFFont, color = INK, spacing = 0) => text(value, right - width(value, size, font, spacing), top, size, font, color, spacing)
  const hairline = (top: number, left = MARGIN, right = PAGE.width - MARGIN) => page.drawLine({ start: { x: left, y: top }, end: { x: right, y: top }, thickness: 0.6, color: HAIR })
  const kicker = (value: string, x: number, top: number, align: "left" | "right" = "left") =>
    align === "left" ? text(value.toUpperCase(), x, top, 7.5, fonts.sansBold, MUTED, 1.4) : textRight(value.toUpperCase(), x, top, 7.5, fonts.sansBold, MUTED, 1.4)

  const footer = () => {
    hairline(MARGIN + 18)
    text("Designed with intention.", MARGIN, MARGIN + 10, 11, fonts.serifItalic, MUTED)
    textRight(SITE_URL.replace(/^https?:\/\/(www\.)?/, ""), PAGE.width - MARGIN, MARGIN + 8, 8, fonts.sans, MUTED)
  }
  const newPage = () => {
    footer()
    page = pdf.addPage([PAGE.width, PAGE.height])
    y = PAGE.height - MARGIN
  }
  const ensure = (space: number) => {
    if (y - space < MARGIN + 40) newPage()
  }

  // ── Header: mark + wordmark, document title on the right
  page.drawSvgPath(BRAND_MARK_PATH, { x: MARGIN, y, scale: 0.26, color: INK })
  text("PRAJESH SHAKYA", MARGIN + 36, y - 9, 8.5, fonts.sansBold, INK, 2.2)
  textRight(label, PAGE.width - MARGIN, y + 4, 34, fonts.serif)
  textRight(data.number, PAGE.width - MARGIN, y - 36, 10, fonts.sans, SOFT)
  const statusLabel = STATUS_LABELS[data.status]
  if (["paid", "accepted", "overdue", "void", "expired"].includes(data.status)) textRight(statusLabel.toUpperCase(), PAGE.width - MARGIN, y - 52, 7.5, fonts.sansBold, data.status === "overdue" ? rgb(0.62, 0.17, 0.13) : INK, 1.4)
  y -= 78
  hairline(y)
  y -= 22

  // ── From / billed to / dates
  const column = CONTENT / 3
  const block = (title: string, lines: string[], x: number) => {
    kicker(title, x, y)
    let top = y - 16
    for (const line of lines.filter(Boolean)) {
      for (const part of wrap(line, fonts.sans, 9.5, column - 14)) {
        text(part, x, top, 9.5, fonts.sans, SOFT)
        top -= 13.5
      }
    }
    return top
  }
  const fromBottom = block("From", [business.businessName, business.tagline, business.email, business.phone, business.address, business.taxId], MARGIN)
  const toBottom = block(data.kind === "quote" ? "Prepared for" : "Billed to", [data.clientName, data.clientCompany ?? "", data.clientEmail ?? "", data.clientAddress ?? ""], MARGIN + column)
  const dates = [
    ["Issued", formatDate(data.issueDate)],
    [data.kind === "quote" ? "Valid until" : "Due", formatDate(data.dueDate)],
    ["Currency", data.currency],
  ].filter(([, value]) => value)
  let dateTop = y
  for (const [name, value] of dates) {
    kicker(name, PAGE.width - MARGIN, dateTop, "right")
    textRight(value, PAGE.width - MARGIN, dateTop - 13, 9.5, fonts.sans, INK)
    dateTop -= 32
  }
  y = Math.min(fromBottom, toBottom, dateTop) - 18

  // ── Line items
  const cols = { qty: MARGIN + CONTENT * 0.6, unit: MARGIN + CONTENT * 0.8, amount: PAGE.width - MARGIN }
  const tableHeader = () => {
    hairline(y)
    y -= 12
    kicker("Description", MARGIN, y)
    kicker("Qty", cols.qty, y, "right")
    kicker("Unit price", cols.unit, y, "right")
    kicker("Amount", cols.amount, y, "right")
    y -= 16
    hairline(y)
    y -= 12
  }
  tableHeader()
  for (const item of data.items) {
    const lines = wrap(item.description || "—", fonts.sans, 10, CONTENT * 0.6 - 64)
    const rowHeight = lines.length * 14 + 12
    if (y - rowHeight < MARGIN + 60) {
      newPage()
      tableHeader()
    }
    lines.forEach((line, index) => text(line, MARGIN, y - index * 14, 10, fonts.sans, INK))
    textRight(String(item.quantity), cols.qty, y, 10, fonts.sans, SOFT)
    textRight(formatMoney(item.unitPrice, data.currency, 2), cols.unit, y, 10, fonts.sans, SOFT)
    textRight(formatMoney(lineAmount(item), data.currency, 2), cols.amount, y, 10, fonts.sans, INK)
    y -= rowHeight
    hairline(y + 4)
  }

  // ── Totals
  const totals = documentTotals(data.items, data.taxRate)
  ensure(110)
  y -= 10
  const totalsLeft = MARGIN + CONTENT * 0.55
  const totalRow = (name: string, value: string) => {
    text(name, totalsLeft, y, 9.5, fonts.sans, SOFT)
    textRight(value, PAGE.width - MARGIN, y, 9.5, fonts.sans, INK)
    y -= 18
  }
  totalRow("Subtotal", formatMoney(totals.subtotal, data.currency, 2))
  if (data.taxRate > 0) totalRow(`${data.taxLabel || "Tax"} (${data.taxRate}%)`, formatMoney(totals.tax, data.currency, 2))
  hairline(y + 6, totalsLeft)
  y -= 6
  kicker(data.kind === "quote" ? "Total" : data.status === "paid" ? "Total paid" : "Total due", totalsLeft, y - 6)
  textRight(formatMoney(totals.total, data.currency, 2), PAGE.width - MARGIN, y + 4, 24, fonts.serif)
  y -= 44

  // ── Payment details / how to accept, and notes
  const section = (title: string, body: string) => {
    const lines = wrap(body, fonts.sans, 9.5, CONTENT)
    ensure(30 + lines.length * 13.5)
    kicker(title, MARGIN, y)
    y -= 16
    for (const line of lines) {
      if (y < MARGIN + 50) newPage()
      text(line, MARGIN, y, 9.5, fonts.sans, SOFT)
      y -= 13.5
    }
    y -= 14
  }
  const payment = business.currencies[data.currency]?.paymentInstructions?.trim()
  if (data.kind === "invoice" && data.status !== "paid") {
    if (payment) section("How to pay", payment)
    if (data.paymentLink) section("Pay online", data.paymentLink)
  }
  if (data.kind === "quote") section("To accept", `Open ${data.publicUrl} and press "Accept quote", or reply to the email this came with.`)
  if (data.notes?.trim()) section("Notes", data.notes.trim())
  if (business.footerNote?.trim()) {
    ensure(30)
    text(business.footerNote.trim(), MARGIN, y, 13, fonts.serifItalic, INK)
  }

  footer()
  return pdf.save()
}
