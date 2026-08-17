import type { Project } from "@/components/project-card"

export const projects: Project[] = [
  {
    slug: "aurora-wellness",
    title: "Aurora Wellness",
    category: "Brand Identity",
    year: "2024",
    client: "Aurora Wellness Co.",
    thumbnail: "/images/projects/aurora-thumb.jpg",
    overview:
      "A comprehensive brand identity for a premium wellness retreat, positioning them as the leading destination for mindful luxury.",
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
  },
  {
    slug: "meridian-architects",
    title: "Meridian Architects",
    category: "Visual Identity",
    year: "2024",
    client: "Meridian Architecture Studio",
    thumbnail: "/images/projects/meridian-thumb.jpg",
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
  },
  {
    slug: "nomad-coffee",
    title: "Nomad Coffee Roasters",
    category: "Brand Strategy",
    year: "2023",
    client: "Nomad Coffee Co.",
    thumbnail: "/images/projects/nomad-thumb.jpg",
    overview:
      "A complete brand transformation for an artisanal coffee company, from strategy through packaging design, positioning them for national expansion.",
    problem:
      "Nomad Coffee had exceptional products but a fragmented brand presence. Their packaging didn't communicate quality, and they lacked a cohesive story to support wholesale expansion.",
    approach:
      "We immersed ourselves in their roasting process and sourcing philosophy to uncover authentic stories. The strategy focused on the journey—both of the beans and the people who seek them out.",
    solution:
      "A warm, travel-inspired brand identity with custom illustrations, a flexible packaging system, and a tone of voice that invites customers into the story of each origin.",
    outcome:
      "Nomad Coffee secured distribution in 200+ specialty stores within the first year and was recognized as a top emerging brand by specialty coffee associations.",
    images: [
      "/images/projects/nomad-1.jpg",
      "/images/projects/nomad-2.jpg",
      "/images/projects/nomad-3.jpg",
      "/images/projects/nomad-4.jpg",
    ],
  },
  {
    slug: "vera-skincare",
    title: "Vera Skincare",
    category: "Brand Identity",
    year: "2023",
    client: "Vera Botanicals",
    thumbnail: "/images/projects/vera-thumb.jpg",
    overview:
      "A refined brand identity for a clean beauty startup, establishing credibility and sophistication in the competitive skincare market.",
    problem:
      "As a new entrant in clean beauty, Vera needed to quickly establish trust and differentiate from both mass-market and overly clinical competitors. They needed to feel approachable yet expert.",
    approach:
      "Our research revealed that consumers want transparency without complexity. We positioned Vera as the brand that makes clean beauty simple, effective, and beautiful.",
    solution:
      "A minimalist identity with botanical-inspired details, a soft color system, and packaging that communicates purity while standing out on shelf. Every touchpoint reinforces effortless elegance.",
    outcome:
      "Vera launched to sold-out first runs and secured features in major beauty publications. Customer surveys show 89% perceive the brand as premium and trustworthy.",
    images: [
      "/images/projects/vera-1.jpg",
      "/images/projects/vera-2.jpg",
      "/images/projects/vera-3.jpg",
      "/images/projects/vera-4.jpg",
    ],
  },
  {
    slug: "atlas-ventures",
    title: "Atlas Ventures",
    category: "Visual Systems",
    year: "2023",
    client: "Atlas Venture Partners",
    thumbnail: "/images/projects/atlas-thumb.jpg",
    overview:
      "A sophisticated brand system for a venture capital firm, positioning them as visionary partners for ambitious founders.",
    problem:
      "Atlas Ventures' previous identity was indistinguishable from hundreds of other VC firms. They needed a brand that reflected their founder-first philosophy and long-term approach.",
    approach:
      "We focused on their unique value: genuine partnership. The brand strategy centered on navigation and guidance, positioning Atlas as trusted guides for founders' journeys.",
    solution:
      "A bold identity featuring a custom monogram, a refined yet confident color palette, and a comprehensive design system for pitch decks, reports, and digital platforms.",
    outcome:
      "The rebrand helped Atlas attract higher-quality deal flow and close their largest fund to date. Partners report founders now reference the brand as a factor in choosing Atlas.",
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
    category: "Brand Strategy",
    year: "2022",
    client: "Haven Design Studio",
    thumbnail: "/images/projects/haven-thumb.jpg",
    overview:
      "A complete brand evolution for a residential interior design studio, elevating their presence to match the caliber of their work.",
    problem:
      "Haven's portfolio showcased stunning work, but their brand presentation didn't match. They were competing for high-end clients with a DIY brand identity.",
    approach:
      "We studied luxury hospitality and fashion brands to understand how to communicate craft and attention to detail. The strategy focused on creating desire through restraint.",
    solution:
      "An elegant typographic identity with a warm, sophisticated palette. The system includes templates for proposals, a photography direction, and social media guidelines.",
    outcome:
      "Haven has since doubled their average project value and been featured in Architectural Digest and Elle Decor. Clients specifically mention the brand experience as exceptional.",
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
