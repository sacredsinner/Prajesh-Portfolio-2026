"use server"

import { randomBytes } from "node:crypto"
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod"
import { ADMIN_EMAIL, auth, isAdminUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureSchema } from "@/lib/db/migrate"
import { moodboardComments, moodboardVersions, moodboards } from "@/lib/db/schema"
import { sendEmail } from "@/lib/email"
import { moodboardFeedbackEmail, moodboardLinkEmail, moodboardReplyEmail } from "@/lib/email-templates"
import type { MoodboardSection } from "@/lib/moodboards"
import { sectionsToCanvas, type Canvas } from "@/lib/canvas"
import { SITE_URL } from "@/lib/site"
import { AI_ENABLED, describeImage, type ImageInsight } from "@/lib/ai"

// A "use server" file may only export async functions (and types).

export type MoodboardResult = { ok: true; id: string } | { ok: false; error: string }
export type PlainResult = { ok: true } | { ok: false; error: string }

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!isAdminUser(session?.user)) throw new Error("Unauthorized")
}

const text = (max: number) => z.string().trim().max(max)
const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #1B1A16.")
const itemSchema = z.discriminatedUnion("type", [
  z.object({ id: text(64).min(1), type: z.literal("image"), url: z.string().trim().url().max(2000), caption: text(300).optional(), wide: z.boolean().optional(), focal: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(), aspect: z.enum(["auto", "1:1", "4:5", "3:2", "16:9"]).optional(), tags: z.array(text(40)).max(12).optional(), palette: z.array(hex).max(8).optional() }),
  z.object({ id: text(64).min(1), type: z.literal("colour"), hex, name: text(60).optional(), note: text(300).optional() }),
  z.object({ id: text(64).min(1), type: z.literal("palette"), name: text(60).optional(), colours: z.array(hex).min(1).max(8), sourceUrl: z.string().trim().url().max(2000).optional() }),
  z.object({ id: text(64).min(1), type: z.literal("type"), family: text(80).min(1, "Name the typeface."), sample: text(200).optional(), note: text(300).optional() }),
  z.object({ id: text(64).min(1), type: z.literal("note"), text: text(2000).min(1, "Write the note.") }),
  z.object({ id: text(64).min(1), type: z.literal("link"), url: z.string().trim().url("Use a full link, starting with https://.").max(2000), title: text(160).optional(), note: text(300).optional() }),
])
const sectionSchema = z.object({ id: text(64).min(1), title: text(80).min(1, "Give every section a title."), note: text(600).optional(), items: z.array(itemSchema).max(60) })
const boardSchema = z.object({
  id: z.string().uuid().optional(),
  title: text(140).min(1, "Give the moodboard a title."),
  clientName: text(120).optional().transform((v) => v || null),
  clientEmail: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid client email.")]).optional().transform((v) => v || null),
  intro: text(2000).optional().transform((v) => v || null),
  sections: z.array(sectionSchema).max(12).default([]),
})

// ── Canvas
const hexC = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/)
const baseItem = { id: text(64).min(1), x: z.number().finite(), y: z.number().finite(), w: z.number().min(1).max(20000), h: z.number().min(1).max(20000), z: z.number().int(), locked: z.boolean().optional(), group: text(64).optional(), rotation: z.number().min(-360).max(360).optional() }
const canvasItemSchema = z.discriminatedUnion("type", [
  z.object({ ...baseItem, type: z.literal("image"), url: text(2000), caption: text(300).optional(), focal: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(), aspect: z.enum(["auto", "1:1", "4:5", "3:2", "16:9"]).optional(), tags: z.array(text(40)).max(12).optional(), palette: z.array(hexC).max(8).optional() }),
  z.object({ ...baseItem, type: z.literal("note"), text: text(4000), size: z.enum(["s", "m", "l"]).optional() }),
  z.object({ ...baseItem, type: z.literal("sticky"), text: text(1000), colour: z.enum(["sand", "sage", "sky", "rose", "ink"]) }),
  z.object({ ...baseItem, type: z.literal("colour"), hex: hexC, name: text(60).optional(), note: text(300).optional() }),
  z.object({ ...baseItem, type: z.literal("palette"), name: text(60).optional(), colours: z.array(hexC).min(1).max(8) }),
  z.object({ ...baseItem, type: z.literal("font"), family: text(80), sample: text(200).optional(), note: text(300).optional() }),
  z.object({ ...baseItem, type: z.literal("link"), url: text(2000), title: text(160).optional(), note: text(300).optional() }),
  z.object({ ...baseItem, type: z.literal("embed"), url: text(2000), provider: z.enum(["figma", "pinterest", "behance", "canva", "youtube", "vimeo", "other"]), title: text(160).optional() }),
  z.object({ ...baseItem, type: z.literal("frame"), title: text(120), tone: z.enum(["light", "dark"]).optional() }),
  z.object({ ...baseItem, type: z.literal("shape"), shape: z.enum(["rect", "ellipse"]), fill: hexC.optional(), label: text(120).optional() }),
])
const canvasSchema = z.object({
  items: z.array(canvasItemSchema).max(600),
  connectors: z.array(z.object({ id: text(64).min(1), from: text(64), to: text(64), label: text(120).optional() })).max(300),
  background: z.enum(["grid", "dots", "plain"]).optional(),
})
export type CanvasResult = { ok: true; savedAt: string } | { ok: false; error: string }
export type MoodboardInput = z.input<typeof boardSchema>

const newToken = () => randomBytes(16).toString("base64url")
const boardUrl = (token: string) => `${SITE_URL}/m/${token}`

export async function listMoodboards() {
  await requireAdmin()
  await ensureSchema()
  const boards = await db.select().from(moodboards).orderBy(desc(moodboards.updatedAt))
  const counts = await db.select({ moodboardId: moodboardComments.moodboardId, count: sql<number>`count(*)::int` }).from(moodboardComments).groupBy(moodboardComments.moodboardId)
  const byBoard = new Map(counts.map((row) => [row.moodboardId, row.count]))
  return boards.map((board) => ({ ...board, commentCount: byBoard.get(board.id) ?? 0 }))
}

export async function getMoodboardComments(id: string) {
  await requireAdmin()
  return db.select().from(moodboardComments).where(eq(moodboardComments.moodboardId, z.string().uuid().parse(id))).orderBy(asc(moodboardComments.createdAt))
}

export async function saveMoodboard(input: unknown): Promise<MoodboardResult> {
  await requireAdmin()
  await ensureSchema()
  const parsed = boardSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the board and try again." }
  const { id, ...data } = parsed.data
  const sections = data.sections as MoodboardSection[]
  if (id) {
    // The details form sends no sections; keep whatever the board has.
    const { sections: _ignored, ...details } = data
    const [updated] = await db.update(moodboards).set({ ...details, ...(sections.length ? { sections } : {}), updatedAt: new Date() }).where(eq(moodboards.id, id)).returning({ id: moodboards.id })
    if (!updated) return { ok: false, error: "That moodboard no longer exists. Reload the page." }
    revalidatePath("/admin/moodboards")
    return { ok: true, id: updated.id }
  }
  const [created] = await db.insert(moodboards).values({ ...data, sections, canvas: { items: [], connectors: [], background: "dots" }, shareToken: newToken() }).returning({ id: moodboards.id })
  revalidatePath("/admin/moodboards")
  return { ok: true, id: created.id }
}

export async function deleteMoodboard(id: string): Promise<PlainResult> {
  await requireAdmin()
  await ensureSchema()
  await db.delete(moodboards).where(eq(moodboards.id, z.string().uuid().parse(id)))
  revalidatePath("/admin/moodboards")
  return { ok: true }
}

// Turns the private link on or off. Off = the client page shows "not available".
export async function setMoodboardShared(id: string, shared: boolean): Promise<PlainResult> {
  await requireAdmin()
  await ensureSchema()
  const [row] = await db.select().from(moodboards).where(eq(moodboards.id, z.string().uuid().parse(id))).limit(1)
  if (!row) return { ok: false, error: "That moodboard no longer exists. Reload the page." }
  const status = shared ? (row.status === "draft" ? "shared" : row.status) : row.status
  await db.update(moodboards).set({ shared, status, updatedAt: new Date() }).where(eq(moodboards.id, row.id))
  revalidatePath("/admin/moodboards")
  return { ok: true }
}

// Emails the private link to the client (and switches sharing on).
export async function sendMoodboard(id: string, message?: string): Promise<PlainResult> {
  await requireAdmin()
  await ensureSchema()
  const [row] = await db.select().from(moodboards).where(eq(moodboards.id, z.string().uuid().parse(id))).limit(1)
  if (!row) return { ok: false, error: "That moodboard no longer exists. Reload the page." }
  if (!row.clientEmail) return { ok: false, error: "Add the client's email address first." }
  const result = await sendEmail({ to: row.clientEmail, replyTo: ADMIN_EMAIL, ...moodboardLinkEmail({ clientName: row.clientName, title: row.title, url: boardUrl(row.shareToken), message: message?.slice(0, 2000) }) })
  if (!result.ok) return { ok: false, error: `The email wasn't sent: ${result.error}` }
  await db.update(moodboards).set({ shared: true, status: row.status === "draft" ? "shared" : row.status, updatedAt: new Date() }).where(eq(moodboards.id, row.id))
  revalidatePath("/admin/moodboards")
  return { ok: true }
}

// Prajesh answers on the board; the client gets an email if we have their address.
export async function replyOnMoodboard(id: string, body: string, itemId?: string): Promise<PlainResult> {
  await requireAdmin()
  await ensureSchema()
  const message = z.string().trim().min(1, "Write a reply.").max(2000).safeParse(body)
  if (!message.success) return { ok: false, error: message.error.issues[0].message }
  const [row] = await db.select().from(moodboards).where(eq(moodboards.id, z.string().uuid().parse(id))).limit(1)
  if (!row) return { ok: false, error: "That moodboard no longer exists. Reload the page." }
  await db.insert(moodboardComments).values({ moodboardId: row.id, author: "Prajesh", body: message.data, fromClient: false, itemId: itemId || null })
  if (row.clientEmail) {
    const sent = await sendEmail({ to: row.clientEmail, replyTo: ADMIN_EMAIL, ...moodboardReplyEmail({ clientName: row.clientName, title: row.title, body: message.data, url: boardUrl(row.shareToken) }) })
    if (!sent.ok) console.error("[moodboards] Reply email failed:", sent.error)
  }
  revalidatePath("/admin/moodboards")
  revalidatePath(`/m/${row.shareToken}`)
  return { ok: true }
}

// ── Public: the client comments, approves or asks for changes.
const feedbackSchema = z.object({
  token: z.string().min(4).max(64),
  name: z.string().trim().min(2, "Add your name.").max(120),
  body: z.string().trim().max(2000),
  kind: z.enum(["comment", "approval", "changes"]),
  website: z.string().max(200).optional(),
  itemId: z.string().trim().max(64).optional(),
})

export async function sendMoodboardFeedback(input: unknown): Promise<PlainResult> {
  const parsed = feedbackSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your message and try again." }
  const { token, name, body, kind, website, itemId } = parsed.data
  if (website) return { ok: true }
  if (token === "demo") return { ok: true }
  if (kind === "comment" && !body) return { ok: false, error: "Write a comment first." }
  await ensureSchema()
  const [row] = await db.select().from(moodboards).where(and(eq(moodboards.shareToken, token), eq(moodboards.shared, true))).limit(1)
  if (!row) return { ok: false, error: "This moodboard isn't available any more." }
  // At most 30 comments an hour per board, so the form can't be used to flood the inbox.
  const [recent] = await db.select({ count: sql<number>`count(*)::int` }).from(moodboardComments).where(and(eq(moodboardComments.moodboardId, row.id), gte(moodboardComments.createdAt, new Date(Date.now() - 3600_000))))
  if ((recent?.count ?? 0) >= 30) return { ok: false, error: "Too many comments in a short time. Please try again later." }

  const defaultBody = kind === "approval" ? "Approved the direction." : kind === "changes" ? "Asked for changes." : ""
  await db.insert(moodboardComments).values({ moodboardId: row.id, author: name, body: body || defaultBody, fromClient: true, kind, itemId: itemId || null })
  const status = kind === "approval" ? "approved" : kind === "changes" ? "changes" : row.status
  await db.update(moodboards).set({ status, approvedBy: kind === "approval" ? name : row.approvedBy, approvedAt: kind === "approval" ? new Date() : row.approvedAt, updatedAt: new Date() }).where(eq(moodboards.id, row.id))

  after(async () => {
    const result = await sendEmail({
      to: process.env.CONTACT_NOTIFICATION_EMAIL || ADMIN_EMAIL,
      replyTo: row.clientEmail ?? undefined,
      ...moodboardFeedbackEmail({ title: row.title, author: name, body, kind, adminUrl: `${SITE_URL}/admin/moodboards` }),
    }).catch((error) => ({ ok: false as const, error: String(error) }))
    if (!result.ok) console.error("[moodboards] Feedback alert failed:", result.error)
  })
  revalidatePath(`/m/${token}`)
  revalidatePath("/admin/moodboards")
  return { ok: true }
}

// ── AI: keywords, a caption and a suggested section for an image (needs ANTHROPIC_API_KEY).
export type InsightResult = { ok: true; insight: ImageInsight } | { ok: false; error: string }

export async function aiEnabled() {
  await requireAdmin()
  return AI_ENABLED
}

export async function suggestImageDetails(url: string, boardTitle?: string): Promise<InsightResult> {
  await requireAdmin()
  const parsed = z.string().url().max(2000).safeParse(url)
  if (!parsed.success) return { ok: false, error: "That image link isn't valid." }
  try {
    return { ok: true, insight: await describeImage(parsed.data, boardTitle?.slice(0, 140)) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The AI request failed." }
  }
}

// The editor: the board with its canvas (old section boards are converted on first open).
export async function loadMoodboard(id: string) {
  await requireAdmin()
  await ensureSchema()
  const [row] = await db.select().from(moodboards).where(eq(moodboards.id, z.string().uuid().parse(id))).limit(1)
  if (!row) return null
  const canvas: Canvas = row.canvas ?? sectionsToCanvas(row.sections)
  const comments = await db.select().from(moodboardComments).where(eq(moodboardComments.moodboardId, row.id)).orderBy(asc(moodboardComments.createdAt))
  return { ...row, canvas, comments }
}

const KEEP_VERSIONS = 30

// Autosave from the editor. `snapshot` also records a version (every few minutes, and on demand).
export async function saveCanvas(id: string, input: unknown, snapshot?: string | boolean): Promise<CanvasResult> {
  await requireAdmin()
  await ensureSchema()
  const parsed = canvasSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "The board couldn't be saved." }
  const boardId = z.string().uuid().parse(id)
  const canvas = parsed.data as Canvas
  const [updated] = await db.update(moodboards).set({ canvas, updatedAt: new Date() }).where(eq(moodboards.id, boardId)).returning({ id: moodboards.id, shareToken: moodboards.shareToken })
  if (!updated) return { ok: false, error: "That moodboard no longer exists." }
  if (snapshot) {
    await db.insert(moodboardVersions).values({ moodboardId: boardId, canvas, note: typeof snapshot === "string" ? snapshot.slice(0, 120) : null })
    const old = await db.select({ id: moodboardVersions.id }).from(moodboardVersions).where(eq(moodboardVersions.moodboardId, boardId)).orderBy(desc(moodboardVersions.createdAt)).offset(KEEP_VERSIONS)
    if (old.length) await db.delete(moodboardVersions).where(inArray(moodboardVersions.id, old.map((v) => v.id)))
  }
  revalidatePath(`/m/${updated.shareToken}`)
  return { ok: true, savedAt: new Date().toISOString() }
}

export async function listVersions(id: string) {
  await requireAdmin()
  await ensureSchema()
  return db.select({ id: moodboardVersions.id, note: moodboardVersions.note, createdAt: moodboardVersions.createdAt, items: sql<number>`jsonb_array_length(${moodboardVersions.canvas}->'items')::int` }).from(moodboardVersions).where(eq(moodboardVersions.moodboardId, z.string().uuid().parse(id))).orderBy(desc(moodboardVersions.createdAt)).limit(KEEP_VERSIONS)
}

export async function getVersion(id: string): Promise<Canvas | null> {
  await requireAdmin()
  const [row] = await db.select({ canvas: moodboardVersions.canvas }).from(moodboardVersions).where(eq(moodboardVersions.id, z.string().uuid().parse(id))).limit(1)
  return row?.canvas ?? null
}
