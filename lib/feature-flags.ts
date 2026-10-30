import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { siteSettings } from "@/lib/db/schema"

export type FeatureFlags = {
  promoVideo: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  promoVideo: false,
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    await ensureSchema()
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "features"))
      .limit(1)

    if (!row?.value || typeof row.value !== "object") {
      return DEFAULT_FEATURE_FLAGS
    }

    const val = row.value as Record<string, unknown>
    return {
      promoVideo: typeof val.promoVideo === "boolean" ? val.promoVideo : DEFAULT_FEATURE_FLAGS.promoVideo,
    }
  } catch (error) {
    console.warn("[feature-flags] Database unavailable, using default fallback flags:", error)
    return DEFAULT_FEATURE_FLAGS
  }
}

export async function saveFeatureFlags(flags: Partial<FeatureFlags>): Promise<FeatureFlags> {
  await ensureSchema()
  const current = await getFeatureFlags()
  const merged: FeatureFlags = {
    ...current,
    ...flags,
  }

  await db
    .insert(siteSettings)
    .values({ key: "features", value: merged, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: merged, updatedAt: new Date() },
    })

  return merged
}
