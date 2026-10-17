# Deployment Guide

This project is a Next.js 16 portfolio/CMS app with Better Auth, Neon Postgres, and public Vercel Blob storage.

## 1. Copy the project

Move the project to the new repository or import it into a new Vercel project. Keep the existing `app`, `components`, `lib`, `public`, and configuration files together.

Install dependencies with:

```bash
pnpm install
```

## 2. Create the backing services

Create or connect:

- A Neon PostgreSQL database
- A public Vercel Blob store

The Blob store must be public because portfolio images, client logos, and showcase videos are displayed directly on the public website.

## 3. Configure environment variables

Add these variables to the new project in Development, Preview, and Production where applicable:

```env
DATABASE_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
BETTER_AUTH_SECRET=generate-a-random-secret-at-least-32-characters-long
BETTER_AUTH_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_SITE_URL=https://www.your-production-domain.com
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Your Name <hello@your-production-domain.com>
```

`RESEND_API_KEY` sends password resets, emails you each new contact-form enquiry, and powers replies from `/admin`. Until your domain is verified in Resend, its test sender can only email the address that owns the Resend account, so verify the domain and set `RESEND_FROM_EMAIL`. `CONTACT_NOTIFICATION_EMAIL` changes where enquiries are sent. `.env.example` lists every variable.

`BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` may be omitted for local development. On Vercel, the app can use the deployment URL automatically, but setting the production URL is recommended for stable authentication redirects.

Generate a secret locally with:

```bash
openssl rand -base64 32
```

Never commit `.env` files or expose `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, or `BETTER_AUTH_SECRET` in client-side code.

## 4. Create the database tables

Run the project's existing Better Auth schema plus the application tables in the new Neon database. At minimum, the database must contain:

- Better Auth tables: `user`, `session`, `account`, `verification`
- CMS tables already defined in `lib/db/schema.ts`
- `showcase_videos`
- `clients`

The latest feature tables can be created with these statements, one at a time:

```sql
CREATE TABLE IF NOT EXISTS showcase_videos (
  id SERIAL PRIMARY KEY,
  pathname TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

```sql
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  logo_pathname TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The tables added in October 2026 (`site_settings`, `moodboards`, `moodboard_comments`, `invoices`, and the `package_interest` / `budget` / `timeline` columns on `contacts`) are created automatically the first time they are needed, by `lib/db/migrate.ts`. Nothing needs to be run by hand.

Optional environment variables for the newer features:

- `CRON_SECRET` — if set, only Vercel's scheduler can trigger `/api/cron/invoice-reminders` (daily overdue-invoice reminders, see `vercel.json`).
- `NEWSLETTER_SECRET` — signs newsletter confirmation links (falls back to `BETTER_AUTH_SECRET`).
- `CONTACT_NOTIFICATION_EMAIL` — where enquiry, newsletter, moodboard and quote alerts go (defaults to the admin email).

If the project already contains migration SQL or an initialized database, use that schema as the source of truth instead of recreating existing tables.

## 5. Deploy

From the project root:

```bash
pnpm build
pnpm start
```

For Vercel deployment, connect the repository, set the environment variables, and deploy with the default Next.js settings. The build command is `pnpm build`; the framework is Next.js.

## 6. Create the first admin user

Sign-up is closed by default, and only the email in `ADMIN_EMAIL` (`lib/auth.ts`) gets admin access.

1. Set `ALLOW_ADMIN_SIGNUP=true` in the Vercel project and redeploy.
2. Open `/admin/signup` and register with the admin email and a strong password.
3. Open `/admin` and confirm the CMS loads.
4. Remove `ALLOW_ADMIN_SIGNUP` (or set it to anything other than `true`) and redeploy, so nobody else can create accounts.

### Google sign-in

"Continue with Google" appears on `/admin` when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. In Google Cloud Console, open APIs & Services → Credentials and create an OAuth client ID (type: Web application) with:

- Authorized JavaScript origins: `https://shakyaprajesh.com.np` and `https://www.shakyaprajesh.com.np` (plus `http://localhost:3000` for local development)
- Authorized redirect URIs: `https://shakyaprajesh.com.np/api/auth/callback/google` (your `BETTER_AUTH_URL` followed by `/api/auth/callback/google`; add `http://localhost:3000/api/auth/callback/google` for local development)

Signing in with Google as the admin email opens the existing admin account, even if it was created with a password, so either method works. Other Google accounts can't create accounts while sign-up is closed.

Use a strong unique password and do not share it in source control.

## 7. Seed portfolio content

From `/admin`:

- Add or update projects, posts, testimonials, and contacts.
- Upload a showcase video and mark it active.
- Open the client management screen and bulk upload partnership logo images.

Client names are generated from image filenames during bulk upload (`hamro-patro.png` becomes "Hamro Patro"). Rename a client, add its website and description, or hide it with **Edit** on the client management screen.

Files upload straight from the browser to Vercel Blob (through `/api/blob/upload`, which only issues upload tokens to the admin), and the public URL is saved in Neon. This avoids Vercel's 4.5 MB request limit.

## 8. Verify the deployment

Check these routes after deployment:

- `/` — homepage, hero, video showcase, Trusted Partnerships, projects, and footer
- `/projects` — project index
- `/clients` — client logo index
- `/blog` — blog index
- `/admin` — authenticated CMS
- `/does-not-exist` — custom 404 page
- `/sitemap.xml` and `/robots.txt`

Also test:

- Sign-up and sign-in
- Admin upload and delete actions
- Bulk client logo upload
- Selecting an active showcase video
- Mobile layout and navigation

## 9. Common deployment issues

### Authentication redirects fail

Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the exact deployed HTTPS origin, without a trailing slash. Confirm `BETTER_AUTH_SECRET` is present in the same Vercel environment as the deployment.

### Uploads fail

Confirm `BLOB_READ_WRITE_TOKEN` belongs to the Blob store connected to the new project and that the store is public. Image uploads are limited to 8MB (photos are resized in the browser first); showcase videos are limited to 100MB.

### Database queries fail

Confirm `DATABASE_URL` points to the new Neon database and that all Better Auth and application tables exist. Redeploy after changing environment variables.

### The homepage has no client logos

Bulk upload logos through the admin client manager and ensure the client records are published. The homepage only shows published client records; the provided seeded reference image is used only when no records exist.

## 10. Production checklist

- [ ] Environment variables configured in Production
- [ ] Database tables created
- [ ] Blob store connected and public
- [ ] Admin account verified
- [ ] Homepage and custom 404 checked
- [ ] Uploads tested
- [ ] Mobile layout checked
- [ ] Custom domain and HTTPS configured
- [ ] No secrets committed to Git
