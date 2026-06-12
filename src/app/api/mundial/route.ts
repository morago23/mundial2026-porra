import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") ?? "/matches";

  if (path === "/matches") {
    return NextResponse.json({
      matches: [
        {
          id: "m1",
          homeTeam: { code: "ESP", name: "España" },
          awayTeam: { code: "POR", name: "Portugal" },
          homeScore: 2,
          awayScore: 1,
          status: "LIVE",
          stage: "GROUP",
          group: "H",
          datetime: new Date().toISOString()
        },
        {
          id: "m2",
          homeTeam: { code: "ARG", name: "Argentina" },
          awayTeam: { code: "FRA", name: "Francia" },
          homeScore: 0,
          awayScore: 0,
          status: "SCHEDULED",
          stage: "FINAL",
          datetime: new Date(Date.now() + 86400000).toISOString()
        },
        {
          id: "m3",
          homeTeam: { code: "BRA", name: "Brasil" },
          awayTeam: { code: "GER", name: "Alemania" },
          homeScore: 3,
          awayScore: 1,
          status: "FINISHED",
          stage: "GROUP",
          group: "E",
          datetime: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "m4",
          homeTeam: { code: "ENG", name: "Inglaterra" },
          awayTeam: { code: "ITA", name: "Italia" },
          homeScore: 1,
          awayScore: 1,
          status: "FINISHED",
          stage: "GROUP",
          group: "A",
          datetime: new Date(Date.now() - 186400000).toISOString()
        }
      ]
    });
  }

  if (path === "/groups") {
    return NextResponse.json({
      groups: [
        {
          group: "A",
          teams: [
            { code: "ENG", name: "Inglaterra", played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 5, goalsAgainst: 2, points: 7, position: 1 },
            { code: "ITA", name: "Italia", played: 3, won: 1, drawn: 2, lost: 0, goalsFor: 3, goalsAgainst: 2, points: 5, position: 2 },
            { code: "USA", name: "Estados Unidos", played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 4, points: 3, position: 3 },
            { code: "MEX", name: "México", played: 3, won: 0, drawn: 1, lost: 2, goalsFor: 1, goalsAgainst: 3, points: 1, position: 4 }
          ]
        },
        {
          group: "H",
          teams: [
            { code: "ESP", name: "España", played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 4, goalsAgainst: 1, points: 6, position: 1 },
            { code: "POR", name: "Portugal", played: 2, won: 1, drawn: 0, lost: 1, goalsFor: 2, goalsAgainst: 2, points: 3, position: 2 }
          ]
        }
      ]
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
