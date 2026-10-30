import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { auth, isAdminUser } from "@/lib/auth"
import { getBlobToken } from "@/lib/blob"

// Issues short-lived upload tokens so the admin can send files straight from
// the browser to Vercel Blob. Only the authenticated admin receives a token.

const MB = 1024 * 1024
const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const DOCUMENT_TYPES = ["application/pdf"]
const PORTFOLIO_MEDIA_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOCUMENT_TYPES]

const RULES = [
  { prefix: "portfolio/showcase/", types: VIDEO_TYPES, maxBytes: 150 * MB },
  { prefix: "portfolio/", types: PORTFOLIO_MEDIA_TYPES, maxBytes: 100 * MB },
  { prefix: "clients/", types: IMAGE_TYPES, maxBytes: 12 * MB },
  { prefix: "moodboards/", types: [...IMAGE_TYPES, ...DOCUMENT_TYPES], maxBytes: 30 * MB },
]

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody
    const result = await handleUpload({
      body,
      request,
      token: getBlobToken(),
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!isAdminUser(session?.user)) throw new Error("Unauthorized")

        // Prevent directory traversal attacks
        if (pathname.includes("..") || pathname.includes("//")) {
          throw new Error("This upload location is not allowed")
        }

        const rule = RULES.find((candidate) => pathname.startsWith(candidate.prefix))
        if (!rule) throw new Error("This upload location is not allowed")

        return {
          allowedContentTypes: rule.types,
          maximumSizeInBytes: rule.maxBytes,
          addRandomSuffix: true,
        }
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 }
    )
  }
}
