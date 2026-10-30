import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Next.js may evaluate the auth route during build without loading project env vars.
// The pool only opens a connection when a query is executed; production and preview
// use DATABASE_URL/POSTGRES_URL from the project environment.
const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL_NON_POOLING

// Keep module evaluation build-safe. Vercel can evaluate route modules during
// static collection before runtime environment variables are injected.
export function pgConnection(url: string | undefined) {
  if (!url) return { connectionString: url, ssl: true as const }
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete("sslmode")
    return { connectionString: parsed.toString(), ssl: true as const }
  } catch {
    return { connectionString: url, ssl: true as const }
  }
}

// Global singleton pattern to prevent connection pool leaks across serverless
// warm invocations and Next.js hot module reloading (HMR) in development.
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
  // eslint-disable-next-line no-var
  var __drizzleDb: ReturnType<typeof drizzle> | undefined
}

export const pool =
  globalThis.__pgPool ??
  new Pool({
    ...pgConnection(connectionString ?? "postgresql://missing-database-config:5432/portfolio"),
    max: process.env.NODE_ENV === "production" ? 10 : 4,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
    allowExitOnIdle: true,
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool
}

export const db =
  globalThis.__drizzleDb ??
  drizzle(pool, { schema })

if (process.env.NODE_ENV !== "production") {
  globalThis.__drizzleDb = db
}
