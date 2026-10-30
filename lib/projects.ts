import type { Project } from "@/components/project-card"

export const projects: Project[] = [
  {
    slug: "aurora-wellness",
    title: "Aurora Wellness",
    subtitle: "Mindful luxury hospitality identity system & brand experience",
    category: "Brand Identity",
    year: "2024",
    client: "Aurora Wellness Co.",
    role: "Creative Director & Lead Identity Designer",
    thumbnail: "/images/projects/aurora-thumb.jpg",
    creativeFields: ["Brand Identity", "Art Direction", "Packaging", "Spatial Design"],
    tags: ["Mindfulness", "Luxury Hospitality", "Custom Wordmark", "Editorial Design"],
    toolsUsed: ["Figma", "Adobe Illustrator", "Cinema 4D", "Lightroom"],
    team: [
      { name: "Prajesh Shakya", role: "Creative Direction & Identity System" },
      { name: "Studio Senses", role: "Editorial Photography" },
      { name: "Elena Rostova", role: "Spatial Architecture" },
    ],
    analytics: {
      views: 4280,
      appreciations: 564,
      saves: 218,
      comments: 34,
    },
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
    slug: "meridian-architects",
    title: "Meridian Architects",
    subtitle: "Brand identity & digital system for sustainable architecture studio",
    category: "Visual Identity",
    year: "2024",
    client: "Meridian Architecture Studio",
    role: "Lead Brand Strategist & Designer",
    thumbnail: "/images/projects/meridian-thumb.jpg",
    creativeFields: ["Visual Identity", "UI/UX Design", "Editorial", "Typography"],
    tags: ["Architecture", "Sustainability", "Design System", "Editorial"],
    toolsUsed: ["Figma", "Adobe Illustrator", "Next.js", "After Effects"],
    analytics: {
      views: 3120,
      appreciations: 412,
      saves: 165,
      comments: 19,
    },
    overview:
      "A bold rebrand for an architectural firm specializing in sustainable design, reflecting their commitment to both innovation and environmental responsibility.",
    problem:
      "Despite award-winning sustainable projects, Meridian's brand didn't reflect their innovative approach or environmental values. They were losing opportunities to firms with stronger market presence.",
    approach:
      "We developed a brand strategy centered on their unique philosophy: that sustainable design should be beautiful, not just functional. Every element was designed to communicate this dual commitment.",
    solution:
      "A geometric identity system inspired by architectural blueprints, paired with an earthy yet sophisticated color palette. The visual language extends to environmental graphics and digital experiences.",
    outcome:
      "The rebrand positioned Meridian as thought leaders in sustainable architecture, resulting in features in 3 major architecture publications and a 60% increase in RFP invitations.",
    images: [
      "/images/projects/meridian-1.jpg",
      "/images/projects/meridian-2.jpg",
      "/images/projects/meridian-3.jpg",
      "/images/projects/meridian-4.jpg",
    ],
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
    ],
  },
  {
    slug: "nomad-coffee",
    title: "Nomad Coffee Roasters",
    subtitle: "Artisanal coffee transformation, brand strategy & packaging system",
    category: "Brand Strategy",
    year: "2023",
    client: "Nomad Coffee Co.",
    role: "Brand Strategist & Packaging Designer",
    thumbnail: "/images/projects/nomad-thumb.jpg",
    creativeFields: ["Brand Strategy", "Packaging", "Illustration", "Typography"],
    tags: ["Coffee", "Direct Trade", "Packaging System", "Retail"],
    toolsUsed: ["Adobe Illustrator", "Photoshop", "Figma"],
    analytics: {
      views: 2890,
      appreciations: 388,
      saves: 142,
      comments: 16,
    },
    overview:
      "A complete brand transformation for an artisanal coffee company, from strategy through packaging design, positioning them for national expansion.",
    problem:
      "Nomad had incredible beans with direct-trade relationships, but their homemade look prevented them from securing specialty retail shelf space.",
    approach:
      "We mapped consumer buying patterns in specialty coffee and discovered that provenance storytelling paired with bold, color-coded roast profiles creates immediate shelf recognition.",
    solution:
      "A modular packaging architecture, hand-crafted topographical linework representing origin altitudes, and an unmistakable typographic voice.",
    outcome:
      "Within 90 days, Nomad was picked up by 65 independent retailers and specialty grocers, tripling online subscription sales.",
    images: [
      "/images/projects/nomad-1.jpg",
      "/images/projects/nomad-2.jpg",
      "/images/projects/nomad-3.jpg",
      "/images/projects/nomad-4.jpg",
    ],
  },
  {
    slug: "kinetic-studio",
    title: "Kinetic Motion Studio",
    subtitle: "Dynamic visual identity & interactive web design for animation house",
    category: "Digital Product",
    year: "2023",
    client: "Kinetic Studio",
    role: "Creative Director & UI/UX Architect",
    thumbnail: "/images/projects/kinetic-thumb.jpg",
    creativeFields: ["Digital Product", "Motion Design", "UI/UX Design", "Creative Coding"],
    tags: ["Animation", "Interactive", "Dark Mode", "Web Experience"],
    toolsUsed: ["Next.js", "Figma", "After Effects", "GLSL / Three.js"],
    analytics: {
      views: 5120,
      appreciations: 710,
      saves: 345,
      comments: 48,
    },
    overview:
      "A dynamic, motion-first brand and interactive portfolio for an award-winning animation and CGI production studio.",
    problem:
      "A motion studio whose static website failed to reflect their kinetic storytelling capability.",
    approach:
      "We created a variable identity system that transforms and reacts in real-time to user scroll, cursor velocity, and sound.",
    solution:
      "A custom interactive canvas, responsive typography that stretches based on cursor physics, and micro-interactions on every transition.",
    outcome:
      "FWA of the Day winner, Awwwards Site of the Day, and a 200% influx of commercial production briefs.",
    images: [
      "/images/projects/kinetic-1.jpg",
      "/images/projects/kinetic-2.jpg",
      "/images/projects/kinetic-3.jpg",
      "/images/projects/kinetic-4.jpg",
    ],
  },
  {
    slug: "atlas-ventures",
    title: "Atlas Ventures",
    subtitle: "Founder-first venture capital brand identity and digital collateral",
    category: "Visual Systems",
    year: "2023",
    client: "Atlas Venture Partners",
    role: "Brand Consultant & Identity Designer",
    thumbnail: "/images/projects/atlas-thumb.jpg",
    creativeFields: ["Visual Systems", "Editorial", "Brand Strategy", "Typography"],
    tags: ["Venture Capital", "Fintech", "Editorial", "Monogram"],
    toolsUsed: ["Figma", "Illustrator", "InDesign"],
    analytics: {
      views: 1980,
      appreciations: 240,
      saves: 95,
      comments: 11,
    },
    overview:
      "A sophisticated brand system for a venture capital firm, positioning them as visionary partners for ambitious founders.",
    problem:
      "Atlas Ventures' previous identity was indistinguishable from hundreds of other VC firms. They needed a brand that reflected their founder-first philosophy.",
    approach:
      "We focused on genuine partnership. The brand strategy centered on navigation and guidance, positioning Atlas as trusted guides.",
    solution:
      "A bold identity featuring a custom monogram, a refined color palette, and a comprehensive design system for pitch decks and investor reports.",
    outcome:
      "The rebrand helped Atlas attract higher-quality deal flow and close their largest fund to date.",
    images: [
      "/images/projects/atlas-1.jpg",
      "/images/projects/atlas-2.jpg",
      "/images/projects/atlas-3.jpg",
      "/images/projects/atlas-4.jpg",
    ],
  },
  {
    slug: "haven-interiors",
    title: "Haven Interiors",
    subtitle: "High-end residential interior studio branding and portfolio book",
    category: "Brand Strategy",
    year: "2022",
    client: "Haven Design Studio",
    role: "Brand Designer & Art Director",
    thumbnail: "/images/projects/haven-thumb.jpg",
    creativeFields: ["Brand Strategy", "Editorial", "Art Direction"],
    tags: ["Interior Design", "Luxury", "Hardcover Monograph"],
    toolsUsed: ["Figma", "InDesign", "Photoshop"],
    analytics: {
      views: 2240,
      appreciations: 310,
      saves: 130,
      comments: 14,
    },
    overview:
      "A complete brand evolution for a residential interior design studio, elevating their presence to match the caliber of their work.",
    problem:
      "Haven't had a cohesive brand presentation to match the luxury homes they design.",
    approach:
      "We studied luxury fashion brands to communicate craft and restraint.",
    solution:
      "An elegant typographic identity with a warm, sophisticated palette, proposal books, and social guidelines.",
    outcome:
      "Haven doubled their average project value and was featured in Architectural Digest.",
    images: [
      "/images/projects/haven-1.jpg",
      "/images/projects/haven-2.jpg",
      "/images/projects/haven-3.jpg",
      "/images/projects/haven-4.jpg",
    ],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function getProjectsByCategory(category: string): Project[] {
  if (category === "All") return projects
  return projects.filter((project) =>
    project.category.toLowerCase().includes(category.toLowerCase())
  )
}
