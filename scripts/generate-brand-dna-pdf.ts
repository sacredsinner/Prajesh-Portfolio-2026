import fs from "node:fs/promises"
import path from "node:path"
import { buildBrandDnaPdf } from "../lib/pdf/brand-dna-pdf"

async function main() {
  console.log("Generating Prajesh Shakya Brand DNA PDF...")
  const pdfBytes = await buildBrandDnaPdf()

  // Target 1: public/documents/
  const publicDocsDir = path.join(process.cwd(), "public", "documents")
  await fs.mkdir(publicDocsDir, { recursive: true })
  const publicPdfPath = path.join(publicDocsDir, "prajesh-shakya-brand-dna.pdf")
  await fs.writeFile(publicPdfPath, Buffer.from(pdfBytes))
  console.log(`Saved public PDF to: ${publicPdfPath} (${(pdfBytes.length / 1024).toFixed(1)} KB)`)

  // Target 2: Root directory
  const rootPdfPath = path.join(process.cwd(), "Prajesh-Shakya-Brand-DNA.pdf")
  await fs.writeFile(rootPdfPath, Buffer.from(pdfBytes))
  console.log(`Saved root PDF to: ${rootPdfPath}`)

  // Target 3: Artifact directory
  const artifactDir = "C:\\Users\\blcne\\.gemini\\antigravity\\brain\\73afed7b-f00d-49d8-8d20-80d064c13651"
  try {
    const artifactPdfPath = path.join(artifactDir, "Prajesh-Shakya-Brand-DNA.pdf")
    await fs.writeFile(artifactPdfPath, Buffer.from(pdfBytes))
    console.log(`Saved artifact PDF to: ${artifactPdfPath}`)
  } catch (err) {
    console.warn("Could not write to artifact dir:", err)
  }

  console.log("PDF generation complete!")
}

main().catch((err) => {
  console.error("PDF generation failed:", err)
  process.exit(1)
})
