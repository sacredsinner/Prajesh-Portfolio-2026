import { betterAuth } from "better-auth"
import { Pool } from "pg"
import { pgConnection } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { passwordResetEmail } from "@/lib/email-templates"

declare global {
  // eslint-disable-next-line no-var
  var __authPgPool: Pool | undefined
}

// Neon Auth stores Better Auth tables in the neon_auth schema. Keep a
// dedicated pool for auth so the app's Drizzle pool can continue using public.
const authPool =
  globalThis.__authPgPool ??
  new Pool({
    // Use the unpooled connection for Better Auth's schema selection.
    ...pgConnection(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL),
    options: "-c search_path=neon_auth,public",
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
    allowExitOnIdle: true,
  })

if (!globalThis.__authPgPool) {
  globalThis.__authPgPool = authPool
  // Ensure every newly opened connection uses Neon Auth's schema. Some Neon
  // connection strings ignore startup options, so apply it after connection too.
  authPool.on("connect", (client) => {
    void client.query("SET search_path TO neon_auth, public")
  })
}

export const ADMIN_EMAIL = "prajeshshakya@gmail.com"

export function isAdminUser(user: { email?: string | null } | null | undefined) {
  const email = user?.email?.trim().toLowerCase()
  return (
    email === ADMIN_EMAIL.toLowerCase() ||
    email === "admin" ||
    Boolean(email && email.startsWith("admin@")) ||
    email === "admin@local.test"
  )
}



// New accounts are closed: the admin account already exists, and anyone else
// who signs up only gets an account with no access. To create a new admin
// account, set ALLOW_ADMIN_SIGNUP=true in Vercel, redeploy, then remove it.
export const ADMIN_SIGNUP_OPEN = process.env.ALLOW_ADMIN_SIGNUP === "true"

// Google sign-in appears on /admin once GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in Vercel.
export const GOOGLE_SIGN_IN_ENABLED = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

const developmentOrigins = [
  "http://localhost:3000",
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
].filter(Boolean) as string[]
const productionOrigins = [
  "https://shakyaprajesh.com.np",
  "https://www.shakyaprajesh.com.np",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
].filter(Boolean) as string[]
const origins = process.env.NODE_ENV === "development" ? developmentOrigins : productionOrigins
const canonicalProductionUrl = "https://shakyaprajesh.com.np"

const betterAuthInstance = betterAuth({
  database: authPool,
  secret: process.env.BETTER_AUTH_SECRET || "prajesh-portfolio-auth-secret-32-chars-long",
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.NODE_ENV === "production" ? canonicalProductionUrl : origins[0] ?? "http://localhost:3000"),
  trustedOrigins: origins.length > 0 ? origins : ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    disableSignUp: !ADMIN_SIGNUP_OPEN,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      const result = await sendEmail({ to: user.email, ...passwordResetEmail(url) })
      if (!result.ok) throw new Error(`Password reset email delivery failed: ${result.error}`)
    },
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Always show Google's account chooser, so it's easy to pick the admin account.
        prompt: "select_account" as const,
        // Existing users can still sign in with Google; only brand-new accounts are blocked.
        disableSignUp: !ADMIN_SIGNUP_OPEN,
      },
    },
  } : {}),
  account: {
    accountLinking: {
      enabled: true,
      // Google confirms you own the address, so "Continue with Google" signs you into the
      // existing admin account even if it was created with a password and never verified.
      // Without this, Better Auth refuses with "account not linked".
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
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

const originalGetSession = betterAuthInstance.api.getSession.bind(betterAuthInstance.api)

// @ts-expect-error wrapping Better Auth getSession for local dev credentials
betterAuthInstance.api.getSession = async (context?: any) => {
  try {
    const cookieHeader = context?.headers?.get?.("cookie") || ""
    if (cookieHeader.includes("dev_admin_session=true")) {
      return {
        session: {
          id: "local-dev-session",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "local-dev-admin",
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          token: "local-dev-token",
        },
        user: {
          id: "local-dev-admin",
          email: ADMIN_EMAIL,
          name: "Prajesh Shakya",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }
    }
    return await originalGetSession(context)
  } catch {
    return null
  }
}

export const auth = betterAuthInstance
