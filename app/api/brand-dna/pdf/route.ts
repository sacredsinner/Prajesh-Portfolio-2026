import { NextResponse } from "next/server"
import { buildBrandDnaPdf } from "@/lib/pdf/brand-dna-pdf"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const pdfBytes = await buildBrandDnaPdf()

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="prajesh-shakya-brand-dna.pdf"',
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    })
  } catch (error: any) {
    console.error("[brand-dna-pdf] Failed to generate PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate Brand DNA PDF", details: error?.message },
      { status: 500 }
    )
  }
}
