import { Client } from "@notionhq/client"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"
import { config } from "dotenv"

// Load env
const envLocal = resolve(process.cwd(), ".env.local")
const envDefault = resolve(process.cwd(), ".env")

if (existsSync(envLocal)) {
  config({ path: envLocal })
} else if (existsSync(envDefault)) {
  config({ path: envDefault })
}

const NOTION_API_KEY = process.env.NOTION_API_KEY || process.argv[2]
const TARGET_PARENT_ID = process.env.NOTION_PARENT_PAGE_ID || process.env.NOTION_DATABASE_ID || process.argv[3]

if (!NOTION_API_KEY) {
  console.error("❌ Error: NOTION_API_KEY is not defined in .env.local or passed as an argument.")
  console.log("\nUsage:")
  console.log("  pnpm.cmd tsx scripts/export-copy-to-notion.ts <NOTION_API_KEY> <TARGET_PAGE_OR_DB_ID>")
  process.exit(1)
}

const notion = new Client({ auth: NOTION_API_KEY })

function truncate(str: string, maxLength = 2000): string {
  return str.length > maxLength ? str.slice(0, maxLength) : str
}

interface RichTextItem {
  type: "text"
  text: { content: string; link: { url: string } | null }
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
  }
}

function parseInlineFormatting(text: string): RichTextItem[] {
  const result: RichTextItem[] = []
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        text: { content: truncate(text.slice(lastIndex, match.index)), link: null },
      })
    }

    const token = match[0]
    if (token.startsWith("**") && token.endsWith("**")) {
      result.push({
        type: "text",
        text: { content: truncate(token.slice(2, -2)), link: null },
        annotations: { bold: true },
      })
    } else if (token.startsWith("*") && token.endsWith("*")) {
      result.push({
        type: "text",
        text: { content: truncate(token.slice(1, -1)), link: null },
        annotations: { italic: true },
      })
    } else if (token.startsWith("`") && token.endsWith("`")) {
      result.push({
        type: "text",
        text: { content: truncate(token.slice(1, -1)), link: null },
        annotations: { code: true },
      })
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        result.push({
          type: "text",
          text: { content: truncate(linkMatch[1]), link: { url: linkMatch[2] } },
        })
      } else {
        result.push({
          type: "text",
          text: { content: truncate(token), link: null },
        })
      }
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    result.push({
      type: "text",
      text: { content: truncate(text.slice(lastIndex)), link: null },
    })
  }

  return result.length > 0 ? result : [{ type: "text", text: { content: truncate(text), link: null } }]
}

function markdownToNotionBlocks(markdown: string): any[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: any[] = []

  let inCodeBlock = false
  let codeBuffer: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Handle code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({
          object: "block",
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content: truncate(codeBuffer.join("\n")) } }],
            language: "markdown",
          },
        })
        codeBuffer = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    if (!trimmed) continue

    // Divider
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push({ object: "block", type: "divider", divider: {} })
      continue
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: { rich_text: parseInlineFormatting(trimmed.slice(2).trim()) },
      })
      continue
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: parseInlineFormatting(trimmed.slice(3).trim()) },
      })
      continue
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: parseInlineFormatting(trimmed.slice(4).trim()) },
      })
      continue
    }
    if (trimmed.startsWith("#### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: parseInlineFormatting(trimmed.slice(5).trim()) },
      })
      continue
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      blocks.push({
        object: "block",
        type: "quote",
        quote: { rich_text: parseInlineFormatting(trimmed.slice(2).trim()) },
      })
      continue
    }

    // Bulleted list item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: parseInlineFormatting(trimmed.slice(2).trim()) },
      })
      continue
    }

    // Numbered list item
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numberedMatch) {
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: { rich_text: parseInlineFormatting(numberedMatch[2].trim()) },
      })
      continue
    }

    // Default: Paragraph
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: parseInlineFormatting(trimmed) },
    })
  }

  return blocks
}

async function runExport() {
  console.log("🚀 Starting Notion Copy Deck Exporter...")

  const copyDeckPath = resolve(process.cwd(), "COPY_DECK.md")
  if (!existsSync(copyDeckPath)) {
    console.error(`❌ File not found: ${copyDeckPath}`)
    process.exit(1)
  }

  const rawMarkdown = readFileSync(copyDeckPath, "utf-8")
  console.log(`📄 Read COPY_DECK.md (${rawMarkdown.length} bytes)`)

  const allBlocks = markdownToNotionBlocks(rawMarkdown)
  console.log(`🧱 Converted markdown into ${allBlocks.length} Notion blocks.`)

  // First 100 blocks for page creation
  const initialBlocks = allBlocks.slice(0, 100)
  const remainingBlocks = allBlocks.slice(100)

  let parentParam: any = null

  if (TARGET_PARENT_ID) {
    const cleanId = TARGET_PARENT_ID.replace(/-/g, "")
    // Determine if parent is database or page
    try {
      await notion.databases.retrieve({ database_id: cleanId })
      parentParam = { database_id: cleanId }
      console.log(`🎯 Target parent identified as Database: ${cleanId}`)
    } catch {
      parentParam = { page_id: cleanId }
      console.log(`🎯 Target parent identified as Page: ${cleanId}`)
    }
  } else {
    // Search for any accessible page or workspace root
    console.log("🔍 No parent ID specified. Searching for accessible pages in your Notion workspace...")
    const searchRes = (await (notion as any).search({
      filter: { value: "page", property: "object" },
      page_size: 10,
    })) as { results: any[] }

    if (searchRes.results.length === 0) {
      console.error(
        "❌ No accessible pages found. Please create or share a page with your Notion integration, or provide NOTION_PARENT_PAGE_ID."
      )
      process.exit(1)
    }

    const firstPage = searchRes.results[0]
    parentParam = { page_id: firstPage.id }
    console.log(`🎯 Auto-selected parent page: ${firstPage.id} ("${firstPage.url || "Untitled"}")`)
  }

  // Create page
  console.log("📝 Creating Master Copy Deck page in Notion...")
  const pageProperties: any = parentParam.database_id
    ? {
        Name: {
          title: [{ type: "text", text: { content: "Prajesh Shakya — Complete Studio Copy Deck (2026)" } }],
        },
      }
    : {
        title: {
          title: [{ type: "text", text: { content: "Prajesh Shakya — Complete Studio Copy Deck (2026)" } }],
        },
      }

  const newPage: any = await notion.pages.create({
    parent: parentParam,
    icon: { type: "emoji", emoji: "✒️" },
    properties: pageProperties,
    children: initialBlocks,
  })

  console.log(`✅ Created page: ${newPage.url || newPage.id}`)

  // Append remaining blocks in batches of 100
  let appendedCount = initialBlocks.length
  while (remainingBlocks.length > 0) {
    const batch = remainingBlocks.splice(0, 100)
    console.log(`⏳ Appending batch (${batch.length} blocks)...`)
    await notion.blocks.children.append({
      block_id: newPage.id,
      children: batch,
    })
    appendedCount += batch.length
    console.log(`  ✓ Appended ${appendedCount} / ${allBlocks.length} blocks.`)
    // Small delay to respect Notion rate limits
    await new Promise((r) => setTimeout(r, 350))
  }

  console.log(`\n🎉 Success! All ${allBlocks.length} blocks successfully published to Notion.`)
  console.log(`🔗 Notion Page URL: ${newPage.url}`)
}

runExport().catch((err) => {
  console.error("❌ Export failed:", err.message || err)
  process.exit(1)
})
