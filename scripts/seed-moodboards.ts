import { config } from "dotenv"
import { resolve } from "node:path"
import { existsSync } from "node:fs"

// Load environment variables from .env.local or .env
const envLocal = resolve(process.cwd(), ".env.local")
const envDefault = resolve(process.cwd(), ".env")

if (existsSync(envLocal)) {
  config({ path: envLocal })
} else if (existsSync(envDefault)) {
  config({ path: envDefault })
}

import { pool, db } from "../lib/db"
import { moodboards, moodboardComments } from "../lib/db/schema"
import { ensureSchema } from "../lib/db/migrate"
import { eq, sql } from "drizzle-orm"
import { APPLE_GUITAR_CANVAS, APPLE_GUITAR_COMMENTS, APPLE_GUITAR_MOODBOARD } from "../lib/apple-guitars-board"
import { DEMO_CANVAS, DEMO_COMMENTS, DEMO_MOODBOARD } from "../lib/demo-board"

async function runSeed() {
  console.log("🌱 Starting seed for Moodboard Drafts...")
  console.log(`Connecting to database: ${process.env.DATABASE_URL ? "URL configured" : "No database URL (offline)"}`)

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("missing-database-config")) {
    console.log("ℹ️ Note: No live PostgreSQL DATABASE_URL found. In-memory demo routes (/m/apple & /m/demo) remain fully active and ready.")
    process.exit(0)
  }

  try {
    console.log("📦 Ensuring database schema...")
    await ensureSchema()
    console.log("✓ Schema verified.")

    const seedBoards = [
      {
        title: APPLE_GUITAR_MOODBOARD.title,
        clientName: APPLE_GUITAR_MOODBOARD.clientName,
        clientEmail: APPLE_GUITAR_MOODBOARD.clientEmail,
        intro: APPLE_GUITAR_MOODBOARD.intro,
        shareToken: "apple-guitars-draft",
        shared: true,
        status: "draft" as const,
        canvas: APPLE_GUITAR_CANVAS,
        comments: APPLE_GUITAR_COMMENTS,
      },
      {
        title: DEMO_MOODBOARD.title,
        clientName: DEMO_MOODBOARD.clientName,
        clientEmail: DEMO_MOODBOARD.clientEmail,
        intro: DEMO_MOODBOARD.intro,
        shareToken: "komorebi-living-draft",
        shared: true,
        status: "draft" as const,
        canvas: DEMO_CANVAS,
        comments: DEMO_COMMENTS,
      },
    ]

    let count = 0
    for (const b of seedBoards) {
      console.log(`→ Seeding draft moodboard: "${b.title}"...`)

      const [existing] = await db.select().from(moodboards).where(eq(moodboards.shareToken, b.shareToken)).limit(1)

      let boardId = existing?.id
      if (existing) {
        await db
          .update(moodboards)
          .set({
            title: b.title,
            clientName: b.clientName,
            clientEmail: b.clientEmail,
            intro: b.intro,
            canvas: b.canvas,
            status: b.status,
            updatedAt: new Date(),
          })
          .where(eq(moodboards.id, existing.id))
        console.log(`  ✓ Updated existing board [${b.shareToken}]`)
      } else {
        const [inserted] = await db
          .insert(moodboards)
          .values({
            title: b.title,
            clientName: b.clientName,
            clientEmail: b.clientEmail,
            intro: b.intro,
            shareToken: b.shareToken,
            shared: b.shared,
            status: b.status,
            canvas: b.canvas,
            sections: [],
          })
          .returning({ id: moodboards.id })
        boardId = inserted.id
        console.log(`  ✓ Inserted new draft board [${b.shareToken}] (ID: ${boardId})`)
      }

      if (boardId) {
        const [existingComments] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(moodboardComments)
          .where(eq(moodboardComments.moodboardId, boardId))

        if ((existingComments?.count ?? 0) === 0) {
          for (const c of b.comments) {
            await db.insert(moodboardComments).values({
              moodboardId: boardId,
              author: c.author,
              body: c.body,
              fromClient: c.fromClient,
              kind: c.kind,
              itemId: c.itemId,
              createdAt: c.createdAt,
            })
          }
          console.log(`  ✓ Seeded ${b.comments.length} initial discussion comments`)
        }
        count++
      }
    }

    console.log(`\n✨ Successfully seeded ${count} moodboard drafts into database!`)
  } catch (error) {
    console.error("❌ Moodboard seed failed:", error)
  } finally {
    await pool.end()
  }
}

void runSeed()
