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
    const data = await fetchAPI("/matches");
    const matches: WCMatch[] = Array.isArray(data) ? data : data.matches ?? [];
    setCache("wc_matches", matches);
    return matches;
  } catch (err) {
    console.error("Failed to fetch matches:", err);
    return [];
  }
}

export async function fetchGroups(): Promise<WCGroup[]> {
  const cached = getCache<WCGroup[]>("wc_groups");
  if (cached) return cached;

  try {
    const data = await fetchAPI("/groups");
    const groups: WCGroup[] = Array.isArray(data) ? data : data.groups ?? [];
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
