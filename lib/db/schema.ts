import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import type { MoodboardSection } from "@/lib/moodboards"
import type { InvoiceItem } from "@/lib/invoices"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull(),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  year: text("year").notNull(),
  thumbnail: text("thumbnail").notNull(),
  client: text("client"),
  overview: text("overview"),
  problem: text("problem"),
  approach: text("approach"),
  solution: text("solution"),
  outcome: text("outcome"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  featured: boolean("featured").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
})

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  // From the contact form (added October 2026; created by lib/db/migrate.ts).
  packageInterest: text("package_interest"),
  budget: text("budget"),
  timeline: text("timeline"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  quote: text("quote").notNull(),
  clientName: text("client_name").notNull(),
  clientRole: text("client_role"),
  company: text("company"),
  avatarUrl: text("avatar_url"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url").notNull(),
  logoPathname: text("logo_pathname").notNull(),
  websiteUrl: text("website_url"),
  description: text("description"),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const showcaseVideos = pgTable("showcase_videos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  pathname: text("pathname").notNull().unique(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  featuredImage: text("featured_image").notNull(),
  author: text("author").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// ── Added October 2026. These tables are created automatically on first use by
// lib/db/migrate.ts (ensureSchema), so nothing has to be run by hand in Neon.

// Small key/value store for settings edited in the content studio (e.g. invoice details).
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

// Curated moodboards shared with clients through a private link (/m/<shareToken>).
export const moodboards = pgTable("moodboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  intro: text("intro"),
  sections: jsonb("sections").$type<MoodboardSection[]>().notNull().default([]),
  shareToken: text("share_token").notNull().unique(),
  shared: boolean("shared").notNull().default(false),
  status: text("status").notNull().default("draft"), // draft | shared | changes | approved
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const moodboardComments = pgTable("moodboard_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  moodboardId: uuid("moodboard_id").notNull().references(() => moodboards.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  body: text("body").notNull(),
  fromClient: boolean("from_client").notNull().default(true),
  kind: text("kind").notNull().default("comment"), // comment | approval | changes
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

// Quotes and invoices (kind). Clients open them through /i/<publicToken>.
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // quote | invoice
  number: text("number").notNull().unique(),
  status: text("status").notNull().default("draft"), // quote: draft | sent | accepted | declined | converted · invoice: draft | sent | paid | void
  clientName: text("client_name").notNull(),
  clientCompany: text("client_company"),
  clientEmail: text("client_email"),
  clientAddress: text("client_address"),
  currency: text("currency").notNull(), // NPR | AUD | USD
  items: jsonb("items").$type<InvoiceItem[]>().notNull().default([]),
  taxLabel: text("tax_label"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date"), // invoice: due date · quote: valid until
  notes: text("notes"),
  paymentLink: text("payment_link"),
  publicToken: text("public_token").notNull().unique(),
  sourceQuoteId: uuid("source_quote_id"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  acceptedBy: text("accepted_by"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  remindedAt: timestamp("reminded_at", { withTimezone: true }),
  reminderCount: integer("reminder_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
