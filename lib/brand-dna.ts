/**
 * Prajesh Shakya — Brand DNA (2026 Studio Edition)
 * Programmatic brand architecture, core purpose, voice pillars, and persona matrices.
 */

export interface BrandDnaCore {
  name: string
  canonicalUrl: string
  contactEmail: string
  monogramMark: string
  tagline: string
  manifesto: string
  purpose: string
  vision: string
  mission: string
  essence: string
  positioningStatement: string
}

export interface BrandPillar {
  title: string
  subtitle: string
  description: string
  rule: string
}

export interface TonePrinciple {
  attribute: string
  guideline: string
  sayThis: string
  notThis: string
}

export interface AudienceProfile {
  id: string
  segment: string
  archetype: string
  coreNeed: string
  painPoint: string
  transformation: string
  idealPackage: string
  representativeCaseStudy: string
}

export interface AntiPattern {
  name: string
  rationale: string
  ourStandard: string
}

export const BRAND_DNA: {
  core: BrandDnaCore
  pillars: BrandPillar[]
  tonePrinciples: TonePrinciple[]
  audiences: AudienceProfile[]
  antiPatterns: AntiPattern[]
  archetypes: {
    primary: { name: string; share: string; motto: string; description: string }
    secondary: { name: string; share: string; motto: string; description: string }
  }
} = {
  core: {
    name: "Prajesh Shakya",
    canonicalUrl: "https://www.shakyaprajesh.com.np",
    contactEmail: "prajeshshakya@gmail.com",
    monogramMark: "PS Monogram on a 45° Isometric Continuous Grid",
    tagline: "Strategy First. Meaningful Simplicity. Enduring Craft.",
    manifesto:
      "Your logo is not your brand. Build a point of view first. Then give it a face. We construct enduring brand identity systems that command category authority and compound in value over time.",
    purpose:
      "To liberate ambitious businesses from trend-chasing decoration through strategic truth, intellectual clarity, and enduring visual dignity.",
    vision:
      "A commercial landscape where brands outlast decades, and where business strategy and digital craft operate as an indivisible whole.",
    mission:
      "To partner with visionary leaders, emerging startups, and boutique enterprises to diagnose market vulnerabilities, clarify strategic positioning, and construct cohesive visual identity systems, tactile collateral, and digital environments that convert perception into commercial leverage.",
    essence: "Quiet Editorial Confidence",
    positioningStatement:
      "For ambitious founders, boutique hospitality leaders, architects, and discerning businesses who refuse to be commoditized, Prajesh Shakya is the brand identity advisory and creative studio that integrates high-rigor market strategy with gallery-grade editorial craft, delivering distinctive visual identities that command premium authority.",
  },

  archetypes: {
    primary: {
      name: "The Creator",
      share: "60%",
      motto: "If it can be imagined, it can be crafted with precision.",
      description:
        "Brings tangible form, proportion, and aesthetic distinction to complex ideas through relentless attention to detail and tactile digital craft.",
    },
    secondary: {
      name: "The Sage / The Architect",
      share: "40%",
      motto: "Truth over trend. Clarity over novelty.",
      description:
        "Diagnoses underlying market realities and architectural structures before prescribing visual solutions.",
    },
  },

  pillars: [
    {
      title: "Strategy First",
      subtitle: "The Foundation",
      description:
        "Every design decision is rooted in research, audience psychographics, and competitor sacrifice. Beautiful design without strategy is just decoration.",
      rule: "No vector is drawn without market calibration and commercial rationale.",
    },
    {
      title: "Meaningful Simplicity",
      subtitle: "The Reduction",
      description:
        "Perfection is attained not when there is nothing left to add, but when there is nothing left to take away. Removing the superfluous amplifies what matters.",
      rule: "Strip away ornamental noise to let authentic distinction resonate.",
    },
    {
      title: "Typographic Truth & Craft",
      subtitle: "The Form",
      description:
        "High-contrast editorial dialogue pairing historical serif elegance with modernist functional clarity and monospace operational precision.",
      rule: "Respect typographic hierarchy; use hairlines over synthetic drop shadows.",
    },
    {
      title: "Enduring Longevity",
      subtitle: "The Horizon",
      description:
        "Designing against ephemeral micro-trends so the brand remains as commanding ten years from now as it does on launch day.",
      rule: "Ground every system in timeless classical principles rather than software fads.",
    },
    {
      title: "True Partnership",
      subtitle: "The Relationship",
      description:
        "Direct collaboration with the principal designer. Zero junior-staff handoffs, transparent multi-currency pricing, and honest advisory at every phase.",
      rule: "Treat every project as a shared commercial and creative investment.",
    },
  ],

  tonePrinciples: [
    {
      attribute: "Quiet Editorial Conviction",
      guideline: "Speak with the measured authority of a fine monograph publisher; avoid hyperbole and excessive exclamation marks.",
      sayThis: "We construct enduring brand systems that command category authority and compound in value over time.",
      notThis: "We build super insanely cool, next-generation hype brands that crush your competitors!!!",
    },
    {
      attribute: "Lucid Simplicity",
      guideline: "Strip away corporate jargon and buzzword bloat; use definitive, plain, and elegant terms.",
      sayThis: "Aligning your strategic message across physical print, digital portals, and customer interactions.",
      notThis: "Synergizing cross-functional paradigm shifts to maximize omni-channel touchpoint velocity.",
    },
    {
      attribute: "Candid Architectural Honesty",
      guideline: "Protect client investments by challenging unproductive assumptions respectfully and offering clear strategic rationale.",
      sayThis: "Adding competing accent colors will dilute the brand's perceived value in the luxury sector; retaining monochromatic restraint preserves prestige.",
      notThis: "Whatever you like is fine with us, customer is always right!",
    },
    {
      attribute: "Materiality & Sensory Depth",
      guideline: "Use tactile language evoking paper, architecture, geometry, light, and enduring physical crafts.",
      sayThis: "Warm tactile parchment ground paired with obsidian ink rules and balanced spatial cadence.",
      notThis: "A cool modern theme with sleek widgets.",
    },
  ],

  audiences: [
    {
      id: "venture-founders",
      segment: "Venture Founders & Tech Startups (Seed to Series B)",
      archetype: "The Ambitious Builder",
      coreNeed: "Institutional gravitas, high investor conviction, and category-defining visual authority.",
      painPoint: "Our technology is cutting-edge, but our branding looks like an amateur bootstrap template.",
      transformation: "Elevated from a scrappy software tool into a high-valuation industry benchmark.",
      idealPackage: "Identity or System Package",
      representativeCaseStudy: "Atlas Ventures",
    },
    {
      id: "hospitality-luxury",
      segment: "Mindful Luxury & Boutique Hospitality",
      archetype: "The Sensory Curator",
      coreNeed: "Tactile atmosphere, spatial elegance, custom packaging, and evocative storytelling.",
      painPoint: "Our physical retreat is magical, but our digital presence fails to inspire bookings.",
      transformation: "Surging direct bookings and an international reputation for refined hospitality.",
      idealPackage: "Identity Package + Packaging Suite",
      representativeCaseStudy: "Aurora Wellness",
    },
    {
      id: "architecture-spatial",
      segment: "Architecture Studios & Sustainable Practices",
      archetype: "The Spatial Purist",
      coreNeed: "Structural grid discipline, raw material honesty, monograph publishing, and signage.",
      painPoint: "Graphic designers keep giving us flashy gradients that clash with our architectural restraint.",
      transformation: "Commanding monographs and raw materials that communicate structural discipline.",
      idealPackage: "System Package",
      representativeCaseStudy: "Meridian Architects",
    },
    {
      id: "established-rebrands",
      segment: "Established Businesses & Boutique Practices (10+ Yrs)",
      archetype: "The Evolving Institution",
      coreNeed: "Modernized digital footprint and unified brand architecture without losing historical trust.",
      painPoint: "Our brand has fragmented across decades of piecemeal collateral and looks dated.",
      transformation: "A consolidated, living design system that empowers teams to scale consistently.",
      idealPackage: "System Package",
      representativeCaseStudy: "Haven Interiors",
    },
  ],

  antiPatterns: [
    {
      name: "The 'Logo Farm' Trap",
      rationale: "Selling standalone logos without positioning or systems guarantees quick obsolescence.",
      ourStandard: "Every engagement includes strategic foundation, audience calibration, and full visual systems.",
    },
    {
      name: "Trend-Chasing Mimicry",
      rationale: "Transient aesthetic fads date rapidly and erode long-term enterprise equity.",
      ourStandard: "Ground visual systems in classical proportion, modernist typography, and honest physics.",
    },
    {
      name: "Agency Overhead Markups",
      rationale: "Clients pay astronomical sums for executive pitches while juniors do the actual production.",
      ourStandard: "Direct principal advisory from Prajesh Shakya, transparent scope, and predictable pricing.",
    },
    {
      name: "Artificial Drop Shadows",
      rationale: "Synthetic blurs create visual muddying and disguise poor spatial hierarchy.",
      ourStandard: "Clean 1px hairline rules, intentional whitespace, and typographic contrast.",
    },
  ],
}
