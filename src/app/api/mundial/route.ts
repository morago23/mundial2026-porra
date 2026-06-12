import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.worldcupapi.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/fixtures";

  const apiKey = process.env.WORLDCUP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Missing WORLDCUP_API_KEY environment variable." },
      { status: 500 }
    );
  }

  // To support query params passed directly from client
  const queryToForward = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key !== "path") queryToForward.set(key, value);
  }
  queryToForward.set("key", apiKey);

  const targetUrl = `${API_BASE}${path}?${queryToForward.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "PorraMundialista/2.0",
      },
      next: { revalidate: 60 }, // Cache on Vercel for 60 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `API Error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Add caching headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("World Cup API proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to World Cup API", data: [] },
      { status: 200 } // Return 200 so client doesn't hard crash and can render empty states
    );
  }
}
