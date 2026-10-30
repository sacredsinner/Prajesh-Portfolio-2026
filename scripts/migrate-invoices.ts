import { createRequire } from "node:module"
import Module from "node:module"

// Mock 'server-only' for standalone Node/tsx CLI executions
// @ts-ignore
const origRequire = Module.prototype.require
// @ts-ignore
Module.prototype.require = function (id: string, ...args: any[]) {
  if (id === "server-only") return {}
  return origRequire.apply(this, [id, ...args])
}

import { config } from "dotenv"
import { resolve } from "node:path"
import { existsSync, readFileSync } from "node:fs"
import { randomBytes } from "node:crypto"

// Load environment variables from .env.local or .env
const envLocal = resolve(process.cwd(), ".env.local")
const envDefault = resolve(process.cwd(), ".env")

if (existsSync(envLocal)) {
  config({ path: envLocal })
} else if (existsSync(envDefault)) {
  config({ path: envDefault })
}

import { pool, db } from "../lib/db"
import { invoices, siteSettings } from "../lib/db/schema"
import { ensureSchema } from "../lib/db/migrate"
import { eq } from "drizzle-orm"

const newToken = () => randomBytes(18).toString("base64url")

async function migrateInvoices() {
  console.log("🚀 Starting Invoice Migration from Invoice Generator CSV...")

  try {
    console.log("📦 Ensuring database schema...")
    await ensureSchema()
    console.log("✓ Schema verified.")

    // 1. Update business bank / payment settings
    const paymentInstructions = [
      "A/C Holder Name: PRAJESH SHAKYA",
      "Account Number: 03407010002740",
      "Bank Name: GLOBAL IME BANK",
      "Branch: Tripureshwor",
      "Swift code: GLBBNPKA",
      "Wise: https://wise.com/pay/me/prajeshs8",
    ].join("\n")

    const [existingSettings] = await db.select().from(siteSettings).where(eq(siteSettings.key, "business")).limit(1)
    const currentVal = (existingSettings?.value as Record<string, any>) || {}
    const updatedSettings = {
      ...currentVal,
      businessName: currentVal.businessName || "Prajesh Shakya",
      tagline: currentVal.tagline || "Brand Identity Designer",
      address: currentVal.address || "Tripureshwor, Kathmandu, Nepal",
      currencies: {
        ...(currentVal.currencies || {}),
        NPR: {
          taxLabel: "VAT",
          taxRate: 0,
          paymentInstructions,
          ...(currentVal.currencies?.NPR || {}),
        },
        AUD: {
          taxLabel: "GST",
          taxRate: 0,
          paymentInstructions,
          ...(currentVal.currencies?.AUD || {}),
        },
        USD: {
          taxLabel: "Tax",
          taxRate: 0,
          paymentInstructions,
          ...(currentVal.currencies?.USD || {}),
        },
      },
    }

    await db
      .insert(siteSettings)
      .values({ key: "business", value: updatedSettings, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: updatedSettings, updatedAt: new Date() } })

    console.log("✓ Business & Bank payment instructions updated.")

    // 2. Read seed invoices
    const seedFilePath = resolve(process.cwd(), "data/invoices-seed.json")
    const seedData = JSON.parse(readFileSync(seedFilePath, "utf-8"))

    let inserted = 0
    let updated = 0

    for (const doc of seedData) {
      const [existing] = await db.select().from(invoices).where(eq(invoices.number, doc.number)).limit(1)

      if (existing) {
        await db
          .update(invoices)
          .set({
            clientName: doc.clientName,
            clientCompany: doc.clientCompany,
            clientEmail: doc.clientEmail,
            currency: doc.currency,
            items: doc.items,
            total: doc.total,
            taxRate: doc.taxRate,
            issueDate: doc.issueDate,
            dueDate: doc.dueDate,
            notes: doc.notes,
            paymentLink: doc.paymentLink || null,
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, existing.id))
        updated++
        console.log(`  ↻ Updated ${doc.kind.toUpperCase()}: ${doc.number} (${doc.clientName} - ${doc.currency} ${doc.total})`)
      } else {
        await db.insert(invoices).values({
          kind: doc.kind,
          number: doc.number,
          status: doc.status || "draft",
          clientName: doc.clientName,
          clientCompany: doc.clientCompany,
          clientEmail: doc.clientEmail,
          currency: doc.currency,
          items: doc.items,
          total: doc.total,
          taxRate: doc.taxRate,
          issueDate: doc.issueDate,
          dueDate: doc.dueDate,
          notes: doc.notes,
          paymentLink: doc.paymentLink || null,
          publicToken: newToken(),
        })
        inserted++
        console.log(`  + Inserted ${doc.kind.toUpperCase()}: ${doc.number} (${doc.clientName} - ${doc.currency} ${doc.total})`)
      }
    }

    console.log(`\n🎉 Done! Inserted: ${inserted}, Updated: ${updated} (Total: ${seedData.length} documents)`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

void migrateInvoices()
