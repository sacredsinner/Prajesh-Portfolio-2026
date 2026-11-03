import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { Client } from "@notionhq/client"

function text(content: string, annotations: { bold?: boolean; italic?: boolean; code?: boolean } = {}) {
  return {
    type: "text" as const,
    text: { content },
    annotations: {
      bold: annotations.bold ?? false,
      italic: annotations.italic ?? false,
      strikethrough: false,
      underline: false,
      code: annotations.code ?? false,
      color: "default" as const,
    },
  }
}

function h2(title: string) {
  return {
    object: "block" as const,
    type: "heading_2" as const,
    heading_2: {
      rich_text: [text(title)],
    },
  }
}

function h3(title: string) {
  return {
    object: "block" as const,
    type: "heading_3" as const,
    heading_3: {
      rich_text: [text(title)],
    },
  }
}

function p(content: string | ReturnType<typeof text>[]) {
  return {
    object: "block" as const,
    type: "paragraph" as const,
    paragraph: {
      rich_text: typeof content === "string" ? [text(content)] : content,
    },
  }
}

function bullet(content: string | ReturnType<typeof text>[]) {
  return {
    object: "block" as const,
    type: "bulleted_list_item" as const,
    bulleted_list_item: {
      rich_text: typeof content === "string" ? [text(content)] : content,
    },
  }
}

function numItem(content: string | ReturnType<typeof text>[]) {
  return {
    object: "block" as const,
    type: "numbered_list_item" as const,
    numbered_list_item: {
      rich_text: typeof content === "string" ? [text(content)] : content,
    },
  }
}

function callout(content: string | ReturnType<typeof text>[], emoji = "💡") {
  return {
    object: "block" as const,
    type: "callout" as const,
    callout: {
      icon: { type: "emoji" as const, emoji },
      rich_text: typeof content === "string" ? [text(content)] : content,
    },
  }
}

function code(codeStr: string, language = "plain text" as const) {
  return {
    object: "block" as const,
    type: "code" as const,
    code: {
      language,
      rich_text: [text(codeStr)],
    },
  }
}

function divider() {
  return {
    object: "block" as const,
    type: "divider" as const,
    divider: {},
  }
}

function todo(content: string, checked = false) {
  return {
    object: "block" as const,
    type: "to_do" as const,
    to_do: {
      checked,
      rich_text: [text(content)],
    },
  }
}

async function main() {
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) throw new Error("Missing NOTION_API_KEY in .env.local")

  const notion = new Client({ auth: apiKey })
  const pageId = "40d4f078-210f-81c7-b9d9-e2ec4a553674"

  console.log("Populating Brand DNA blocks into Notion page:", pageId)

  const allBlocks: any[] = [
    // Intro Callout
    callout(
      [
        text("Official Brand DNA Architecture & Strategic Identity Specification\n", { bold: true }),
        text(
          "A comprehensive blueprint codifying the core purpose, brand essence, archetype, tone of voice, visual DNA, and positioning architecture for Prajesh Shakya Studio (2026 Edition)."
        ),
      ],
      "🧬"
    ),

    divider(),

    // 1. Executive Brand Profile
    h2("1. Executive Brand Profile"),
    bullet([text("Studio Name: ", { bold: true }), text("Prajesh Shakya (Prajesh Shakya Studio)")]),
    bullet([text("Monogram Mark: ", { bold: true }), text("Interlocking 45° Isometric Continuous PS Monogram")]),
    bullet([text("Principal: ", { bold: true }), text("Prajesh Shakya")]),
    bullet([text("Discipline: ", { bold: true }), text("Brand Strategy, Visual Identity Systems, Creative Direction, Digital Craft")]),
    bullet([text("Canonical URL: ", { bold: true }), text("https://www.shakyaprajesh.com.np")]),
    bullet([text("Contact Email: ", { bold: true }), text("prajeshshakya@gmail.com")]),
    bullet([text("Scope: ", { bold: true }), text("Kathmandu, Nepal — Operating Globally (Australia, US, UK, Europe, Singapore)")]),
    bullet([text("Track Record: ", { bold: true }), text("6+ Years Industry Experience · 80+ Completed Projects · 7+ Countries Spanned")]),
    bullet([text("Core Packages: ", { bold: true }), text("Foundation (3–4 wks) · Identity (6–8 wks) · System (10–12 wks)")]),
    bullet([text("PDF Monograph: ", { bold: true }), text("A4 5-Page Monograph (Prajesh-Shakya-Brand-DNA.pdf)")]),

    divider(),

    // 2. Core Purpose, Vision & Mission
    h2("2. Core Purpose, Vision & Mission"),
    callout(
      [
        text("PURPOSE (The Why)\n", { bold: true }),
        text(
          "In an era dominated by hyper-accelerated aesthetic cycles, Canva templates, and AI-generated homogenization, most businesses mistake decorative styling for brand equity. They spend fortunes repainting surfaces while their value proposition remains indistinct.\n\n"
        ),
        text("Prajesh Shakya exists to restore gravitas, intellectual discipline, and enduring visual dignity to brand building. ", {
          bold: true,
        }),
        text("Every project begins with rigorous enquiry to unearth what is authentically true, creating identities that command authority without raising their voice."),
      ],
      "🎯"
    ),

    callout(
      [
        text("VISION (The Future We Seek)\n", { bold: true }),
        text(
          "A world where ambitious founders, independent institutions, and cultural enterprises do not need to choose between commercial efficacy and artistic distinction. We envision brands built like mid-century architecture: structurally sound, materially honest, and increasingly revered with age."
        ),
      ],
      "🔭"
    ),

    callout(
      [
        text("MISSION (What We Do Daily)\n", { bold: true }),
        text(
          "To partner with visionary leaders, emerging startups, and boutique enterprises to diagnose market vulnerabilities, clarify strategic positioning, and construct cohesive visual identity systems, tactile collateral, and digital environments that convert perception into commercial leverage."
        ),
      ],
      "⚡"
    ),

    divider(),

    // 3. Brand Essence & Positioning Architecture
    h2("3. Brand Essence & Positioning Architecture"),
    callout(
      [
        text('Brand Essence: "Quiet Editorial Confidence"\n\n', { bold: true }),
        text(
          "We do not shout. We do not employ synthetic neon accents, hyper-saturated gradients, or frantic micro-interactions to demand attention. The confidence of Prajesh Shakya is expressed through deliberate negative space, razor-sharp 1px hairlines, classical typography, and unwavering adherence to truth."
        ),
      ],
      "✨"
    ),

    h3("The Strategic Positioning Statement"),
    code(
      `FOR:        Ambitious founders, boutique hospitality leaders, architects, venture funds,
            and discerning businesses who refuse to be commoditized;
WHO NEED:   A distinctive brand identity that commands premium pricing, institutional trust,
            and immediate category recognition;
PRAJEESH:   Is the brand identity advisory and creative studio
THAT:       Integrates high-rigor market strategy with gallery-grade editorial craft;
UNLIKE:     Traditional bloated agencies (slow, junior-heavy, jargon-ridden)
            or commoditized freelancer marketplaces (decorative, superficial, trend-led);
OUR PROOF:  6+ years of specialized practice, 80+ transformed brands, proven 45%+ booking
            surges, and an open, transparent design system built for longevity.`
    ),

    h3("The Three Strategic Acid Tests"),
    bullet([
      text("1. The Sacrifice Test: ", { bold: true }),
      text(
        "Strategy is defined by what you deliberately decline to be. If a brand claims to be 'luxurious yet budget-friendly, playful yet corporate, agile yet monolithic,' it has made zero strategic choices. We force explicit sacrifice."
      ),
    ]),
    bullet([
      text("2. The Category Test: ", { bold: true }),
      text(
        "Can the client describe their unique value proposition in one sentence without relying on empty clichés like 'innovative,' 'passionate,' 'seamless,' or 'next-gen'?"
      ),
    ]),
    bullet([
      text("3. The Distinctiveness Test: ", { bold: true }),
      text(
        "If you strip away the logo mark entirely, do the typography, layout rhythm, color temperature, and voice immediately identify the brand?"
      ),
    ]),

    divider(),

    // 4. Brand Archetype & Psychological Profile
    h2("4. Brand Archetype & Psychological Profile"),
    h3("Primary Archetype: The Creator (60%)"),
    bullet([text("Motto: ", { bold: true }), text('"If it can be imagined, it can be crafted with precision."', { italic: true })]),
    bullet([
      text("Core Drive: ", { bold: true }),
      text("To give physical and digital form to abstract vision; to manifest aesthetic coherence, timeless proportion, and artisanal dignity."),
    ]),
    bullet([
      text("Shadow to Avoid: ", { bold: true }),
      text("Perfectionism that stalls execution or designing for design awards rather than commercial impact."),
    ]),

    h3("Secondary Archetype: The Sage / The Architect (40%)"),
    bullet([text("Motto: ", { bold: true }), text('"Truth over trend. Clarity over novelty."', { italic: true })]),
    bullet([
      text("Core Drive: ", { bold: true }),
      text("To understand fundamental structural principles, human psychology, and market dynamics before laying a single pixel."),
    ]),
    bullet([
      text("Role in Engagements: ", { bold: true }),
      text("An objective, strategic counsel who diagnoses before prescribing."),
    ]),

    divider(),

    // 5. Personality Spectrum & Brand Character
    h2("5. Personality Spectrum & Brand Character"),
    bullet([
      text("Quiet & Deliberate (9/10): ", { bold: true }),
      text("Generous margins, whispered kickers, parchment backgrounds over harsh pure white, no strobe effects."),
    ]),
    bullet([
      text("Strategic & Analytical (9/10): ", { bold: true }),
      text("Rooted in positioning theses, competitor mapping, and economic reality rather than personal whim."),
    ]),
    bullet([
      text("Tactile & Museum-Grade (10/10): ", { bold: true }),
      text("Obsessive kerning, calibrated 45° isometric geometry, WCAG AAA contrast ratios, fine print paper specs."),
    ]),
    bullet([
      text("Warm, Direct, Partner (8/10): ", { bold: true }),
      text("Transparent pricing tables, zero hidden agency fees, direct principal communication without account managers."),
    ]),
    bullet([
      text("Measured & Rhythmic (8/10): ", { bold: true }),
      text("Physics-based cubic-bezier easing; instant cuts for reduced motion; no gratuitous bouncing."),
    ]),

    divider(),

    // 6. Verbal Identity & Tone of Voice
    h2("6. Verbal Identity & Tone of Voice"),
    h3("Voice Principles"),
    numItem([
      text("Quiet Editorial Conviction: ", { bold: true }),
      text("Speak with the quiet authority of an established monograph publisher. Avoid superlatives, exclamation points, and hyperbole.\n"),
      text("• Say: ", { bold: true }),
      text('"We construct enduring brand systems that command category authority and compound in value over time."\n'),
      text("• Reject: ", { bold: true }),
      text('"We build super insanely cool, next-generation hype brands that crush your competitors!!!"', { italic: true }),
    ]),
    numItem([
      text("Lucid Simplicity (No Corporate Jargon): ", { bold: true }),
      text("Strip away the hollow jargon that agencies hide behind. Use plain, elegant, and definitive language.\n"),
      text("• Say: ", { bold: true }),
      text('"Aligning your strategic message across physical print, digital portals, and customer interactions."\n'),
      text("• Reject: ", { bold: true }),
      text('"Synergizing cross-functional paradigm shifts to maximize omni-channel touchpoint velocity."', { italic: true }),
    ]),
    numItem([
      text("Candid Architectural Honesty: ", { bold: true }),
      text("Be willing to tell the client what will not work. A true strategic partner protects the client's business from expensive mistakes.\n"),
      text("• Say: ", { bold: true }),
      text('"Adding competing accent colors will dilute perceived value in the luxury sector; retaining monochromatic restraint preserves prestige."\n'),
      text("• Reject: ", { bold: true }),
      text('"Whatever you like is fine with us, customer is always right!"', { italic: true }),
    ]),
    numItem([
      text("Materiality & Sensory Depth: ", { bold: true }),
      text(
        "Use sensory words evoking craftsmanship, texture, architecture, and enduring materials: Parchment, obsidian, hairline, cadence, architectural, tactile, proportion, ballast, clarity, restraint, legacy, monograph."
      ),
    ]),

    divider(),

    // 7. The Five Core Brand Pillars
    h2("7. The Five Core Brand Pillars"),
    callout(
      [
        text("1. Strategy First\n", { bold: true }),
        text(
          "Design without strategy is superficial decoration. Every mark, color swatch, and structural grid is informed by competitive whitespace, audience psychographics, and business economics. Rule: No vector is drawn without market calibration."
        ),
      ],
      "🏛️"
    ),
    callout(
      [
        text("2. Meaningful Simplicity\n", { bold: true }),
        text(
          "Perfection is attained not when there is nothing left to add, but when there is nothing left to take away. We strip away ornamental noise so the authentic character of the brand can resonate without obstruction."
        ),
      ],
      "⚖️"
    ),
    callout(
      [
        text("3. Typographic Truth & Digital Craft\n", { bold: true }),
        text(
          "Typography is the voice of the mind made visible. By pairing the literary grace of Instrument Serif with the modernist utility of Instrument Sans and the operational rigor of Geist Mono, we build visual hierarchies that convey intellectual substance."
        ),
      ],
      "✒️"
    ),
    callout(
      [
        text("4. Enduring Longevity\n", { bold: true }),
        text(
          "Trends age like milk; enduring systems age like granite. We build brands meant to look as commanding ten years from now as they do on launch day."
        ),
      ],
      "⏳"
    ),
    callout(
      [
        text("5. True Partnership & Radical Transparency\n", { bold: true }),
        text(
          "Clients never speak to an account coordinator or junior intern. They work directly with Prajesh Shakya. We provide transparent package pricing, clear milestone deliverables, and honest guidance at every phase."
        ),
      ],
      "🤝"
    ),

    divider(),

    // 8. Target Audience Personas
    h2("8. Target Audience Personas & Empathy Matrix"),
    callout(
      [
        text("Profile 1: The Tech / Venture Founder (Atlas Ventures)\n", { bold: true }),
        text("• Core Need: Institutional gravitas, investor conviction, and category-defining visual authority.\n"),
        text("• Pain Point: 'Our technology is cutting-edge, but our branding looks like an amateur bootstrap template.'\n"),
        text("• Transformation: Elevated from a scrappy software tool into a high-valuation industry benchmark.\n"),
        text("• Recommended Package: Identity or System Package."),
      ],
      "🚀"
    ),

    callout(
      [
        text("Profile 2: The Mindful Luxury / Hospitality Operator (Aurora Wellness)\n", { bold: true }),
        text("• Core Need: Tactile atmosphere, spatial elegance, custom packaging, and evocative storytelling.\n"),
        text("• Pain Point: 'Our physical retreat is breathtaking, but our digital presence fails to inspire bookings.'\n"),
        text("• Transformation: 45%+ surge in direct bookings and an international reputation for mindful luxury.\n"),
        text("• Recommended Package: Identity Package + Packaging Suite."),
      ],
      "🌿"
    ),

    callout(
      [
        text("Profile 3: The Architecture & Spatial Principal (Meridian Architects)\n", { bold: true }),
        text("• Core Need: Structural grid discipline, raw material honesty, monograph publishing, and signage.\n"),
        text("• Pain Point: 'Graphic designers keep giving us flashy gradients that clash with our architectural restraint.'\n"),
        text("• Transformation: Phaidon-grade project monographs and blackened-steel signage systems.\n"),
        text("• Recommended Package: System Package."),
      ],
      "📐"
    ),

    callout(
      [
        text("Profile 4: The Established Rebrand Leader (Haven Interiors)\n", { bold: true }),
        text("• Core Need: Modernized digital footprint and unified brand architecture without losing historical trust.\n"),
        text("• Pain Point: 'Our brand has fragmented across decades of piecemeal collateral and looks dated.'\n"),
        text("• Transformation: A consolidated, living design system that empowers teams to scale consistently.\n"),
        text("• Recommended Package: System Package."),
      ],
      "🏛️"
    ),

    divider(),

    // 9. Visual Identity DNA
    h2("9. Visual Identity DNA"),
    bullet([
      text("Ground (#F5F5F3): ", { bold: true }),
      text("Warm tactile parchment canvas conveying physical paper, humanism, and gallery wall serenity."),
    ]),
    bullet([
      text("Ink (#1B1A16): ", { bold: true }),
      text("Deep obsidian carbon conveying permanence, authority, and WCAG AAA readability (14.2:1)."),
    ]),
    bullet([
      text("Ink Soft (#45443D): ", { bold: true }),
      text("Charcoal half-tone for comfortable long-form reading contrast."),
    ]),
    bullet([
      text("Hairline (#D9D7CD): ", { bold: true }),
      text("1px crisp boundary defining structure with quiet restraint rather than heavy dropped shadows."),
    ]),
    bullet([
      text("The PS Monogram: ", { bold: true }),
      text("Constructed on a strict 45° isometric diamond grid, representing the continuous loop between Positioning ('P') and System ('S')."),
    ]),

    divider(),

    // 10. The Client Experience Journey
    h2("10. The Client Experience Journey & Studio Rituals"),
    numItem([text("Phase 1: Immersion & Diagnosis — ", { bold: true }), text("30-Min Discovery Call · Questionnaire · Competitor Landscape Audit")]),
    numItem([text("Phase 2: The Strategic Platform — ", { bold: true }), text("Brand Platform Monograph · Audience Archetype · Positioning Thesis")]),
    numItem([text("Phase 3: Visual Identity Exploration — ", { bold: true }), text("2–3 Divergent Holistic Concepts · Interactive Moodboards (/m/[token])")]),
    numItem([text("Phase 4: Refinement & Systematization — ", { bold: true }), text("Collaborative Pinpoint Feedback · Token Calibration · Application Tests")]),
    numItem([text("Phase 5: Handover & Guardianship — ", { bold: true }), text("Vector Suite Delivery · 25–40pg Brand Guidelines · Launch Kit · 30-Day Support")]),

    divider(),

    // 11. Strategic Anti-Patterns
    h2("11. Strategic Anti-Patterns (What We Deliberately Reject)"),
    bullet([
      text("[X] The 'Logo Farm' Trap: ", { bold: true }),
      text("We reject selling standalone logos; every engagement includes strategy and complete visual systems."),
    ]),
    bullet([
      text("[X] Trend-Chasing Mimicry: ", { bold: true }),
      text("We ground visual systems in classical proportion and modernist typography rather than fleeting software fads."),
    ]),
    bullet([
      text("[X] Agency Overhead Markups: ", { bold: true }),
      text("Direct principal advisory from Prajesh Shakya, transparent scope, and predictable multi-currency pricing."),
    ]),
    bullet([
      text("[X] Artificial Drop Shadows: ", { bold: true }),
      text("Clean 1px hairline rules, intentional whitespace, and typographic contrast create authentic depth."),
    ]),

    divider(),

    // 12. Living Brand Checklist
    h2("12. Living Brand Verification Checklist"),
    todo("Does this deliverable lead with an undeniable strategic perspective?"),
    todo("Is it typeset in Instrument Serif, Instrument Sans, or Geist Mono?"),
    todo("Does it honor the Ground (#F5F5F3) and Ink (#1B1A16) palette?"),
    todo("Does it favor 1px hairline dividers over synthetic dropped shadows?"),
    todo("Is the verbal cadence calm, lucid, confident, and free of hype?"),
    todo("Does it reflect the 45° isometric discipline of the PS Monogram?"),

    divider(),

    p([
      text("Prajesh Shakya Studio · Kathmandu, Nepal & Worldwide\n", { bold: true }),
      text("Website: https://www.shakyaprajesh.com.np · Email: prajeshshakya@gmail.com\n"),
      text("Classification: Official Brand DNA Specification (2026 Edition)", { italic: true }),
    ]),
  ]

  console.log(`Total blocks to append: ${allBlocks.length}`)

  // Batch append in chunks of 50 to stay within Notion's limit of 100 blocks per request
  const CHUNK_SIZE = 50
  for (let i = 0; i < allBlocks.length; i += CHUNK_SIZE) {
    const chunk = allBlocks.slice(i, i + CHUNK_SIZE)
    console.log(`Appending batch ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} blocks)...`)
    await notion.blocks.children.append({
      block_id: pageId,
      children: chunk,
    })
    // Brief sleep to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 350))
  }

  console.log("Successfully copied complete Brand DNA into Notion page!")
  console.log(`Notion Page URL: https://app.notion.com/p/Prajesh-Shakya-Brand-DNA-Strategic-Identity-Manual-${pageId.replace(/-/g, "")}`)
}

main().catch(console.error)
