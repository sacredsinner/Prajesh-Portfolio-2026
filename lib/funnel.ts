import { CURRENCIES, formatMoney, type Currency } from "@/lib/money"
import type { Pricing } from "@/lib/packages"

export type ProjectStage = {
  id: string
  number: string
  title: string
  description: string
  recommendedPackageId?: string
}

export const PROJECT_STAGES: ProjectStage[] = [
  {
    id: "new-venture",
    number: "01",
    title: "New Venture / Founding a Brand",
    description: "Building an authentic identity from the ground up: strategy, logo suite, typography, and core collateral.",
    recommendedPackageId: "foundation",
  },
  {
    id: "rebrand",
    number: "02",
    title: "Rebrand & Repositioning",
    description: "Our current brand identity no longer reflects our scale, market maturity, pricing power, or long-term vision.",
    recommendedPackageId: "identity",
  },
  {
    id: "design-system",
    number: "03",
    title: "Design System & Scaling Collateral",
    description: "We already have brand foundations, but require scalable design systems, multi-channel templates, and deep brand guidelines.",
    recommendedPackageId: "system",
  },
  {
    id: "strategy-audit",
    number: "04",
    title: "Brand Strategy & Positioning Audit",
    description: "Clarifying our brand narrative, target audience resonance, competitor differentiation, and creative direction.",
    recommendedPackageId: "identity",
  },
]

export type DeliverableItem = {
  id: string
  title: string
  category: "Identity" | "Strategy" | "Digital" | "Print" | "Motion"
  description: string
}

export const DELIVERABLE_ITEMS: DeliverableItem[] = [
  {
    id: "visual-identity",
    title: "Core Visual Identity & Logo Suite",
    category: "Identity",
    description: "Primary mark, secondary badges, wordmark, monochrome variations, and favicon specs.",
  },
  {
    id: "brand-strategy",
    title: "Brand Strategy & Positioning Workshop",
    category: "Strategy",
    description: "Audience archetypes, competitor gap analysis, core ethos, mission, and tone of voice.",
  },
  {
    id: "brand-guidelines",
    title: "Editorial Brand Guidelines Book",
    category: "Identity",
    description: "25–40+ page specification covering grid layouts, color contrast ratios, clear space, and asset misuse.",
  },
  {
    id: "website-design",
    title: "Editorial Website / Digital Showcase",
    category: "Digital",
    description: "Next.js / Tailwind interactive web presence designed with high tactile quality and motion physics.",
  },
  {
    id: "packaging-print",
    title: "Packaging & Physical Product Collateral",
    category: "Print",
    description: "Custom dielines, product boxes, label typography, foil stamping specs, and print finishes.",
  },
  {
    id: "social-templates",
    title: "Social Media Template System",
    category: "Digital",
    description: "12+ Figma templates for Instagram carousel posts, LinkedIn thought leadership, and banner headers.",
  },
  {
    id: "motion-animation",
    title: "Kinetic Logo & Motion System",
    category: "Motion",
    description: "Smooth 60 FPS branded animation for video intros, presentations, and digital signature.",
  },
]

export type TimelineOption = {
  id: string
  title: string
  estimate: string
  description: string
}

export const TIMELINE_OPTIONS: TimelineOption[] = [
  {
    id: "urgent",
    title: "Immediate Kickoff",
    estimate: "Within 2–4 weeks",
    description: "Ready to proceed immediately with accelerated sprint cadence.",
  },
  {
    id: "standard",
    title: "Standard Pace",
    estimate: "1–2 months",
    description: "Balanced cadence allowing deliberate iteration rounds and research.",
  },
  {
    id: "planning",
    title: "Strategic Rollout",
    estimate: "2–4 months",
    description: "Planning ahead for an upcoming launch, funding round, or season.",
  },
  {
    id: "exploring",
    title: "Exploratory / Flexible",
    estimate: "Flexible",
    description: "Looking for strategic alignment, budgetary estimates, and feasibility.",
  },
]

export type IntakeFormData = {
  stage: string
  deliverables: string[]
  timeline: string
  currency: Currency
  budgetBand: string
  name: string
  email: string
  company?: string
  website?: string
  message: string
}

export function calculateRecommendation(
  stageId: string,
  deliverableIds: string[],
  pricing: Pricing,
  currency: Currency
): {
  packageName: string
  packageId: string
  startingPrice: string
  rationale: string
} {
  const isSystem =
    deliverableIds.length >= 5 ||
    stageId === "design-system" ||
    (deliverableIds.includes("brand-guidelines") && deliverableIds.includes("website-design"))

  const isFoundation =
    stageId === "new-venture" && deliverableIds.length <= 2 && !deliverableIds.includes("website-design")

  const pkg = pricing.packages.find((p) =>
    isSystem ? p.id === "system" : isFoundation ? p.id === "foundation" : p.id === "identity"
  ) ?? pricing.packages[1] ?? pricing.packages[0]

  const formattedAmount = pkg?.from?.[currency] ? formatMoney(pkg.from[currency], currency) : ""

  let rationale = `Based on your selection of ${deliverableIds.length} deliverable${deliverableIds.length === 1 ? "" : "s"}, the ${pkg?.name ?? "Identity"} package provides the ideal balance of strategic depth and production scope.`

  if (isSystem) {
    rationale = `Your project scope spans cross-platform brand touchpoints and systems. The ${pkg?.name ?? "System"} package provides an end-to-end framework with extensive support.`
  } else if (isFoundation) {
    rationale = `For early-stage ventures needing high-impact foundational assets fast, the ${pkg?.name ?? "Foundation"} package is engineered for agility.`
  }

  return {
    packageName: pkg?.name ?? "Identity",
    packageId: pkg?.id ?? "identity",
    startingPrice: formattedAmount,
    rationale,
  }
}
