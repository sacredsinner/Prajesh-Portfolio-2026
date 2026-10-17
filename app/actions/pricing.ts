"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth, isAdminUser } from "@/lib/auth"
import type { Pricing } from "@/lib/packages"
import { getPricing, savePricing } from "@/lib/pricing"

// A "use server" file may only export async functions (and types).

export type PricingResult = { ok: true } | { ok: false; error: string }

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

const money = z.object({ NPR: z.coerce.number().min(0), AUD: z.coerce.number().min(0), USD: z.coerce.number().min(0) })
const text = (max: number) => z.string().trim().max(max)
const rateSchema = z.object({ id: text(64).min(1), name: text(120).min(1, "Every rate needs a name."), from: money, unit: text(40).optional(), hidden: z.boolean().optional() })
const packageSchema = z.object({
  id: text(64).min(1),
  name: text(60).min(1, "Every package needs a name."),
  audience: text(200),
  timeline: text(60),
  concepts: z.coerce.number().int().min(0).max(20),
  rounds: z.coerce.number().int().min(0).max(20),
  from: money,
  includes: z.array(text(160)).max(20),
  popular: z.boolean().optional(),
  hidden: z.boolean().optional(),
})
const pricingSchema = z.object({
  intro: text(600),
  packages: z.array(packageSchema).min(1, "Keep at least one package.").max(6),
  addOns: z.array(rateSchema).max(30),
  ongoing: z.array(rateSchema).max(10),
  terms: text(1000),
  taxNote: z.object({ NPR: text(160), AUD: text(160), USD: text(160) }),
})

export async function loadPricing(): Promise<Pricing> {
  await requireAdmin()
  return getPricing()
}

// Saves the packages and refreshes /packages, /contact and the invoice rate card.
export async function updatePricing(input: unknown): Promise<PricingResult> {
  await requireAdmin()
  const parsed = pricingSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the packages and try again." }
  const names = parsed.data.packages.filter((p) => !p.hidden).map((p) => p.name.toLowerCase())
  if (new Set(names).size !== names.length) return { ok: false, error: "Two packages have the same name." }
  await savePricing({ ...parsed.data, packages: parsed.data.packages.map((p) => ({ ...p, includes: p.includes.filter(Boolean) })) })
  revalidatePath("/packages")
  revalidatePath("/contact")
  revalidatePath("/admin/invoices")
  revalidatePath("/sitemap.xml")
  return { ok: true }
}
