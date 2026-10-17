import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { siteSettings } from "@/lib/db/schema"
import type { BusinessSettings } from "@/lib/invoices"
import { CURRENCIES } from "@/lib/money"
import { CONTACT_EMAIL } from "@/lib/site"

// Details printed on quotes and invoices, edited under Invoices → Settings.
// Tax rates start at 0: only charge GST or VAT once you're registered for it.
export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "Prajesh Shakya",
  tagline: "Brand Identity Designer",
  email: CONTACT_EMAIL,
  phone: "",
  address: "Kathmandu, Nepal",
  taxId: "",
  paymentTermsDays: 14,
  quoteValidDays: 30,
  remindersEnabled: true,
  footerNote: "Thank you for your business.",
  currencies: {
    NPR: { taxLabel: "VAT", taxRate: 0, paymentInstructions: "" },
    AUD: { taxLabel: "GST", taxRate: 0, paymentInstructions: "" },
    USD: { taxLabel: "Tax", taxRate: 0, paymentInstructions: "" },
  },
}

function merge(value: unknown): BusinessSettings {
  const saved = (value && typeof value === "object" ? value : {}) as Partial<BusinessSettings>
  const currencies = { ...DEFAULT_BUSINESS_SETTINGS.currencies }
  for (const code of CURRENCIES) currencies[code] = { ...DEFAULT_BUSINESS_SETTINGS.currencies[code], ...(saved.currencies?.[code] ?? {}) }
  return { ...DEFAULT_BUSINESS_SETTINGS, ...saved, currencies }
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  await ensureSchema()
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "business")).limit(1)
  return merge(row?.value)
}

export async function saveBusinessSettings(value: BusinessSettings) {
  await ensureSchema()
  const merged = merge(value)
  await db
    .insert(siteSettings)
    .values({ key: "business", value: merged, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: merged, updatedAt: new Date() } })
  return merged
}
