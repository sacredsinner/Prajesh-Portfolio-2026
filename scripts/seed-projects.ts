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
import { projects } from "../lib/db/schema"
import { ensureSchema } from "../lib/db/migrate"
import { DEMO_PROJECTS } from "../lib/demo-projects"

async function runSeed() {
  console.log("🌱 Starting seed for 4 demo projects...")
  console.log(`Connecting to database: ${process.env.DATABASE_URL ? "URL provided" : "Default fallback"}`)

  try {
    console.log("📦 Ensuring database schema...")
    await ensureSchema()
    console.log("✓ Schema verified.")

    let count = 0
    for (const project of DEMO_PROJECTS) {
      console.log(`→ Seeding [${project.category}] ${project.title} (${project.slug})...`)
      await db
        .insert(projects)
        .values({
          ...project,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: projects.slug,
          set: {
            title: project.title,
            subtitle: project.subtitle,
            category: project.category,
            year: project.year,
            thumbnail: project.thumbnail,
            client: project.client,
            role: project.role,
            overview: project.overview,
            problem: project.problem,
            approach: project.approach,
            solution: project.solution,
            outcome: project.outcome,
            images: project.images,
            creativeFields: project.creativeFields,
            tags: project.tags,
            toolsUsed: project.toolsUsed,
            team: project.team,
            industries: project.industries,
            blocks: project.blocks,
            analytics: project.analytics,
            featured: project.featured,
            seoTitle: project.seoTitle,
            seoDescription: project.seoDescription,
            updatedAt: new Date(),
          },
        })
      count++
      console.log(`  ✓ Successfully seeded: ${project.title}`)
    }

    console.log(`\n✨ Successfully seeded ${count} demo projects!`)
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

void runSeed()
