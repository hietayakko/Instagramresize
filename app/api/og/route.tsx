import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    // Get the search params
    const { searchParams } = new URL(req.url)

    // Get the title from the search params or use a default
    const title = searchParams.get("title") || "Instagram画像リサイザー"

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "50px 200px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="18" cy="6" r="1" />
          </svg>
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 60, fontWeight: "bold" }}>{title}</div>
            <div style={{ fontSize: 30, marginTop: 20, opacity: 0.8 }}>Instagramの4:5比率に画像をリサイズ</div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    console.error(e)
    return new Response("OG画像の生成に失敗しました", { status: 500 })
  }
}
