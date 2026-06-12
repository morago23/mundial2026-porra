import { MatchResult, GroupStanding } from "@/lib/scoring/calculator";

const API_BASE = "https://worldcup26.ir/api";
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours in ms

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore storage errors
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAPI(path: string): Promise<any> {
  const res = await fetch(`/api/mundial?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface WCMatch {
  id: string | number;
  homeTeam: { code: string; name: string };
  awayTeam: { code: string; name: string };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  stage: string;
  group?: string;
  datetime: string;
  venue?: string;
}

export interface WCGroup {
  group: string;
  teams: Array<{
    code: string;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    position: number;
  }>;
}

export async function fetchMatches(): Promise<WCMatch[]> {
  const cached = getCache<WCMatch[]>("wc_matches");
  if (cached) return cached;

  try {
    const response = await fetchAPI("/matches?year=2026");

    // Format matches from the payload
    const rawMatches = response.data || response.matches || (Array.isArray(response) ? response : []);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches: WCMatch[] = rawMatches.map((m: any) => {
      const hName = typeof m.homeTeam === 'string' ? m.homeTeam : (m.homeTeam?.name || m.home_team_name || "TBD");
      const aName = typeof m.awayTeam === 'string' ? m.awayTeam : (m.awayTeam?.name || m.away_team_name || "TBD");
      return {
        id: m.id || m._id || Math.random().toString(),
        homeTeam: { code: hName, name: hName },
        awayTeam: { code: aName, name: aName },
        homeScore: m.homeScore ?? m.home_score ?? null,
        awayScore: m.awayScore ?? m.away_score ?? null,
        status: m.status || "SCHEDULED",
        stage: m.stage || "GROUP",
        group: m.group || m.group_name || undefined,
        datetime: m.kickoffUtc || m.datetime || m.date || new Date().toISOString(),
      };
    });

    // Deduplicate by ID
    const uniqueMatches = Array.from(new Map(matches.map((m) => [m.id, m])).values());

    setCache("wc_matches", uniqueMatches);
    return uniqueMatches;
  } catch (err) {
    console.error("Failed to fetch matches:", err);
    return [];
  }
}

export async function fetchGroups(): Promise<WCGroup[]> {
  const cached = getCache<WCGroup[]>("wc_groups");
  if (cached) return cached;

  try {
    const data = await fetchAPI("/standings?year=2026");
    let groups: WCGroup[] = [];
    
    // Zafronix format: { groups: { "A": [...teams], "B": [...teams] } }
    if (data.groups && !Array.isArray(data.groups) && typeof data.groups === "object") {
      groups = Object.keys(data.groups).map((groupKey) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const teams = data.groups[groupKey].map((t: any) => {
          const tName = typeof t.team === "string" ? t.team : (t.name || t.team_name || "?");
          return {
            code: tName,
            name: tName,
            played: t.played || t.p || 0,
            won: t.won || t.w || 0,
            drawn: t.drawn || t.d || 0,
            lost: t.lost || t.l || 0,
            goalsFor: t.goalsFor || t.gf || 0,
            goalsAgainst: t.goalsAgainst || t.ga || 0,
            points: t.points || t.pts || 0,
            position: t.position || t.pos || 0,
          };
        });
        return { group: groupKey, teams };
      });
    } else if (data.data && Array.isArray(data.data)) {
      // Fallback for other array formats
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      groups = data.data.map((g: any) => ({
        group: g.group || g.letter || "?",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        teams: (g.teams || g.standings || []).map((t: any) => {
          const tName = typeof t.team === "string" ? t.team : (t.name || t.team_name || "?");
          return {
            code: tName,
            name: tName,
            played: t.played || t.p || 0,
            won: t.won || t.w || 0,
            drawn: t.drawn || t.d || 0,
            lost: t.lost || t.l || 0,
            goalsFor: t.goalsFor || t.gf || 0,
            goalsAgainst: t.goalsAgainst || t.ga || 0,
            points: t.points || t.pts || 0,
            position: t.position || t.pos || 0,
          };
        })
      }));
    } else {
      groups = Array.isArray(data) ? data : data.groups ?? [];
    }
    
    setCache("wc_groups", groups);
    return groups;
  } catch (err) {
    console.error("Failed to fetch groups:", err);
    return [];
  }
}

export function mapToMatchResults(matches: WCMatch[]): MatchResult[] {
  return matches.map((m) => {
    let stage: MatchResult["stage"] = "GROUP";
    const stageRaw = (m.stage ?? "").toLowerCase();
    if (stageRaw.includes("final") && stageRaw.includes("third")) stage = "THIRD";
    else if (stageRaw.includes("final")) stage = "FINAL";
    else if (stageRaw.includes("semi")) stage = "SF";
    else if (stageRaw.includes("quarter")) stage = "QF";
    else if (stageRaw.includes("round of 16") || stageRaw.includes("octavo")) stage = "R16";

    let status: MatchResult["status"] = "SCHEDULED";
    const statusRaw = (m.status ?? "").toLowerCase();
    if (statusRaw === "finished" || statusRaw === "ft") status = "FINISHED";
    else if (statusRaw === "live" || statusRaw === "in_play") status = "LIVE";

    return {
      homeTeam: m.homeTeam.code,
      awayTeam: m.awayTeam.code,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status,
      stage,
      group: m.group,
    };
  });
}

export function mapToGroupStandings(groups: WCGroup[]): GroupStanding[] {
  const standings: GroupStanding[] = [];
  for (const g of groups) {
    const sorted = [...g.teams].sort((a, b) => b.points - a.points);
    sorted.forEach((team, idx) => {
      standings.push({
        teamCode: team.code,
        position: idx + 1,
        advancesToKnockout: idx < 2, // top 2 auto-advance; 3rd best handled separately
        isThirdAdvancing: false, // updated separately when 3rd-place teams are known
      });
    });
  }
  return standings;
}

export function getLastUpdated(): string | null {
  try {
    const raw = localStorage.getItem("wc_matches");
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    return new Date(entry.timestamp).toLocaleString("es-ES");
  } catch {
    return null;
  }
}

export function clearCache(): void {
  localStorage.removeItem("wc_matches");
  localStorage.removeItem("wc_groups");
}
