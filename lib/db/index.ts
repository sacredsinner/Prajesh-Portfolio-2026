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
// static collection before runtime environment variables are injected. The
// placeholder never connects successfully; production requests use the real
// integration-provided connection string above.
export const pool = new Pool({
  connectionString: connectionString ?? "postgresql://missing-database-config:5432/portfolio",
  max: 5,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle(pool, { schema })
