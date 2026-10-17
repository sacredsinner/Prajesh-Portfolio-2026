import { documentPdf, findDocumentByToken } from "@/lib/documents"

// The PDF of a quote or invoice: /i/<token>/pdf
export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const row = await findDocumentByToken(token)
  if (!row) return new Response("Not found", { status: 404 })
  const { bytes, filename } = await documentPdf(row)
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  })
}
