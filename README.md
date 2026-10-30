# Prajesh Shakya — Portfolio & Creative Content Studio

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Postgres-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6.26-orange?style=flat-square)](https://www.better-auth.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_SDK-4285F4?style=flat-square&logo=google)](https://aistudio.google.com/)
[![Vercel Blob](https://img.shields.io/badge/Vercel-Blob_Storage-000000?style=flat-square&logo=vercel)](https://vercel.com/docs/storage/vercel-blob)
[![Resend](https://img.shields.io/badge/Resend-Email-black?style=flat-square&logo=resend)](https://resend.com/)

The official portfolio, creative content studio, and client operations hub for **[Prajesh Shakya](https://www.shakyaprajesh.com.np)** — Brand Identity Designer, Creative Director, and Marketing Strategist.

Built on **Next.js 16 App Router**, **React 19**, and **Tailwind CSS v4**, this platform unifies an editorial public showcase, a Behance-grade project builder, an Adobe Firefly-inspired AI Moodboard Designer, interactive client approval portals, multi-currency invoicing, social scheduling via Buffer, and an embedded AI Brand Strategist powered by Google Gemini.

---

## Brand & Design System

The visual language follows the **Prajesh Shakya Design System**:
- **Quiet Editorial Confidence**: High tactile clarity utilizing warm parchment Ground (`#F5F5F3`) and deep carbon Ink (`#1B1A16`).
- **Typographic Dialogue**: High-contrast pairing between **Instrument Serif** (historical elegance & display), **Instrument Sans** (modernist clarity & UI), and **Geist Mono** (data & operational precision).
- **Hairlines over Shadows**: Structural hierarchy defined by crisp 1px borders (`#D9D7CD`) and generous negative space rather than synthetic drop shadows.
- **PS Monogram**: Continuous-stroke interlocking monogram engineered on a strict 45° isometric grid.

> Detailed design guidelines, tokens, and contrast matrices are documented in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

---

## Core Features & Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Prajesh Shakya Studio Ecosystem                       │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                 │                        │
  [ Public Portfolio ]             [ Creative Studio ]      [ Client Operations ]
  • Behance Case Studies           • AI Moodboard Designer  • Private Portals (/m/)
  • Packages & Pricing (/packages) • Project Studio         • Quotes & Invoices (/i/)
  • Notes & RSS (/blog, /notes)    • Socials & Buffer Hub   • Contact Inquiries CRM
  • AI Strategist ("Praj")         • Notion Sync Engine     • Mobile MFE (/overview)
  • Promo Studio (/promo)          • Newsletter Broadcasts  • Multi-Currency Engine
```

### 1. Behance-Style Project Studio (`/admin/projects`)
- **Interactive Cover Studio**: Drag-and-drop cover uploads with an interactive crop tool, focal point calibration, and real-time aspect ratio previews.
- **15 Modular Content Blocks**:
  - Full-width hero images, multi-column image grids (2–4 columns), and responsive image carousels.
  - Video players supporting direct MP4 uploads to Vercel Blob or embeds from YouTube, Vimeo, and Loom.
  - Rich text typography, headings (H1–H4), pull quotes with author attribution & avatar.
  - Interactive Before/After image comparison sliders.
  - Animated GIFs, PDF downloadable cards, interactive Figma embeds, and raw custom HTML embeds.
- **Workflow & Layout Controls**: Boxed, wide, and full-bleed width toggles, drag-and-drop reordering, copy/duplicate blocks, undo/redo (`Cmd+Z` / `Cmd+Shift+Z`), debounced autosave, and multi-device preview frames (Desktop 1440px, Tablet 768px, Mobile 375px).
- **Metadata & Publishing Engine**: Project status states (`draft`, `published`, `scheduled`, `unlisted`), creative fields, tools used, client credits, licensing presets, SEO snippet validator, and accessibility checker.

### 2. Client Moodboards & Presentation Studio (`/m/[token]`)
- **Client Collaboration Portal (`/m/[token]`)**:
  - Private tokenized links for zero-friction client review without requiring account registration.
  - Pin-point item commenting, revision request logs, and one-click milestone approval workflows.
  - Automated canvas versioning (keeps a rolling 30-snapshot history).
  - Pre-seeded flagship showcase: *Apple Guitars Interactive Moodboard* featuring brand imagery, typography, and YouTube/Figma embeds.

### 3. Mobile Command Center & Micro-Frontend (`/overview` & `/mobile/overview`)
- **Mobile-First MFE Architecture**:
  - Built-in postMessage communication protocol via `useMicroFrontendBridge` (`lib/mfe-bridge.ts`).
  - Seamlessly embeddable inside native iOS/Android webviews or third-party iframe shells with automatic height synchronization and bidirectional events.
- **Executive Operations Dashboard**:
  - Real-time studio pulse: cashflow totals, pending/overdue invoices, active client moodboards, recent enquiries, and portfolio analytics.
  - Instant demo switch (`/overview?demo=true`) providing full mock exploration when database access is offline.

### 4. Social Media Command & Buffer Integration (`/admin/socials`)
- Centralized multi-platform publishing hub supporting **Instagram**, **Facebook**, **LinkedIn**, **X (Twitter)**, **Threads**, and **Bluesky**.
- Integrated with **Buffer's GraphQL API** and Buffer MCP server (`https://mcp.buffer.com/mcp`).
- Draft scheduling, queue timeline visualization, idea scratchpad, link auto-shortening, and account profile sync.

### 5. Multi-Currency Invoicing & Quote System (`/admin/invoices` & `/i/[token]`)
- Multi-currency quotes and invoices supporting **NPR (Nepalese Rupee)**, **AUD (Australian Dollar)**, and **USD (US Dollar)**.
- High-fidelity PDF generation rendered directly in-browser and server-side using `pdf-lib` and `@pdf-lib/fontkit`.
- One-click workflow: Convert approved quotes directly into active invoices.
- Automated payment follow-up cron endpoint at `/api/cron/invoice-reminders` powered by Resend.
- Client verification portal with digital acceptance logging.

### 6. "Praj" — AI Brand Strategist & Lead Qualifier (`/api/chat`)
- Conversational brand strategist widget embedded on public pages.
- Powered by **Google Gemini** (`gemini-3.5-flash-lite` / `gemini-1.5-flash`) via the Vercel AI SDK (`@ai-sdk/google`, `ai`).
- Trained on 10+ years of creative direction expertise, service package specs, and case studies.
- Intelligent lead capture (`lib/chat-lead.ts`) that automatically analyzes chat dialogues, extracts client project briefs, budget bands, and contact details, and logs them directly into the CRM.

### 7. Notion CMS Synchronization (`/api/notion/sync`)
- Automated synchronization between Notion editorial databases and the portfolio's `/notes` and `/blog` routes.
- Full markdown compilation via `notion-to-md` with support for custom callouts, code syntax, and hero images.
- Protected webhook route requiring `NOTION_SYNC_SECRET` for secure automated syncs.
- Automated RSS 2.0 feed generation at `/blog/rss.xml`.

### 8. Packaging, Pricing & Newsletter Broadcasts
- **Package Tiers (`/packages`)**: Interactive pricing tables for Foundation, Identity, and System tiers with live currency switching and add-on estimators. Rich Schema.org `ItemList` and `Offer` JSON-LD metadata for SEO.
- **Newsletter Engine (`/admin/newsletter`)**: Broadcast creation with Resend integration, double opt-in verification (`/api/newsletter/confirm`), and contact list sync.
- **Promo Video Studio (`/promo`)**: Built-in 60 FPS motion graphics renderer and video exporter for social promotion (feature-flag guarded).

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Route Handlers, Turbopack) |
| **Language & UI** | [TypeScript](https://www.typescriptlang.org/), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/), Tailwind Animate |
| **Database & ORM** | [Neon Postgres](https://neon.tech/) (Serverless) with [Drizzle ORM](https://orm.drizzle.team/) & Auto-Migrations |
| **Authentication** | [Better Auth](https://www.better-auth.com/) (Email/Password & Google OAuth) |
| **AI & LLM** | [Google Gemini](https://aistudio.google.com/) via `@ai-sdk/google` & Vercel AI SDK |
| **Media & Storage** | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (Direct client-to-store uploads) |
| **Email Service** | [Resend](https://resend.com/) (Transactional emails, contact CRM, broadcast newsletters) |
| **Social Publishing**| [Buffer API](https://buffer.com/developers/api) (GraphQL & MCP) |
| **Document Engine** | [pdf-lib](https://pdf-lib.js.org/) & [@pdf-lib/fontkit](https://github.com/Hopding/fontkit) |
| **CMS Sync** | [Notion API Client](https://github.com/makenotion/notion-sdk-js) & [notion-to-md](https://github.com/souvikinator/notion-to-md) |

---

## Repository Structure

```
├── app/
│   ├── (public)
│   │   ├── page.tsx               # Homepage with hero showcase video & client logos
│   │   ├── about/                 # Biography, philosophy, and creative direction
│   │   ├── projects/[slug]/       # Behance-style project presentation views
│   │   ├── notes/ & blog/         # Editorial essays, Notion-synced articles, RSS
│   │   ├── packages/              # Brand packages with multi-currency switch
│   │   ├── contact/               # Project inquiry form & discovery booking
│   │   ├── promo/                 # 60 FPS Promo Video Studio & canvas exporter
│   │   └── design-system/         # Live design system, tokens, and typographic scale
│   ├── overview/                  # Mobile-first command center (MFE embeddable)
│   ├── mobile/overview/           # Standalone route alias for mobile webviews
│   ├── m/[token]/                 # Client private moodboard review & approval portal
│   ├── i/[token]/                 # Client private quote & invoice portal + PDF render
│   ├── admin/                     # Password-authenticated Content Studio
│   │   ├── projects/              # Behance block builder & asset manager
│   │   ├── moodboards/            # Canvas moodboard editor & client board links
│   │   ├── invoices/              # Invoice generator, quote converter & reminders
│   │   ├── socials/               # Buffer multi-channel scheduler & ideas bank
│   │   ├── newsletter/            # Resend broadcast composer & subscriber list
│   │   ├── packages/              # Service tier configurations & pricing rules
│   │   └── clients/               # Partner client logos and showcase videos
│   └── api/                       # API routes (Chat, Blob, Notion, Cron, Newsletter)
├── components/
│   ├── mobile-overview/           # MFE mobile shell, metrics cards, auth gate
│   ├── chat/                      # "Praj" AI brand strategist floating widget
│   ├── packages/                  # Pricing matrix, currency selector, add-on calculator
│   ├── promo/                     # Motion graphics renderer and video recorder
│   └── ui/                        # Radix UI primitives & accessible components
├── lib/
│   ├── db/                        # Neon Postgres connection, Drizzle schema & migrations
│   ├── mfe-bridge.ts              # PostMessage bridge for micro-frontend integration
│   ├── socials.ts                 # Buffer GraphQL integration and social state
│   ├── moodboards.ts & canvas.ts  # Infinite canvas math, items, and comment state
│   ├── invoices.ts & money.ts     # Multi-currency calculations and tax structures
│   ├── ai.ts & chat-lead.ts       # Gemini prompt engine and automatic lead qualifier
│   ├── notion.ts                  # Notion API database sync and markdown parser
│   └── pdf/                       # In-browser & server PDF generation with custom fonts
└── scripts/
    ├── seed-projects.ts           # Seed demo case studies
    ├── seed-moodboards.ts         # Seed demo moodboards (including Apple Guitars)
    └── migrate-invoices.ts        # Database schema and invoice structure migrations
```

---

## Getting Started

### Prerequisites

- **Node.js**: `20.x` or later
- **Package Manager**: `pnpm` (version 9 or 10 recommended)

### 1. Clone & Install

```bash
git clone https://github.com/shakyaprajesh/Prajesh-Portfolio-2026.git
cd Prajesh-Portfolio-2026
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment template:

```bash
cp .env.example .env.local
```

Populate the required credentials (or pull them directly from Vercel using `vercel env pull .env.local`).

### 3. Database Setup & Seeding

The platform features an automatic migration system (`lib/db/migrate.ts`). Tables and schema revisions are created on first use when connecting to Neon Postgres.

To seed initial demo projects and interactive moodboards:

```bash
# Seed portfolio projects
pnpm seed

# Seed demo moodboards (Apple Guitars showcase, client boards)
pnpm seed:moodboards

# Run database invoice structure migrations (if upgrading)
pnpm migrate:invoices
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: Public pages render gracefully even without database credentials configured by utilizing baked-in fallback states.

---

## Environment Variables Reference

| Variable | Required | Description |
| --- | :---: | --- |
| `DATABASE_URL` | Yes | Neon Postgres pooled connection string (`postgres://...`) |
| `DATABASE_URL_UNPOOLED` | No | Direct Neon connection string (useful for migrations) |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob read/write token for direct media uploads |
| `BETTER_AUTH_SECRET` | Yes | 32+ character random secret used to sign session cookies |
| `BETTER_AUTH_URL` | Yes | Canonical application base URL (`https://www.shakyaprajesh.com.np`) |
| `ALLOW_ADMIN_SIGNUP` | No | Set to `"true"` temporarily to create your first admin account at `/admin/signup` |
| `GOOGLE_CLIENT_ID` | No | Google Cloud OAuth Client ID for admin sign-in |
| `GOOGLE_CLIENT_SECRET` | No | Google Cloud OAuth Client Secret |
| `RESEND_API_KEY` | Yes | Resend API key for enquiry alerts, password resets, and invoices |
| `RESEND_FROM_EMAIL` | Yes | Verified sender address (e.g. `Prajesh Shakya <hello@shakyaprajesh.com.np>`) |
| `CONTACT_NOTIFICATION_EMAIL`| No | Recipient email for enquiry notifications (defaults to admin email) |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL for OpenGraph metadata and JSON-LD structured data |
| `GOOGLE_GENERATIVE_AI_API_KEY`| Yes | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) for Praj Chat |
| `GEMINI_MODEL` | No | Gemini model identifier (defaults to `gemini-3.5-flash-lite`) |
| `BUFFER_ACCESS_TOKEN` | No | Access token from Buffer Developer Portal for multi-channel social publishing |
| `NOTION_API_KEY` | No | Notion Integration Secret for syncing blog articles |
| `NOTION_DATABASE_ID` | No | 32-character database identifier in Notion |
| `NOTION_SYNC_SECRET` | No | Bearer token or URL parameter to protect the `/api/notion/sync` webhook |

---

## Client Portals & Tokenized Access

This architecture avoids forcing clients to undergo cumbersome registration workflows. Instead, client-facing experiences use crytographically secure share tokens:

- **Client Moodboards**: Shared via `/m/[shareToken]`. Clients can pan, zoom, inspect visual assets, leave pinned comments, and formally accept creative directions.
- **Client Invoices & Quotes**: Shared via `/i/[publicToken]`. Clients can review line items, switch between multi-currency views, approve quotes, download branded vector PDFs, or settle invoices.
- **Mobile MFE Dashboard**: Access `/overview?demo=true` or pass parent `postMessage` envelopes to integrate within your agency suite.

---

## Deployment

Continuous deployment is preconfigured with [Vercel](https://vercel.com/):

1. Push your changes to the `main` branch.
2. Vercel automatically runs `next build` with Turbopack optimizations.
3. Configure your production environment variables in the Vercel Project Dashboard.
4. Set up the Vercel Cron Job configured for `/api/cron/invoice-reminders` to automate payment reminder checks.

For detailed migration instructions, domain setup, and self-hosting details, refer to the [Deployment Guide](./DEPLOYMENT.md).

---

## License

Copyright © 2026 Prajesh Shakya. All rights reserved.  
Source code is licensed under the [GNU General Public License v3.0](./LICENSE).
