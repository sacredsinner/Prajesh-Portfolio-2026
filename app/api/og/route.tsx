import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get("title")?.slice(0, 100) || "Prajesh Shakya"
    const category = searchParams.get("category")?.slice(0, 40) || "Brand Identity & Systems"
    const subtitle =
      searchParams.get("subtitle")?.slice(0, 140) ||
      "Senior brand identity designer & design systems architect based in Kathmandu."

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#080808",
            padding: "64px 80px",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            border: "12px solid #141414",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(24, 119, 242, 0.12) 0%, rgba(0, 0, 0, 0) 70%)",
            }}
          />

          {/* Top Bar: Brand & Category Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                }}
              />
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#ffffff",
                  textTransform: "uppercase",
                }}
              >
                Prajesh Shakya
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "9999px",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                fontSize: "16px",
                color: "#e5e5e5",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {category}
            </div>
          </div>

          {/* Center Title & Subtitle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "1000px",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 40 ? "54px" : "68px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
                lineHeight: 1.4,
                margin: 0,
                maxWidth: "850px",
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom Bar: Meta & URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              paddingTop: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  color: "#71717a",
                  fontWeight: 500,
                }}
              >
                Portfolio & Selected Works 2026
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "18px",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "0.02em",
              }}
            >
              shakyaprajesh.com.np
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 })
  }
}
