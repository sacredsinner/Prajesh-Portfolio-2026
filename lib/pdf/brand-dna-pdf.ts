import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, rgb, setCharacterSpacing, type PDFFont, type PDFPage } from "pdf-lib"
import { BRAND_MARK_PATH } from "@/components/brand-mark"
import { SANS_REGULAR, SANS_SEMIBOLD, SERIF_ITALIC, SERIF_REGULAR } from "@/lib/pdf/fonts"
import { BRAND_DNA } from "@/lib/brand-dna"
import { SITE_URL } from "@/lib/site"

// Prajesh Shakya Brand DNA — Strategic Identity Manual PDF (A4 5-Page Monograph)
// Warm parchment Ground (#F5F5F3), obsidian Ink (#1B1A16), 1px hairlines.

const PAGE = { width: 595.28, height: 841.89 }
const MARGIN = 48
const CONTENT = PAGE.width - MARGIN * 2

const GROUND = rgb(245 / 255, 245 / 255, 243 / 255)
const CARD_BG = rgb(236 / 255, 235 / 255, 229 / 255)
const INK = rgb(27 / 255, 26 / 255, 22 / 255)
const SOFT = rgb(69 / 255, 68 / 255, 61 / 255)
const MUTED = rgb(111 / 255, 109 / 255, 99 / 255)
const HAIR = rgb(217 / 255, 215 / 255, 205 / 255)
const ACCENT = rgb(36 / 255, 71 / 255, 255 / 255)

type Fonts = {
  sans: PDFFont
  sansBold: PDFFont
  serif: PDFFont
  serifItalic: PDFFont
}

const fromBase64 = (value: string) => Uint8Array.from(Buffer.from(value, "base64"))

const FONT_BUFFERS = {
  sans: fromBase64(SANS_REGULAR),
  sansBold: fromBase64(SANS_SEMIBOLD),
  serif: fromBase64(SERIF_REGULAR),
  serifItalic: fromBase64(SERIF_ITALIC),
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!paragraph.trim()) {
      lines.push("")
      continue
    }
    let line = ""
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(next, size) <= width) {
        line = next
      } else {
        if (line) lines.push(line)
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

const characterSets = new WeakMap<PDFFont, Set<number>>()
function safe(text: string, font: PDFFont): string {
  let supported = characterSets.get(font)
  if (!supported) {
    supported = new Set(font.getCharacterSet())
    characterSets.set(font, supported)
  }
  return [...text.replace(/\t/g, " ")]
    .map((char) => {
      const code = char.codePointAt(0) ?? 0
      return supported.has(code) ? char : " "
    })
    .join("")
}

export async function buildBrandDnaPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)

  const fonts: Fonts = {
    sans: await pdf.embedFont(FONT_BUFFERS.sans, { subset: true }),
    sansBold: await pdf.embedFont(FONT_BUFFERS.sansBold, { subset: true }),
    serif: await pdf.embedFont(FONT_BUFFERS.serif, { subset: true }),
    serifItalic: await pdf.embedFont(FONT_BUFFERS.serifItalic, { subset: true }),
  }

  pdf.setTitle("Brand DNA Architecture — Prajesh Shakya")
  pdf.setAuthor("Prajesh Shakya")
  pdf.setSubject("Official Brand DNA Manual & Strategic Identity Specification")
  pdf.setCreator(SITE_URL)
  pdf.setKeywords(["Brand DNA", "Strategy", "Identity", "Design System", "Editorial"])

  const TOTAL_PAGES = 5

  const createPage = () => {
    const p = pdf.addPage([PAGE.width, PAGE.height])
    p.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE.width,
      height: PAGE.height,
      color: GROUND,
    })
    return p
  }

  const drawText = (
    page: PDFPage,
    value: string,
    x: number,
    top: number,
    size: number,
    font: PDFFont,
    color = INK,
    spacing = 0
  ) => {
    if (spacing) page.pushOperators(setCharacterSpacing(spacing))
    page.drawText(safe(value, font), { x, y: top - size, size, font, color })
    if (spacing) page.pushOperators(setCharacterSpacing(0))
  }

  const textWidth = (value: string, size: number, font: PDFFont, spacing = 0) =>
    font.widthOfTextAtSize(safe(value, font), size) +
    spacing * Math.max(0, safe(value, font).length - 1)

  const drawTextRight = (
    page: PDFPage,
    value: string,
    right: number,
    top: number,
    size: number,
    font: PDFFont,
    color = INK,
    spacing = 0
  ) => {
    const w = textWidth(value, size, font, spacing)
    drawText(page, value, right - w, top, size, font, color, spacing)
  }

  const drawTextCenter = (
    page: PDFPage,
    value: string,
    centerX: number,
    top: number,
    size: number,
    font: PDFFont,
    color = INK,
    spacing = 0
  ) => {
    const w = textWidth(value, size, font, spacing)
    drawText(page, value, centerX - w / 2, top, size, font, color, spacing)
  }

  const drawHairline = (
    page: PDFPage,
    top: number,
    left = MARGIN,
    right = PAGE.width - MARGIN,
    color = HAIR
  ) => {
    page.drawLine({
      start: { x: left, y: top },
      end: { x: right, y: top },
      thickness: 0.6,
      color,
    })
  }

  const drawKicker = (
    page: PDFPage,
    value: string,
    x: number,
    top: number,
    color = MUTED
  ) => {
    drawText(page, value.toUpperCase(), x, top, 7.5, fonts.sansBold, color, 1.8)
  }

  const drawHeader = (page: PDFPage, sectionTitle: string) => {
    drawText(page, "PRAJESH SHAKYA", MARGIN, PAGE.height - 36, 7.5, fonts.sansBold, INK, 1.8)
    drawTextRight(
      page,
      sectionTitle.toUpperCase(),
      PAGE.width - MARGIN,
      PAGE.height - 36,
      7.5,
      fonts.sansBold,
      MUTED,
      1.2
    )
    drawHairline(page, PAGE.height - 46)
  }

  const drawFooter = (page: PDFPage, pageNum: number) => {
    drawHairline(page, 44)
    drawText(page, "Designed with intention.", MARGIN, 34, 9, fonts.serifItalic, MUTED)
    drawTextCenter(
      page,
      `Prajesh Shakya Studio · 2026 Edition`,
      PAGE.width / 2,
      34,
      7.5,
      fonts.sans,
      MUTED
    )
    drawTextRight(
      page,
      `${pageNum} of ${TOTAL_PAGES}`,
      PAGE.width - MARGIN,
      34,
      8,
      fonts.sansBold,
      INK
    )
  }

  // ==========================================
  // PAGE 1: COVER
  // ==========================================
  {
    const page = createPage()

    // Outer framing hairline
    page.drawRectangle({
      x: MARGIN - 12,
      y: MARGIN - 12,
      width: CONTENT + 24,
      height: PAGE.height - MARGIN * 2 + 24,
      borderWidth: 0.6,
      borderColor: HAIR,
      color: GROUND,
    })

    // Inner top kicker
    drawKicker(page, "STUDIO SPECIFICATION · 2026 EDITION", MARGIN + 12, PAGE.height - MARGIN - 12)
    drawTextRight(
      page,
      "OFFICIAL STANDARD",
      PAGE.width - MARGIN - 12,
      PAGE.height - MARGIN - 12,
      7.5,
      fonts.sansBold,
      MUTED,
      1.4
    )
    drawHairline(page, PAGE.height - MARGIN - 26, MARGIN + 12, PAGE.width - MARGIN - 12)

    // Monogram Mark in center-upper
    const markScale = 0.55
    const markSize = 100 * markScale
    const markX = (PAGE.width - markSize) / 2
    const markY = PAGE.height - 230
    page.drawSvgPath(BRAND_MARK_PATH, {
      x: markX,
      y: markY,
      scale: markScale,
      color: INK,
    })

    // Wordmark below monogram
    drawTextCenter(page, "PRAJESH SHAKYA", PAGE.width / 2, markY - markSize - 28, 11, fonts.sansBold, INK, 3.2)

    // Hero titles
    let y = markY - markSize - 80
    drawTextCenter(page, "Brand DNA", PAGE.width / 2, y, 46, fonts.serif, INK)
    y -= 44
    drawTextCenter(
      page,
      "Strategic Identity & Architectural Manual",
      PAGE.width / 2,
      y,
      16,
      fonts.serifItalic,
      SOFT
    )

    y -= 36
    drawHairline(page, y, PAGE.width / 2 - 80, PAGE.width / 2 + 80, HAIR)

    // Quote Block
    y -= 36
    const quote = `"Your logo is not your brand. Build a point of view first. Then give it a face."`
    const quoteLines = wrap(quote, fonts.serifItalic, 13, CONTENT - 80)
    for (const qLine of quoteLines) {
      drawTextCenter(page, qLine, PAGE.width / 2, y, 13, fonts.serifItalic, INK)
      y -= 20
    }

    // Bottom metadata card
    const metaBottom = MARGIN + 20
    const metaHeight = 64
    page.drawRectangle({
      x: MARGIN + 12,
      y: metaBottom,
      width: CONTENT - 24,
      height: metaHeight,
      color: CARD_BG,
      borderWidth: 0.6,
      borderColor: HAIR,
    })

    const colW = (CONTENT - 24) / 4
    const metaCols = [
      { label: "Principal", val: "Prajesh Shakya" },
      { label: "Discipline", val: "Brand Strategy & Craft" },
      { label: "Location", val: "Kathmandu · Global" },
      { label: "Web Portal", val: "shakyaprajesh.com.np" },
    ]

    metaCols.forEach((col, idx) => {
      const colX = MARGIN + 24 + idx * colW
      drawKicker(page, col.label, colX, metaBottom + metaHeight - 14)
      drawText(page, col.val, colX, metaBottom + metaHeight - 34, 9, fonts.sansBold, INK)
    })
  }

  // ==========================================
  // PAGE 2: EXECUTIVE PROFILE & STRATEGIC TRIAD
  // ==========================================
  {
    const page = createPage()
    drawHeader(page, "Section 01 · Executive Profile & Strategic Triad")
    drawFooter(page, 2)

    let y = PAGE.height - 68

    // Section Title
    drawKicker(page, "01. OVERVIEW & TRACK RECORD", MARGIN, y)
    y -= 14
    drawText(page, "The Studio Foundation", MARGIN, y, 22, fonts.serif, INK)
    y -= 28

    // 3 Stat Cards
    const cardWidth = (CONTENT - 16) / 3
    const cardHeight = 54
    const stats = [
      { num: "6+ Years", label: "Industry Practice", sub: "Since 2018 in specialized brand identity" },
      { num: "80+ Projects", label: "Completed Globally", sub: "Startups, hospitality, architecture & VC" },
      { num: "7+ Countries", label: "Geographic Reach", sub: "Australia, USA, UK, Europe, Nepal" },
    ]

    stats.forEach((st, idx) => {
      const cx = MARGIN + idx * (cardWidth + 8)
      page.drawRectangle({
        x: cx,
        y: y - cardHeight,
        width: cardWidth,
        height: cardHeight,
        color: CARD_BG,
        borderWidth: 0.6,
        borderColor: HAIR,
      })
      drawText(page, st.num, cx + 12, y - 10, 16, fonts.serif, INK)
      drawText(page, st.label, cx + 12, y - 30, 8.5, fonts.sansBold, INK)
      drawText(page, st.sub, cx + 12, y - 42, 7.5, fonts.sans, MUTED)
    })

    y -= cardHeight + 24
    drawHairline(page, y)
    y -= 20

    // Section 02: Strategic Triad
    drawKicker(page, "02. THE STRATEGIC TRIAD", MARGIN, y)
    y -= 14
    drawText(page, "Purpose, Vision & Daily Mission", MARGIN, y, 20, fonts.serif, INK)
    y -= 24

    const triad = [
      {
        tag: "PURPOSE",
        subtitle: "The Philosophical Why",
        desc: BRAND_DNA.core.purpose,
      },
      {
        tag: "VISION",
        subtitle: "The 10-Year Horizon",
        desc: BRAND_DNA.core.vision,
      },
      {
        tag: "MISSION",
        subtitle: "The Commercial Practice",
        desc: BRAND_DNA.core.mission,
      },
    ]

    triad.forEach((t) => {
      const boxH = 68
      page.drawRectangle({
        x: MARGIN,
        y: y - boxH,
        width: CONTENT,
        height: boxH,
        color: CARD_BG,
        borderWidth: 0.6,
        borderColor: HAIR,
      })

      // Left column tag
      drawKicker(page, t.tag, MARGIN + 14, y - 14, INK)
      drawText(page, t.subtitle, MARGIN + 14, y - 32, 8.5, fonts.serifItalic, MUTED)

      // Right column text
      const bodyW = CONTENT - 140
      const lines = wrap(t.desc, fonts.sans, 8.5, bodyW)
      let textY = y - 14
      for (const line of lines) {
        drawText(page, line, MARGIN + 130, textY, 8.5, fonts.sans, SOFT)
        textY -= 13
      }

      y -= boxH + 12
    })

    y -= 10
    drawHairline(page, y)
    y -= 20

    // Essence & Positioning
    drawKicker(page, "03. BRAND ESSENCE & POSITIONING", MARGIN, y)
    y -= 14
    drawText(page, "Quiet Editorial Confidence", MARGIN, y, 18, fonts.serif, INK)
    y -= 20

    const posLines = wrap(BRAND_DNA.core.positioningStatement, fonts.sans, 9, CONTENT)
    for (const pl of posLines) {
      drawText(page, pl, MARGIN, y, 9, fonts.sans, SOFT)
      y -= 14
    }
  }

  // ==========================================
  // PAGE 3: STRATEGIC ACID TESTS & ARCHETYPE
  // ==========================================
  {
    const page = createPage()
    drawHeader(page, "Section 02 · Strategic Acid Tests & Psychological Profile")
    drawFooter(page, 3)

    let y = PAGE.height - 68

    drawKicker(page, "04. THE THREE ACID TESTS", MARGIN, y)
    y -= 14
    drawText(page, "The Strategic Gatekeepers", MARGIN, y, 22, fonts.serif, INK)
    y -= 16

    const intro =
      "Before any concept, wordmark, or palette is approved for a client or our own studio, it must pass three non-negotiable strategic hurdles:"
    for (const line of wrap(intro, fonts.sans, 9, CONTENT)) {
      drawText(page, line, MARGIN, y, 9, fonts.sans, SOFT)
      y -= 13
    }
    y -= 12

    const tests = [
      {
        num: "01",
        title: "The Sacrifice Test",
        rule: "Strategy is defined by what you refuse to be.",
        desc: "If a brand attempts to appeal to every demographic simultaneously, it has made zero strategic choices. We force explicit sacrifice of secondary markets to dominate the core.",
      },
      {
        num: "02",
        title: "The Category Test",
        rule: "Elimination of hollow corporate jargon.",
        desc: "The client must articulate their distinct competitive advantage in one sentence without relying on empty clichés like 'innovative', 'passionate', 'seamless', or 'next-gen'.",
      },
      {
        num: "03",
        title: "The Distinctiveness Test",
        rule: "Total identity without the mark.",
        desc: "If the logo is stripped away, the typography, color temperature, layout rhythm, and voice must still immediately identify the brand to its audience.",
      },
    ]

    tests.forEach((t) => {
      const boxH = 58
      page.drawRectangle({
        x: MARGIN,
        y: y - boxH,
        width: CONTENT,
        height: boxH,
        color: CARD_BG,
        borderWidth: 0.6,
        borderColor: HAIR,
      })

      drawText(page, t.num, MARGIN + 14, y - 16, 20, fonts.serif, INK)
      drawText(page, t.title, MARGIN + 52, y - 12, 11, fonts.sansBold, INK)
      drawText(page, t.rule, MARGIN + 52, y - 27, 8.5, fonts.serifItalic, MUTED)

      const descLines = wrap(t.desc, fonts.sans, 8, CONTENT - 70)
      let dy = y - 40
      for (const dl of descLines) {
        drawText(page, dl, MARGIN + 52, dy, 8, fonts.sans, SOFT)
        dy -= 11.5
      }

      y -= boxH + 10
    })

    y -= 12
    drawHairline(page, y)
    y -= 20

    // Archetype Profile
    drawKicker(page, "05. BRAND ARCHETYPE & CHARACTER", MARGIN, y)
    y -= 14
    drawText(page, "The Creator-Sage Synthesis", MARGIN, y, 20, fonts.serif, INK)
    y -= 22

    const halfW = (CONTENT - 12) / 2
    const archH = 100

    // Creator Box
    page.drawRectangle({
      x: MARGIN,
      y: y - archH,
      width: halfW,
      height: archH,
      color: CARD_BG,
      borderWidth: 0.6,
      borderColor: HAIR,
    })
    drawKicker(page, "PRIMARY ARCHETYPE (60%)", MARGIN + 12, y - 12, INK)
    drawText(page, "The Creator", MARGIN + 12, y - 30, 16, fonts.serif, INK)
    drawText(page, `"${BRAND_DNA.archetypes.primary.motto}"`, MARGIN + 12, y - 48, 8, fonts.serifItalic, MUTED)
    const creatorLines = wrap(BRAND_DNA.archetypes.primary.description, fonts.sans, 8, halfW - 24)
    let cty = y - 62
    for (const cl of creatorLines) {
      drawText(page, cl, MARGIN + 12, cty, 8, fonts.sans, SOFT)
      cty -= 12
    }

    // Sage Box
    page.drawRectangle({
      x: MARGIN + halfW + 12,
      y: y - archH,
      width: halfW,
      height: archH,
      color: CARD_BG,
      borderWidth: 0.6,
      borderColor: HAIR,
    })
    drawKicker(page, "SECONDARY ARCHETYPE (40%)", MARGIN + halfW + 24, y - 12, INK)
    drawText(page, "The Sage / Architect", MARGIN + halfW + 24, y - 30, 16, fonts.serif, INK)
    drawText(page, `"${BRAND_DNA.archetypes.secondary.motto}"`, MARGIN + halfW + 24, y - 48, 8, fonts.serifItalic, MUTED)
    const sageLines = wrap(BRAND_DNA.archetypes.secondary.description, fonts.sans, 8, halfW - 24)
    let sty = y - 62
    for (const sl of sageLines) {
      drawText(page, sl, MARGIN + halfW + 24, sty, 8, fonts.sans, SOFT)
      sty -= 12
    }

    y -= archH + 20
    drawHairline(page, y)
    y -= 16

    // Personality Table
    drawKicker(page, "PERSONALITY SPECTRUM", MARGIN, y)
    y -= 14

    const spectrum = [
      ["Quiet over Loud", "Generous whitespace, tactile parchment, no fluorescent neon gimmicks."],
      ["Strategic over Decorative", "Every stroke and token backed by a commercial thesis."],
      ["Artisanal over Industrial", "Museum-grade typography and print specs over templated layouts."],
      ["Direct over Corporate", "Direct principal advisory without account coordinators or jargon."],
    ]

    spectrum.forEach(([trait, desc]) => {
      drawText(page, trait, MARGIN, y, 9, fonts.sansBold, INK)
      drawText(page, desc, MARGIN + 150, y, 8.5, fonts.sans, SOFT)
      y -= 15
    })
  }

  // ==========================================
  // PAGE 4: CORE PILLARS & VERBAL IDENTITY
  // ==========================================
  {
    const page = createPage()
    drawHeader(page, "Section 03 · Core Brand Pillars & Verbal Identity")
    drawFooter(page, 4)

    let y = PAGE.height - 68

    drawKicker(page, "06. THE FIVE BRAND PILLARS", MARGIN, y)
    y -= 14
    drawText(page, "The Tenets of Brand Equity", MARGIN, y, 22, fonts.serif, INK)
    y -= 22

    BRAND_DNA.pillars.forEach((pillar, idx) => {
      const pH = 44
      page.drawRectangle({
        x: MARGIN,
        y: y - pH,
        width: CONTENT,
        height: pH,
        color: CARD_BG,
        borderWidth: 0.6,
        borderColor: HAIR,
      })

      drawText(page, `0${idx + 1}`, MARGIN + 12, y - 14, 13, fonts.serif, INK)
      drawText(page, pillar.title, MARGIN + 38, y - 12, 10, fonts.sansBold, INK)
      drawText(page, pillar.subtitle.toUpperCase(), MARGIN + 38, y - 27, 7, fonts.sansBold, MUTED, 1.2)

      const pDescLines = wrap(pillar.description, fonts.sans, 8, CONTENT - 190)
      let pdy = y - 12
      for (const pdl of pDescLines) {
        drawText(page, pdl, MARGIN + 180, pdy, 8, fonts.sans, SOFT)
        pdy -= 11.5
      }

      y -= pH + 8
    })

    y -= 12
    drawHairline(page, y)
    y -= 20

    // Verbal Identity
    drawKicker(page, "07. VERBAL IDENTITY & TONE OF VOICE", MARGIN, y)
    y -= 14
    drawText(page, "How We Speak (and What We Reject)", MARGIN, y, 20, fonts.serif, INK)
    y -= 18

    // Tone Principles Table Header
    page.drawRectangle({
      x: MARGIN,
      y: y - 18,
      width: CONTENT,
      height: 18,
      color: INK,
    })
    drawText(page, "PRINCIPLE", MARGIN + 10, y - 5, 7.5, fonts.sansBold, GROUND, 1.2)
    drawText(page, "WHAT WE SAY", MARGIN + 120, y - 5, 7.5, fonts.sansBold, GROUND, 1.2)
    drawText(page, "WHAT WE REJECT", MARGIN + 310, y - 5, 7.5, fonts.sansBold, GROUND, 1.2)
    y -= 24

    BRAND_DNA.tonePrinciples.forEach((tp) => {
      const rowH = 46
      page.drawRectangle({
        x: MARGIN,
        y: y - rowH,
        width: CONTENT,
        height: rowH,
        color: CARD_BG,
        borderWidth: 0.6,
        borderColor: HAIR,
      })

      drawText(page, tp.attribute, MARGIN + 10, y - 14, 8.5, fonts.sansBold, INK)

      const sayLines = wrap(tp.sayThis, fonts.sans, 7.5, 175)
      let sy = y - 12
      for (const sl of sayLines) {
        drawText(page, sl, MARGIN + 120, sy, 7.5, fonts.sans, INK)
        sy -= 10.5
      }

      const notLines = wrap(tp.notThis, fonts.sans, 7.5, 170)
      let ny = y - 12
      for (const nl of notLines) {
        drawText(page, nl, MARGIN + 310, ny, 7.5, fonts.serifItalic, MUTED)
        ny -= 10.5
      }

      y -= rowH + 6
    })
  }

  // ==========================================
  // PAGE 5: AUDIENCES, ANTI-PATTERNS & CHECKLIST
  // ==========================================
  {
    const page = createPage()
    drawHeader(page, "Section 04 · Audiences, Anti-Patterns & Living Checklist")
    drawFooter(page, 5)

    let y = PAGE.height - 68

    drawKicker(page, "08. CLIENT AUDIENCE ARCHETYPES", MARGIN, y)
    y -= 14
    drawText(page, "Core Client Personas & Transformation", MARGIN, y, 22, fonts.serif, INK)
    y -= 20

    const audCardW = (CONTENT - 12) / 2
    const audCardH = 74

    BRAND_DNA.audiences.forEach((aud, idx) => {
      const row = Math.floor(idx / 2)
      const col = idx % 2
      const ax = MARGIN + col * (audCardW + 12)
      const ay = y - row * (audCardH + 8)

      page.drawRectangle({
        x: ax,
        y: ay - audCardH,
        width: audCardW,
        height: audCardH,
        color: CARD_BG,
        borderWidth: 0.6,
        borderColor: HAIR,
      })

      drawKicker(page, `PROFILE 0${idx + 1} · ${aud.representativeCaseStudy.toUpperCase()}`, ax + 10, ay - 10)
      drawText(page, aud.segment.slice(0, 36), ax + 10, ay - 24, 8.5, fonts.sansBold, INK)

      const pLines = wrap(`Core Need: ${aud.coreNeed}`, fonts.sans, 7.5, audCardW - 20)
      let py = ay - 38
      for (const pl of pLines.slice(0, 2)) {
        drawText(page, pl, ax + 10, py, 7.5, fonts.sans, SOFT)
        py -= 10.5
      }

      drawText(page, `Package: ${aud.idealPackage}`, ax + 10, ay - 64, 7.5, fonts.sansBold, MUTED)
    })

    y -= 2 * (audCardH + 8) + 12
    drawHairline(page, y)
    y -= 18

    // Strategic Anti-Patterns
    drawKicker(page, "09. STRATEGIC ANTI-PATTERNS", MARGIN, y)
    y -= 14
    drawText(page, "What We Deliberately Reject", MARGIN, y, 18, fonts.serif, INK)
    y -= 16

    const antiW = (CONTENT - 12) / 2
    const antiH = 46

    BRAND_DNA.antiPatterns.forEach((anti, idx) => {
      const row = Math.floor(idx / 2)
      const col = idx % 2
      const ax = MARGIN + col * (antiW + 12)
      const ay = y - row * (antiH + 6)

      page.drawRectangle({
        x: ax,
        y: ay - antiH,
        width: antiW,
        height: antiH,
        color: CARD_BG,
        borderWidth: 0.6,
        borderColor: HAIR,
      })

      drawText(page, `[X]  ${anti.name}`, ax + 10, ay - 10, 8.5, fonts.sansBold, INK)
      const rLines = wrap(anti.ourStandard, fonts.sans, 7.5, antiW - 20)
      let ry = ay - 24
      for (const rl of rLines.slice(0, 2)) {
        drawText(page, rl, ax + 10, ry, 7.5, fonts.sans, SOFT)
        ry -= 10
      }
    })

    y -= 2 * (antiH + 6) + 16
    drawHairline(page, y)
    y -= 16

    // Living Brand Checklist
    drawKicker(page, "10. LIVING BRAND VERIFICATION CHECKLIST", MARGIN, y)
    y -= 16

    const checklist = [
      "Does this deliverable lead with an undeniable strategic perspective?",
      "Is it typeset in Instrument Serif, Instrument Sans, or Geist Mono?",
      "Does it honor the Ground (#F5F5F3) and Ink (#1B1A16) palette?",
      "Does it favor 1px hairline dividers over synthetic dropped shadows?",
      "Is the verbal cadence calm, lucid, confident, and free of hype?",
      "Does it reflect the 45° isometric discipline of the PS Monogram?",
    ]

    const checkColW = (CONTENT - 12) / 2
    checklist.forEach((item, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const cx = MARGIN + col * (checkColW + 12)
      const cy = y - row * 16

      drawText(page, "[✓]", cx, cy, 8, fonts.sansBold, INK)
      drawText(page, item, cx + 18, cy, 7.5, fonts.sans, SOFT)
    })

    y -= 3 * 16 + 18
    drawHairline(page, y)
    y -= 14

    // Colophon
    drawText(
      page,
      "PRAJESH SHAKYA STUDIO · KATHMANDU, NEPAL & WORLDWIDE",
      MARGIN,
      y,
      7.5,
      fonts.sansBold,
      INK,
      1.5
    )
    drawTextRight(
      page,
      "prajeshshakya@gmail.com · shakyaprajesh.com.np",
      PAGE.width - MARGIN,
      y,
      7.5,
      fonts.sans,
      MUTED
    )
  }

  return await pdf.save()
}
