import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"

const origins = [
  process.env.V0_RUNTIME_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? origins[0] ?? "http://localhost:3000",
  trustedOrigins: origins.length > 0 ? origins : ["http://localhost:3000"],
  emailAndPassword: { enabled: true, autoSignIn: true },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === "development" ? {
    advanced: { defaultCookieAttributes: { sameSite: "none" as const, secure: true } },
  } : {}),
})
