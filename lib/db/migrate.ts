import "server-only"

import { pool } from "@/lib/db"

// Creates the tables and columns added after launch, the first time they're needed.
// Every statement is idempotent (IF NOT EXISTS), runs in one transaction, and is
// serialised with an advisory lock, so concurrent cold starts can't trip over each
// other. The same SQL is listed in DEPLOYMENT.md.
const STATEMENTS = [
  `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS package_interest text`,
  `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS budget text`,
  `ALTER TABLE contacts ADD COLUMN IF NOT EXISTS timeline text`,
  `CREATE TABLE IF NOT EXISTS site_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS moodboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    client_name text,
    client_email text,
    intro text,
    sections jsonb NOT NULL DEFAULT '[]'::jsonb,
    share_token text NOT NULL UNIQUE,
    shared boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'draft',
    approved_by text,
    approved_at timestamptz,
    last_viewed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS moodboard_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moodboard_id uuid NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
    author text NOT NULL,
    body text NOT NULL,
    from_client boolean NOT NULL DEFAULT true,
    kind text NOT NULL DEFAULT 'comment',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS moodboard_comments_board_idx ON moodboard_comments (moodboard_id, created_at)`,
  `ALTER TABLE moodboards ADD COLUMN IF NOT EXISTS canvas jsonb`,
  `ALTER TABLE moodboard_comments ADD COLUMN IF NOT EXISTS item_id text`,
  `CREATE TABLE IF NOT EXISTS moodboard_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moodboard_id uuid NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
    canvas jsonb NOT NULL,
    note text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS moodboard_versions_board_idx ON moodboard_versions (moodboard_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kind text NOT NULL,
    number text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'draft',
    client_name text NOT NULL,
    client_company text,
    client_email text,
    client_address text,
    currency text NOT NULL,
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    tax_label text,
    tax_rate numeric(5,2) NOT NULL DEFAULT 0,
    total numeric(14,2) NOT NULL DEFAULT 0,
    issue_date date NOT NULL,
    due_date date,
    notes text,
    payment_link text,
    public_token text NOT NULL UNIQUE,
    source_quote_id uuid,
    sent_at timestamptz,
    viewed_at timestamptz,
    accepted_at timestamptz,
    accepted_by text,
    paid_at timestamptz,
    reminded_at timestamptz,
    reminder_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
]

let ready: Promise<void> | null = null

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query("SELECT pg_advisory_xact_lock(472910385)")
    for (const statement of STATEMENTS) await client.query(statement)
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

export function ensureSchema() {
  ready ??= migrate().catch((error) => {
    ready = null // try again on the next request
    console.error("[db] Could not create the new tables", error)
    throw error
  })
  return ready
}
