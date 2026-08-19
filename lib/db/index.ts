import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Next.js may evaluate the auth route during build without loading project env vars.
// The pool only opens a connection when a query is executed; production and preview
// use DATABASE_URL/POSTGRES_URL from the project environment.
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "postgresql://localhost:5432/portfolio"

export const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle(pool, { schema })
