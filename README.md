# Prajesh Shakya — Portfolio & Content Studio

The portfolio and content studio behind [shakyaprajesh.com.np](https://www.shakyaprajesh.com.np).

Built with Next.js 16 (App Router), Neon Postgres through Drizzle, Better Auth, Vercel Blob for media and Resend for email. Typography and colours follow the Prajesh Shakya brand system: Instrument Serif and Instrument Sans on the ground `#F5F5F3` and ink `#1B1A16`, with the PS monogram as the logo and favicon.

## Run it locally

```bash
pnpm install
cp .env.example .env.local   # fill in the values, or run `vercel env pull .env.local`
pnpm dev
```

The public pages still render without a database; they just show empty sections.

## Content Studio & Behance-Style Project Builder

Everything on the public site is edited at `/admin`, signed in with the admin email set in `lib/auth.ts`:

- **Behance-Style Project Studio (`/admin/projects/new` & `/admin/projects/[id]`)**:
  - **Hero & Cover**: Drag & drop cover upload, interactive crop & focal point tool, aspect ratio preview.
  - **15 Content Blocks**: Image, Image Grid (2-4 columns), Carousel, Full-Width Image, Video (direct MP4 upload or YouTube/Vimeo/Loom embed), Rich Text, Headings (H1-H4), Quotes with author & avatar, Dividers, Web Embeds, Before/After comparison slider, Animated GIFs, PDF download cards, Figma prototype embeds, and Custom HTML.
  - **Editing Workflow**: Boxed / Wide / Full-bleed width toggles, drag & drop reordering, duplicate block, copy/paste, inline editing, undo/redo (Cmd+Z / Cmd+Shift+Z), debounced autosave, and keyboard shortcuts.
  - **Settings Sidebar**: Status (`draft`, `published`, `scheduled`, `unlisted`), Creative Fields, Tools Used, Team & Credits, Copyright/License presets, SEO meta tags with Google snippet preview, Analytics metrics, and Media Asset Manager.
  - **Publishing Checklist**: Validation meter verifying cover, title, description, content blocks, SEO score, and accessibility alt text.
  - **Live Preview**: Multi-device viewport frames (Desktop 1440px, Tablet 768px, Mobile 375px).
- **Notes & Blog**: Markdown articles with RSS feed.
- **Client Portals**:
  - **Moodboards (`/m/[token]`)**: Shared infinite canvas boards with client comments & approval workflow.
  - **Quotes & Invoices (`/i/[token]`)**: Branded multi-currency invoices and quotes with automated PDF generation.
- **Testimonials, Contacts & Email**: Client feedback management, inquiry CRM with direct replies via Resend.
- **Showcase & Clients**: Homepage hero video and partner client logo management.

Images and videos upload straight from the browser to Vercel Blob. Public pages refresh every 5 minutes or immediately when saved in `/admin`.

## Environment variables

See `.env.example` for the full list:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store for uploads |
| `BETTER_AUTH_SECRET` | Signs sessions |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Password resets, enquiry notifications, replies |
| `ALLOW_ADMIN_SIGNUP` | Set to `true` only while creating a new admin account |

## Deploying

Pushing to `main` deploys to Vercel. See [DEPLOYMENT.md](./DEPLOYMENT.md) for moving the project or setting it up from scratch.
