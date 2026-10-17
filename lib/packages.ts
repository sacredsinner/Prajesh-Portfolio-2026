import type { Currency } from "@/lib/money"

// Packages and rates, from "Prajesh Shakya - Pitch, Process and Pricing" (October 2026).
// Prices are "from" amounts: AUD excludes GST, NPR excludes VAT, USD excludes local taxes.

export type PackageId = "foundation" | "identity" | "system"

export type Package = {
  id: PackageId
  name: string
  audience: string
  timeline: string
  concepts: number
  rounds: number
  from: Record<Currency, number>
  includes: string[]
  popular?: boolean
}

export const PACKAGES: Package[] = [
  {
    id: "foundation",
    name: "Foundation",
    audience: "New businesses that need to start right.",
    timeline: "3–4 weeks",
    concepts: 2,
    rounds: 2,
    from: { NPR: 50000, AUD: 3500, USD: 2500 },
    includes: ["Questionnaire and 60-minute kickoff", "Competitor snapshot", "Logo suite", "Colour and typography", "10-page brand essentials guide", "Business card and social profile kit"],
  },
  {
    id: "identity",
    name: "Identity",
    audience: "Growing businesses ready to be recognised.",
    timeline: "6–8 weeks",
    concepts: 3,
    rounds: 3,
    from: { NPR: 120000, AUD: 8500, USD: 6000 },
    includes: ["90-minute strategy workshop", "Audience and market research", "Brand platform", "Complete visual identity", "25–30-page brand guidelines", "Up to 6 applications", "Handover call"],
    popular: true,
  },
  {
    id: "system",
    name: "System",
    audience: "Established brands and rebrands that need to scale.",
    timeline: "10–12 weeks",
    concepts: 3,
    rounds: 3,
    from: { NPR: 250000, AUD: 16000, USD: 11000 },
    includes: ["Stakeholder interviews and brand audit", "Full strategy and tone of voice", "Tagline", "Identity with logo animation", "40+ page brand book", "Up to 15 applications and templates", "Launch kit", "30 days of support after launch"],
  },
]

export type Rate = { name: string; from: Record<Currency, number>; unit?: string }

export const ADD_ONS: Rate[] = [
  { name: "Strategy workshop and brand platform", from: { NPR: 40000, AUD: 2500, USD: 1800 } },
  { name: "Logo suite only", from: { NPR: 30000, AUD: 2200, USD: 1500 } },
  { name: "Guidelines for an existing brand", from: { NPR: 45000, AUD: 2800, USD: 2000 } },
  { name: "Social template kit (12 templates)", from: { NPR: 25000, AUD: 1200, USD: 850 } },
  { name: "Presentation template (15 slides)", from: { NPR: 30000, AUD: 1500, USD: 1000 } },
  { name: "Packaging or label design", from: { NPR: 30000, AUD: 1500, USD: 1000 }, unit: "per product" },
  { name: "Logo animation (5 seconds)", from: { NPR: 20000, AUD: 900, USD: 650 } },
  { name: "Landing page, designed and built", from: { NPR: 70000, AUD: 3500, USD: 2500 } },
  { name: "Website up to 5 pages, designed and built", from: { NPR: 150000, AUD: 7500, USD: 5200 } },
]

export const ONGOING: Rate[] = [
  { name: "Retainer, 10 hours a month (3 months minimum)", from: { NPR: 25000, AUD: 1100, USD: 750 }, unit: "a month" },
  { name: "Hourly", from: { NPR: 3000, AUD: 120, USD: 85 }, unit: "an hour" },
  { name: "Day rate", from: { NPR: 20000, AUD: 900, USD: 650 }, unit: "a day" },
]

export const TAX_NOTE: Record<Currency, string> = {
  NPR: "Prices exclude VAT.",
  AUD: "Prices exclude GST.",
  USD: "Prices exclude local taxes. International transfer fees are paid by the client.",
}

// Contact form choices. Budget ranges follow the package prices in each currency.
export const PACKAGE_CHOICES = ["Foundation", "Identity", "System", "Something else", "Not sure yet"]
export const TIMELINE_CHOICES = ["As soon as possible", "Within a month", "1–3 months", "3+ months", "Just exploring"]
export const BUDGET_CHOICES: Record<Currency, string[]> = {
  NPR: ["Under NPR 50,000", "NPR 50,000 – 1,20,000", "NPR 1,20,000 – 2,50,000", "NPR 2,50,000+", "Not sure yet"],
  AUD: ["Under A$3,500", "A$3,500 – 8,500", "A$8,500 – 16,000", "A$16,000+", "Not sure yet"],
  USD: ["Under US$2,500", "US$2,500 – 6,000", "US$6,000 – 11,000", "US$11,000+", "Not sure yet"],
}
