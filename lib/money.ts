// Currencies Prajesh works in, and how amounts are written in each.
export const CURRENCIES = ["NPR", "AUD", "USD"] as const
export type Currency = (typeof CURRENCIES)[number]

export const CURRENCY_LABELS: Record<Currency, string> = { NPR: "NPR · Nepalese rupee", AUD: "AUD · Australian dollar", USD: "USD · US dollar" }

const PREFIX: Record<Currency, string> = { NPR: "NPR ", AUD: "A$", USD: "US$" }
// NPR uses lakh grouping (1,20,000), like Prajesh's rate cards.
const LOCALE: Record<Currency, string> = { NPR: "en-IN", AUD: "en-AU", USD: "en-US" }

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value)
}

// formatMoney(120000, "NPR") → "NPR 1,20,000"; formatMoney(8500, "AUD", 2) → "A$8,500.00"
export function formatMoney(amount: number, currency: Currency, decimals = 0) {
  const sign = amount < 0 ? "-" : ""
  const number = new Intl.NumberFormat(LOCALE[currency], { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Math.abs(amount))
  return `${sign}${PREFIX[currency]}${number}`
}

// Picks a currency from the visitor's time zone (Nepal → NPR, Australia → AUD, else USD).
export function guessCurrency(): Currency {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""
    if (/^Asia\/Kat(h)?mandu$/.test(zone)) return "NPR"
    if (zone.startsWith("Australia/")) return "AUD"
  } catch {}
  return "USD"
}

// Money maths in cents, so 0.1 + 0.2 problems never reach an invoice.
export const toCents = (amount: number) => Math.round((Number.isFinite(amount) ? amount : 0) * 100)
export const fromCents = (cents: number) => cents / 100
