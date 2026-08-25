import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { pool } from "@/lib/db"
import { Resend } from "resend"

// Neon Auth stores Better Auth tables in the neon_auth schema. Keep a
// dedicated pool for auth so the app's Drizzle pool can continue using public.
const authPool = new Pool({
  // Use the unpooled connection for Better Auth's schema selection.
  connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  options: "-c search_path=neon_auth,public",
})

// Ensure every newly opened connection uses Neon Auth's schema. Some Neon
// connection strings ignore startup options, so apply it after connection too.
authPool.on("connect", (client) => {
  void client.query("SET search_path TO neon_auth, public")
})

export const ADMIN_EMAIL = "prajeshshakya@gmail.com"

export function isAdminUser(user: { email?: string | null } | null | undefined) {
  return user?.email?.trim().toLowerCase() === ADMIN_EMAIL
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const developmentOrigins = [
  "http://localhost:3000",
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
].filter(Boolean) as string[]
const productionOrigins = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
].filter(Boolean) as string[]
const origins = process.env.NODE_ENV === "development" ? developmentOrigins : productionOrigins

export const auth = betterAuth({
  database: authPool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? origins[0] ?? "http://localhost:3000",
  trustedOrigins: origins.length > 0 ? origins : ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    allowSignUp: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.error("[v0] RESEND_API_KEY is not configured for password reset")
        return
      }
      const escapeHtml = (value: string) =>
        value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;")
      const safeUrl = escapeHtml(url)
      const response = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Portfolio Admin <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your portfolio password",
        text: `Reset your password by opening this link: ${url}`,
        html: `<p>Reset your password by clicking the link below.</p><p><a href="${safeUrl}">Reset password</a></p><p>This link expires soon. If you did not request this, you can ignore this email.</p>`,
      })
      if (response.error) {
        console.error("[v0] Resend rejected password reset email", response.error)
        throw new Error("Password reset email delivery failed")
      }
    },
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  } : {}),
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  advanced: {
    database: {
      // Neon Auth uses UUID primary keys for its Better Auth tables.
      generateId: "uuid",
    },
    ...(process.env.NODE_ENV === "development" ? {
      // Required for the cross-site v0 preview iframe.
      defaultCookieAttributes: { sameSite: "none" as const, secure: true },
    } : {}),
  },
})
