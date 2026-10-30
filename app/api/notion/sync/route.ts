import { NextRequest, NextResponse } from "next/server"
import { syncNotionNotesToDatabase } from "@/lib/notion"
import { auth, isAdminUser } from "@/lib/auth"

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.NOTION_SYNC_SECRET || process.env.BETTER_AUTH_SECRET
  const url = new URL(req.url)
  const tokenFromQuery = url.searchParams.get("secret") || url.searchParams.get("token")
  const authHeader = req.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (secret && (tokenFromQuery === secret || bearerToken === secret)) {
    return true
  }

  // Check admin session if called directly from browser or admin dashboard
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (session && isAdminUser(session.user)) {
      return true
    }
  } catch {
    // ignore
  }

  // Allow in development without secret if not configured
  if (process.env.NODE_ENV === "development" && !secret) {
    return true
  }

  return false
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncNotionNotesToDatabase()
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Sync failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
