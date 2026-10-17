import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { siteSettings } from "@/lib/db/schema"
import { CURRENCIES, type Currency } from "@/lib/money"
import { DEFAULT_PRICING, type Package, type Pricing, type Rate } from "@/lib/packages"

// Packages, add-ons and rates as edited in Content studio → Packages. Stored as one
// record in site_settings; the defaults in lib/packages.ts are used until it's saved.

const money = (value: unknown): Record<Currency, number> => {
  const out = {} as Record<Currency, number>
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>
  for (const code of CURRENCIES) out[code] = Math.max(0, Number(v[code]) || 0)
  return out
}
const rate = (r: Partial<Rate>, index: number): Rate => ({ id: r.id || `rate-${index}`, name: r.name ?? "", from: money(r.from), unit: r.unit || undefined, hidden: Boolean(r.hidden) })

function merge(value: unknown): Pricing {
  const saved = (value && typeof value === "object" ? value : {}) as Partial<Pricing>
  return {
    intro: saved.intro ?? DEFAULT_PRICING.intro,
    packages: (saved.packages ?? DEFAULT_PRICING.packages).map((p, i): Package => ({ id: p.id || `package-${i}`, name: p.name ?? "", audience: p.audience ?? "", timeline: p.timeline ?? "", concepts: Number(p.concepts) || 0, rounds: Number(p.rounds) || 0, from: money(p.from), includes: Array.isArray(p.includes) ? p.includes.filter(Boolean) : [], popular: Boolean(p.popular), hidden: Boolean(p.hidden) })),
    addOns: (saved.addOns ?? DEFAULT_PRICING.addOns).map(rate),
    ongoing: (saved.ongoing ?? DEFAULT_PRICING.ongoing).map(rate),
    terms: saved.terms ?? DEFAULT_PRICING.terms,
    taxNote: { ...DEFAULT_PRICING.taxNote, ...(saved.taxNote ?? {}) },
  }
}

export async function getPricing(): Promise<Pricing> {
  try {
    await ensureSchema()
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "pricing")).limit(1)
    return merge(row?.value)
  } catch (error) {
    console.error("[pricing] Could not load pricing, using defaults", error)
    return merge(undefined)
  }
}

export async function savePricing(value: Pricing) {
  await ensureSchema()
  const merged = merge(value)
  await db.insert(siteSettings).values({ key: "pricing", value: merged, updatedAt: new Date() }).onConflictDoUpdate({ target: siteSettings.key, set: { value: merged, updatedAt: new Date() } })
  return merged
}
