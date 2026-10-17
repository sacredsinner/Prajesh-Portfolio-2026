import { CURRENCIES, formatMoney, type Currency } from "@/lib/money"

// Packages and rates. These are the DEFAULTS, seeded into the database the first time the
// content studio loads; after that the live values come from Content studio → Packages
// (lib/pricing.ts). Prices are "from" amounts: AUD excludes GST, NPR excludes VAT, USD
// excludes local taxes.

export type Package = {
  id: string
  name: string
  audience: string
  timeline: string
  concepts: number
  rounds: number
  from: Record<Currency, number>
  includes: string[]
  popular?: boolean
  hidden?: boolean
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

export type Rate = { id: string; name: string; from: Record<Currency, number>; unit?: string; hidden?: boolean }

export const ADD_ONS: Rate[] = [
  { id: "add-ons-1", name: "Strategy workshop and brand platform", from: { NPR: 40000, AUD: 2500, USD: 1800 } },
  { id: "add-ons-2", name: "Logo suite only", from: { NPR: 30000, AUD: 2200, USD: 1500 } },
  { id: "add-ons-3", name: "Guidelines for an existing brand", from: { NPR: 45000, AUD: 2800, USD: 2000 } },
  { id: "add-ons-4", name: "Social template kit (12 templates)", from: { NPR: 25000, AUD: 1200, USD: 850 } },
  { id: "add-ons-5", name: "Presentation template (15 slides)", from: { NPR: 30000, AUD: 1500, USD: 1000 } },
  { id: "add-ons-6", name: "Packaging or label design", from: { NPR: 30000, AUD: 1500, USD: 1000 }, unit: "per product" },
  { id: "add-ons-7", name: "Logo animation (5 seconds)", from: { NPR: 20000, AUD: 900, USD: 650 } },
  { id: "add-ons-8", name: "Landing page, designed and built", from: { NPR: 70000, AUD: 3500, USD: 2500 } },
  { id: "add-ons-9", name: "Website up to 5 pages, designed and built", from: { NPR: 150000, AUD: 7500, USD: 5200 } },
]

export const ONGOING: Rate[] = [
  { id: "ongoing-1", name: "Retainer, 10 hours a month (3 months minimum)", from: { NPR: 25000, AUD: 1100, USD: 750 }, unit: "a month" },
  { id: "ongoing-2", name: "Hourly", from: { NPR: 3000, AUD: 120, USD: 85 }, unit: "an hour" },
  { id: "ongoing-3", name: "Day rate", from: { NPR: 20000, AUD: 900, USD: 650 }, unit: "a day" },
]

export const TAX_NOTE: Record<Currency, string> = {
  NPR: "Prices exclude VAT.",
  AUD: "Prices exclude GST.",
  USD: "Prices exclude local taxes. International transfer fees are paid by the client.",
}

// Everything the Packages editor manages, in one record.
export type Pricing = {
  intro: string
  packages: Package[]
  addOns: Rate[]
  ongoing: Rate[]
  terms: string
  taxNote: Record<Currency, string>
}

export const DEFAULT_PRICING: Pricing = {
  intro: "Every package starts with strategy and ends with an identity you can use everywhere. Prices are starting points; the proposal after our first call is exact.",
  packages: PACKAGES,
  addOns: ADD_ONS,
  ongoing: ONGOING,
  terms: "Every project starts with a free 30-minute call. You'll have a written proposal within two working days. Payment is 50% to book and 50% before final files (40 / 30 / 30 for System). Rush timelines are possible at +30%.",
  taxNote: TAX_NOTE,
}

export const visiblePackages = (pricing: Pricing) => pricing.packages.filter((item) => !item.hidden)
export const visibleRates = (rates: Rate[]) => rates.filter((item) => !item.hidden)

// Contact form choices. Budget ranges follow the visible packages' prices in each currency.
export const TIMELINE_CHOICES = ["As soon as possible", "Within a month", "1–3 months", "3+ months", "Just exploring"]
export const packageChoices = (pricing: Pricing) => [...visiblePackages(pricing).map((item) => item.name), "Something else", "Not sure yet"]
export function budgetChoices(pricing: Pricing): Record<Currency, string[]> {
  const result = {} as Record<Currency, string[]>
  for (const code of CURRENCIES) {
    const prices = [...new Set(visiblePackages(pricing).map((item) => item.from[code]).filter((n) => n > 0))].sort((a, b) => a - b)
    const label = (n: number) => formatMoney(n, code)
    const bare = (n: number) => label(n).replace(/^[^\d]*/, "")
    const choices = prices.length ? [`Under ${label(prices[0])}`, ...prices.slice(0, -1).map((n, i) => `${label(n)} – ${bare(prices[i + 1])}`), `${label(prices[prices.length - 1])}+`] : []
    result[code] = [...choices, "Not sure yet"]
  }
  return result
}

// Lines the invoice editor can add with one click.
export const rateCard = (pricing: Pricing, currency: Currency) => [
  ...visiblePackages(pricing).map((item) => ({ label: `${item.name} package`, description: `${item.name} brand identity package: ${item.includes.join(", ").toLowerCase()}.`, price: item.from[currency] })),
  ...visibleRates(pricing.addOns).map((item) => ({ label: item.name, description: item.name, price: item.from[currency] })),
  ...visibleRates(pricing.ongoing).map((item) => ({ label: `${item.name}${item.unit ? ` (${item.unit})` : ""}`, description: item.name, price: item.from[currency] })),
]
