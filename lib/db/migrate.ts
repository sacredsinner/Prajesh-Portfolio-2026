import "server-only"

import { pool } from "@/lib/db"

// Creates the tables, columns, and indexes added after launch, the first time they're needed.
// Every statement is idempotent (IF NOT EXISTS), runs in a single batched transaction, and is
// serialised with an advisory lock, so concurrent cold starts cannot trip over each other.
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
  `CREATE TABLE IF NOT EXISTS newsletter_issues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject text NOT NULL,
    preview_text text,
    heading text,
    body text NOT NULL DEFAULT '',
    image_url text,
    cta_label text,
    cta_url text,
    note_id uuid,
    status text NOT NULL DEFAULT 'draft',
    broadcast_id text,
    recipient_count integer,
    scheduled_at timestamptz,
    sent_at timestamptz,
    error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS newsletter_issues_note_idx ON newsletter_issues (note_id)`,
  `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    email text PRIMARY KEY,
    first_name text,
    last_name text,
    source text NOT NULL DEFAULT 'website',
    status text NOT NULL DEFAULT 'subscribed',
    confirmed_at timestamptz NOT NULL DEFAULT now(),
    synced_at timestamptz,
    sync_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    category text NOT NULL,
    year text NOT NULL,
    thumbnail text NOT NULL,
    client text,
    overview text,
    problem text,
    approach text,
    solution text,
    outcome text,
    images jsonb NOT NULL DEFAULT '[]'::jsonb,
    featured boolean NOT NULL DEFAULT false,
    seo_title text,
    seo_description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS subtitle text`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS scheduled_at timestamptz`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS role text`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS creative_fields jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS tools_used jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS team jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS industries jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS license text`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS copyright text`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS blocks jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS assets jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS analytics jsonb NOT NULL DEFAULT '{"views":0,"appreciations":0,"saves":0,"comments":0}'::jsonb`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS og_image text`,
  `ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_crop jsonb`,
  // High-performance composite indexes for instant lookups
  `CREATE INDEX IF NOT EXISTS idx_projects_status_featured ON projects (status, featured DESC, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (published, featured DESC, published_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_status_kind ON invoices (status, kind, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials (published, featured DESC, sort_order ASC)`,
]

let isSchemaEnsured = false
let migrationPromise: Promise<void> | null = null

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query("SELECT pg_advisory_xact_lock(472910385)")
    // Execute all statements in a single multi-statement batch to eliminate network round-trip overhead
    await client.query(STATEMENTS.join(";\n"))
    await client.query("COMMIT")
    isSchemaEnsured = true
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

export function ensureSchema() {
  if (isSchemaEnsured) return Promise.resolve()
  migrationPromise ??= migrate().catch((error) => {
    migrationPromise = null // retry on next attempt if failed
    console.error("[db] Could not initialize database schema", error)
    throw error
  })
  return migrationPromise
}
