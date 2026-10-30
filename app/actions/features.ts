"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth, isAdminUser } from "@/lib/auth"
import { getFeatureFlags, saveFeatureFlags, type FeatureFlags } from "@/lib/feature-flags"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

export async function getFeaturesAction(): Promise<FeatureFlags> {
  await requireAdmin()
  return getFeatureFlags()
}

export async function setFeatureFlagAction(
  key: keyof FeatureFlags,
  enabled: boolean,
): Promise<{ ok: true; flags: FeatureFlags } | { ok: false; error: string }> {
  try {
    await requireAdmin()
    const flags = await saveFeatureFlags({ [key]: enabled })
    revalidatePath("/", "layout")
    revalidatePath("/promo")
    return { ok: true, flags }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update feature flag" }
  }
}
