import type { ProjectBlock, ProjectCoverCrop, ProjectTeamMember, ProjectAnalytics } from "@/lib/project-editor-types"

export interface DemoProject {
  slug: string
  title: string
  subtitle: string
  status: "published" | "draft" | "scheduled"
  category: string
  year: string
  thumbnail: string
  coverCrop?: ProjectCoverCrop | null
  client: string
  role: string
  overview: string
  problem: string
  approach: string
  solution: string
  outcome: string
  images: string[]
  creativeFields: string[]
  tags: string[]
  toolsUsed: string[]
  team: ProjectTeamMember[]
  industries: string[]
  featured: boolean
  seoTitle: string
  seoDescription: string
  analytics: ProjectAnalytics
  blocks: ProjectBlock[]
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    slug: "aurora-wellness",
    title: "Aurora Wellness",
    subtitle: "Mindful luxury hospitality identity system & brand experience",
    status: "published",
    category: "Brand Identity",
    year: "2024",
    thumbnail: "/images/projects/aurora-thumb.jpg",
    client: "Aurora Wellness Co.",
    role: "Creative Director & Lead Identity Designer",
    overview:
      "A comprehensive brand identity for a premium wellness retreat, positioning them as the leading destination for mindful luxury in the Himalayas and beyond.",
    problem:
      "Aurora Wellness was struggling to differentiate themselves in an oversaturated wellness market. Their existing brand felt generic and failed to communicate the unique, transformative experiences they offered.",
    approach:
      "We conducted extensive market research and stakeholder interviews to understand what made Aurora truly special. The strategy focused on the intersection of luxury hospitality and authentic mindfulness practices.",
    solution:
      "A refined visual identity system featuring a custom wordmark, earthy color palette inspired by natural elements, and a photography direction that captures genuine moments of transformation.",
    outcome:
      "Within 6 months of launch, Aurora saw a 45% increase in direct bookings and successfully attracted a higher-value clientele aligned with their premium positioning.",
    images: [
      "/images/projects/aurora-1.jpg",
      "/images/projects/aurora-2.jpg",
      "/images/projects/aurora-3.jpg",
      "/images/projects/aurora-4.jpg",
    ],
    creativeFields: ["Brand Identity", "Art Direction", "Packaging", "Spatial Design"],
    tags: ["Mindfulness", "Luxury Hospitality", "Custom Wordmark", "Editorial Design"],
    toolsUsed: ["Figma", "Adobe Illustrator", "Cinema 4D", "Lightroom"],
    team: [
      { name: "Prajesh Shakya", role: "Creative Direction & Identity System" },
      { name: "Studio Senses", role: "Editorial Photography" },
      { name: "Elena Rostova", role: "Spatial Architecture" },
    ],
    industries: ["Hospitality", "Wellness", "Luxury Goods"],
    featured: true,
    seoTitle: "Aurora Wellness — Luxury Retreat Identity & Experience",
    seoDescription: "Brand identity, packaging, and spatial art direction for Aurora Wellness Himalayan retreat.",
    analytics: {
      views: 4280,
      appreciations: 564,
      saves: 218,
      comments: 34,
    },
    blocks: [
      {
        id: "intro-narrative",
        type: "text",
        content:
          "<p>Rooted in high-altitude serenity and contemporary architectural restraint, <strong>Aurora Wellness</strong> bridges ancient contemplative Himalayan wisdom with international luxury standards.</p><p>Every brand contact point—from printed stationery on tactile cotton rag paper to custom stone room keys—was designed to evoke silence, groundedness, and intentionality.</p>",
        align: "left",
        fontSize: "lg",
        width: "boxed",
      },
      {
        id: "hero-photo",
        type: "full-width-image",
        url: "/images/projects/aurora-1.jpg",
        caption: "Architectural alignment and visual harmony in the retreat's primary meditation pavilion.",
      },
      {
        id: "heading-concept",
        type: "heading",
        level: 2,
        content: "The Visual System & Typography",
        subtitle: "A balanced harmony of custom high-contrast serif letterforms and minimalist geometric sans.",
        align: "left",
        width: "boxed",
      },
      {
        id: "packaging-grid",
        type: "image-grid",
        columns: 2,
        width: "wide",
        images: [
          {
            id: "grid-1",
            url: "/images/projects/aurora-2.jpg",
            caption: "Custom apothecary glass vessels and tactile hot-stamped botanical paper labels.",
          },
          {
            id: "grid-2",
            url: "/images/projects/aurora-3.jpg",
            caption: "Printed editorial guest journals with blind embossed typography.",
          },
        ],
      },
      {
        id: "quote-client",
        type: "quote",
        quote:
          "Prajesh didn't just build a brand identity; he gave physical form to the feeling our guests remember for the rest of their lives. Bookings grew 45% and our international recognition surged.",
        citation: "Kavita Sharma",
        role: "Founder & Managing Director, Aurora Wellness",
        width: "boxed",
      },
      {
        id: "before-after-brand",
        type: "before-after",
        beforeUrl: "/images/projects/aurora-4.jpg",
        afterUrl: "/images/projects/aurora-1.jpg",
        beforeLabel: "Original Identity (2020)",
        afterLabel: "Modern Redesign (2024)",
        initialPosition: 50,
        width: "wide",
      },
    ],
  },
  {
    slug: "atlas-ventures",
    title: "Atlas Ventures",
    subtitle: "Founder-first venture capital brand identity and digital collateral",
    status: "published",
    category: "Visual Systems",
    year: "2024",
    thumbnail: "/images/projects/atlas-thumb.jpg",
    client: "Atlas Venture Partners",
    role: "Brand Consultant & Identity Designer",
    overview:
      "A sophisticated brand system for a venture capital firm, positioning them as visionary partners for ambitious founders across frontier technology and sustainable commerce.",
    problem:
      "Atlas Ventures' previous identity was indistinguishable from conventional institutional finance firms. They needed a brand that reflected their founder-first philosophy, technological rigor, and modern global presence.",
    approach:
      "We focused on the metaphor of navigation, cartography, and steadfast guidance. The visual architecture pairs classical editorial prestige with modern fintech precision.",
    solution:
      "A bold identity featuring a custom geometric monogram, an editorial color palette of deep obsidian and warm alabaster, and comprehensive design systems for pitch decks and investor monographs.",
    outcome:
      "The rebrand helped Atlas attract higher-quality founder deal flow, closed their largest fund to date ($120M), and received international design recognition.",
    images: [
      "/images/projects/atlas-1.jpg",
      "/images/projects/atlas-2.jpg",
      "/images/projects/atlas-3.jpg",
      "/images/projects/atlas-4.jpg",
    ],
    creativeFields: ["Visual Systems", "Editorial", "Brand Strategy", "Typography"],
    tags: ["Venture Capital", "Fintech", "Editorial", "Monogram"],
    toolsUsed: ["Figma", "Illustrator", "InDesign", "After Effects"],
    team: [
      { name: "Prajesh Shakya", role: "Identity Architecture & Art Direction" },
      { name: "David Chen", role: "Digital Product Strategy" },
    ],
    industries: ["Venture Capital", "Finance", "Technology"],
    featured: true,
    seoTitle: "Atlas Ventures — Brand Identity for Modern Venture Capital",
    seoDescription: "Complete corporate identity, monogram, and typography system designed for Atlas Ventures.",
    analytics: {
      views: 3820,
      appreciations: 490,
      saves: 195,
      comments: 28,
    },
    blocks: [
      {
        id: "atlas-intro",
        type: "text",
        content:
          "<p>Venture capital is entering an era of founder autonomy. For <strong>Atlas Ventures</strong>, we created a brand language that strips away corporate opacity in favor of bold architectural clarity and editorial gravitas.</p>",
        align: "left",
        fontSize: "lg",
        width: "boxed",
      },
      {
        id: "atlas-hero",
        type: "full-width-image",
        url: "/images/projects/atlas-1.jpg",
        caption: "Hero monogram mark and bespoke typography applied to institutional fund collateral.",
      },
      {
        id: "atlas-heading",
        type: "heading",
        level: 2,
        content: "Precision Monogram & Collateral Architecture",
        subtitle: "A geometric seal engineered to scale from mobile app icons to debossed leather investor dossiers.",
        align: "left",
        width: "boxed",
      },
      {
        id: "atlas-grid",
        type: "image-grid",
        columns: 2,
        width: "wide",
        images: [
          {
            id: "atlas-g1",
            url: "/images/projects/atlas-2.jpg",
            caption: "Annual fund review hardcover monograph with foil-stamped typography.",
          },
          {
            id: "atlas-g2",
            url: "/images/projects/atlas-3.jpg",
            caption: "Founder onboarding collateral and engraved metal member accreditation cards.",
          },
        ],
      },
      {
        id: "atlas-quote",
        type: "quote",
        quote:
          "The identity immediately commands respect in boardroom presentations while feeling authentic and approachable to technical founders.",
        citation: "Julian Vance",
        role: "Managing Partner, Atlas Ventures",
        width: "boxed",
      },
      {
        id: "atlas-final",
        type: "image",
        url: "/images/projects/atlas-4.jpg",
        caption: "Digital responsive design system applied across web and mobile founder portals.",
        width: "wide",
      },
    ],
  },
  {
    slug: "meridian-architects",
    title: "Meridian Architects",
    subtitle: "Brand identity & digital system for sustainable architecture studio",
    status: "published",
    category: "Visual Identity",
    year: "2024",
    thumbnail: "/images/projects/meridian-thumb.jpg",
    client: "Meridian Architecture Studio",
    role: "Lead Brand Strategist & Designer",
    overview:
      "A bold rebrand for an architectural firm specializing in sustainable residential and cultural structures, reflecting their commitment to environmental responsibility and raw material honesty.",
    problem:
      "Despite winning prestigious architectural competitions, Meridian's brand identity failed to communicate their progressive sustainable vision, causing them to lose proposals to larger international firms.",
    approach:
      "We developed a brand strategy centered on architectural rhythm, structural honesty, and tactile materials. The identity uses blueprint-inspired modular grids and sustainable print specs.",
    solution:
      "A geometric identity system paired with an earthy, mineral color palette. The visual language extends from project monograph books to laser-etched raw steel studio signage.",
    outcome:
      "The studio saw a 60% increase in high-budget RFP invitations, was featured in Architectural Record, and established themselves as thought leaders in green building.",
    images: [
      "/images/projects/meridian-1.jpg",
      "/images/projects/meridian-2.jpg",
      "/images/projects/meridian-3.jpg",
      "/images/projects/meridian-4.jpg",
    ],
    creativeFields: ["Visual Identity", "UI/UX Design", "Editorial", "Spatial Signage"],
    tags: ["Architecture", "Sustainability", "Design System", "Editorial"],
    toolsUsed: ["Figma", "Adobe Illustrator", "Next.js", "After Effects"],
    team: [
      { name: "Prajesh Shakya", role: "Brand Identity & Strategy" },
      { name: "Marcus Vance", role: "Principal Architect" },
    ],
    industries: ["Architecture", "Urban Planning", "Sustainability"],
    featured: false,
    seoTitle: "Meridian Architects — Sustainable Architectural Identity",
    seoDescription: "Brand identity and monograph design system for sustainable architecture studio Meridian.",
    analytics: {
      views: 3120,
      appreciations: 412,
      saves: 165,
      comments: 19,
    },
    blocks: [
      {
        id: "meridian-intro",
        type: "text",
        content:
          "<p>Sustainable architecture doesn't have to look clinical. For <strong>Meridian</strong>, we developed an identity anchored in structural rhythm, raw architectural honesty, and meticulous geometric precision.</p>",
        align: "left",
        fontSize: "lg",
        width: "boxed",
      },
      {
        id: "meridian-grid",
        type: "image-grid",
        columns: 2,
        width: "wide",
        images: [
          {
            id: "m-1",
            url: "/images/projects/meridian-1.jpg",
            caption: "Grid-based blueprint system applied to project monographs.",
          },
          {
            id: "m-2",
            url: "/images/projects/meridian-2.jpg",
            caption: "Signage system constructed from recycled blackened steel.",
          },
        ],
      },
      {
        id: "meridian-quote",
        type: "quote",
        quote:
          "The identity communicates the structural discipline and environmental poetry of our buildings before a client even visits our studio.",
        citation: "Marcus Vance",
        role: "Principal Architect, Meridian",
        width: "boxed",
      },
      {
        id: "meridian-detail",
        type: "image",
        url: "/images/projects/meridian-3.jpg",
        caption: "Tactile foil-stamped business stationary on FSC-certified raw unbleached card.",
        width: "wide",
      },
    ],
  },
  {
    slug: "haven-interiors",
    title: "Haven Interiors",
    subtitle: "High-end residential interior studio branding and portfolio monograph",
    status: "published",
    category: "Brand Strategy",
    year: "2023",
    thumbnail: "/images/projects/haven-thumb.jpg",
    client: "Haven Design Studio",
    role: "Brand Designer & Art Director",
    overview:
      "A complete brand evolution for a residential interior design studio, elevating their presentation to match the quiet luxury and artisanal craftsmanship of their homes.",
    problem:
      "Haven had built some of the most stunning bespoke residences in the region, but their portfolio presentation was fragmented and lacked the bespoke, tactile elegance of their physical work.",
    approach:
      "We studied European luxury fashion and boutique publishing houses to establish a sense of spatial cadence, tactile paper stock, and quiet restraint.",
    solution:
      "An elegant typographic identity with a warm stone and linen palette, accompanied by custom hardcover client presentation books, debossed linen portfolios, and digital case studies.",
    outcome:
      "Haven doubled their average project contract value within 12 months, received a double-page spread in Architectural Digest, and attracted ultra-high-net-worth residential commissions.",
    images: [
      "/images/projects/haven-1.jpg",
      "/images/projects/haven-2.jpg",
      "/images/projects/haven-3.jpg",
      "/images/projects/haven-4.jpg",
    ],
    creativeFields: ["Brand Strategy", "Editorial", "Art Direction", "Print Production"],
    tags: ["Interior Design", "Luxury Hospitality", "Hardcover Monograph"],
    toolsUsed: ["Figma", "InDesign", "Photoshop", "Lightroom"],
    team: [
      { name: "Prajesh Shakya", role: "Creative Direction & Book Design" },
      { name: "Sarah Jenkins", role: "Interior Stylist" },
    ],
    industries: ["Interior Design", "Luxury Real Estate", "Fine Art"],
    featured: false,
    seoTitle: "Haven Interiors — Luxury Residential Design Branding",
    seoDescription: "Editorial branding, monograph, and art direction for Haven Interior Design Studio.",
    analytics: {
      views: 2750,
      appreciations: 340,
      saves: 152,
      comments: 18,
    },
    blocks: [
      {
        id: "haven-intro",
        type: "text",
        content:
          "<p>Interior spaces are felt before they are understood. For <strong>Haven Interiors</strong>, the brand system had to evoke the same tactile pleasure as hand-troweled plaster, French limestone, and aged bronze.</p>",
        align: "left",
        fontSize: "lg",
        width: "boxed",
      },
      {
        id: "haven-hero",
        type: "full-width-image",
        url: "/images/projects/haven-1.jpg",
        caption: "Bespoke identity debossed into natural Belgian linen client presentation portfolios.",
      },
      {
        id: "haven-heading",
        type: "heading",
        level: 2,
        content: "Quiet Luxury in Print & Digital",
        subtitle: "Minimal typography, generous whitespace, and material integrity.",
        align: "left",
        width: "boxed",
      },
      {
        id: "haven-grid",
        type: "image-grid",
        columns: 2,
        width: "wide",
        images: [
          {
            id: "haven-g1",
            url: "/images/projects/haven-2.jpg",
            caption: "Custom material sample presentation boxes and finish specifications.",
          },
          {
            id: "haven-g2",
            url: "/images/projects/haven-3.jpg",
            caption: "Hardcover studio monograph documenting residential commissions.",
          },
        ],
      },
      {
        id: "haven-quote",
        type: "quote",
        quote:
          "Our clients invest millions into their private homes; our new branding finally communicates the discernment and caliber they expect.",
        citation: "Sarah Jenkins",
        role: "Principal Designer, Haven Interiors",
        width: "boxed",
      },
    ],
  },
]
