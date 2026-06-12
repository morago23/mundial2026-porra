import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.zafronix.com/fifa/worldcup/v1";

// Cache aggressive configuration
export const revalidate = 900; // 15 minutes (to keep under 250 requests/day limit)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/tournaments/2026/matches";

  const apiKey = process.env.ZAFRONIX_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Missing ZAFRONIX_API_KEY environment variable." },
      { status: 500 }
    );
  }

  // To support query params passed directly from client
  const queryToForward = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key !== "path") queryToForward.set(key, value);
  }

  const queryString = queryToForward.toString();
  const targetUrl = `${API_BASE}${path}${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey, // Zafronix requires this header instead of a query parameter
        "User-Agent": "PorraMundialista/2.0",
      },
      next: { revalidate: 900 }, // Ensure fetch is cached for 15 mins by Next.js Data Cache
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Zafronix API Error (${response.status}):`, errText);
      return NextResponse.json(
        { success: false, error: `API Error: ${response.status}`, details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Add CDN caching headers
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Zafronix API proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to Zafronix API", data: [] },
      { status: 200 } // Return 200 so client doesn't hard crash and can render empty states
    );
  }
}
