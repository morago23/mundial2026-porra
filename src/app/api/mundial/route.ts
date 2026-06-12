import { NextRequest, NextResponse } from "next/server";

// Proxy for worldcup26.ir API to avoid CORS issues
// Response is cached at the edge by Vercel

const API_BASE = "https://worldcup26.ir/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/matches";

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MundialPorra2026/1.0",
      },
      // Revalidate every 2 hours on Vercel
      next: { revalidate: 7200 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("World Cup API proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from World Cup API", matches: [], groups: [] },
      { status: 200 } // Return 200 so client handles empty gracefully
    );
  }
}
