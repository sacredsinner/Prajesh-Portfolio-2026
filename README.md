# Prajesh Shakya — Portfolio

The portfolio and content studio behind [shakyaprajesh.com.np](https://www.shakyaprajesh.com.np).

Built with Next.js 16 (App Router), Neon Postgres through Drizzle, Better Auth, Vercel Blob for media and Resend for email. Typography and colours follow the Prajesh Shakya brand system: Instrument Serif and Instrument Sans on the ground `#F5F5F3` and ink `#1B1A16`, with the PS monogram as the logo and favicon.

## Run it locally

```bash
pnpm install
cp .env.example .env.local   # fill in the values, or run `vercel env pull .env.local`
pnpm dev
```

The public pages still render without a database; they just show empty sections.

## Managing content

Everything on the public site is edited at `/admin`, signed in with the admin email set in `lib/auth.ts`, either with **Continue with Google** or with the password:

- **Projects** and **Notes**: notes are written in Markdown (`## heading`, `**bold**`, `*italic*`, `[link](https://…)`, `- list`, `> quote`).
- **Testimonials**, **Contacts** (enquiries from the contact form, which are also emailed to you) and **Email** (reply from your configured sender).
- **Showcase**: the video under the homepage hero.
- **Clients**: bulk-upload logos, then rename each one and add a description.

Images and videos upload straight from the browser to Vercel Blob, so they are not limited by Vercel's 4.5 MB request size. Photos are resized to 2400 px before upload.

Public pages are cached and refresh every 5 minutes. Saving anything in `/admin` refreshes them immediately.

## Environment variables

See `.env.example` for the full list. The ones that matter most:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store for uploads |
| `BETTER_AUTH_SECRET` | Signs sessions |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Password resets, enquiry notifications, replies |
| `ALLOW_ADMIN_SIGNUP` | Set to `true` only while creating a new admin account |

## Deploying

Pushing to `main` deploys to Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for moving the project or setting it up from scratch.
