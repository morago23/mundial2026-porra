"use client";

import { WCMatch } from "@/lib/api/worldcup";
import { TEAMS_BY_CODE } from "@/lib/data/teams";

interface MatchCardProps {
  match: WCMatch;
}

export default function MatchCard({ match }: MatchCardProps) {
  const homeTeam = TEAMS_BY_CODE[match.homeTeam?.code] ?? { name: match.homeTeam?.name, flag: "🏳️" };
  const awayTeam = TEAMS_BY_CODE[match.awayTeam?.code] ?? { name: match.awayTeam?.name, flag: "🏳️" };

  const statusClass =
    match.status === "LIVE" || match.status === "in_play"
      ? "live"
      : match.status === "FINISHED" || match.status === "FT"
      ? "finished"
      : "scheduled";

  const statusLabel =
    match.status === "LIVE" || match.status === "in_play"
      ? "⚡ En vivo"
      : match.status === "FINISHED" || match.status === "FT"
      ? "Final"
      : formatDateTime(match.datetime);

  const hasScore =
    match.homeScore !== null && match.awayScore !== null;

  return (
    <div className="match-card animate-in">
      {/* Home team */}
      <div className="match-team home">
        <span className="match-flag">{homeTeam.flag}</span>
        <span className="match-team-name">{homeTeam.name}</span>
      </div>

      {/* Score / time */}
      <div className="match-score">
        {hasScore ? (
          <div className="score-display">
            <span>{match.homeScore}</span>
            <span className="score-separator">-</span>
            <span>{match.awayScore}</span>
          </div>
        ) : (
          <div className="score-display" style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
            vs
          </div>
        )}
        <span className={`match-status ${statusClass}`}>{statusLabel}</span>
      </div>

      {/* Away team */}
      <div className="match-team away">
        <span className="match-flag">{awayTeam.flag}</span>
        <span className="match-team-name">{awayTeam.name}</span>
      </div>
    </div>
  );
}

function formatDateTime(datetime: string): string {
  if (!datetime) return "";
  try {
    const d = new Date(datetime);
    return d.toLocaleString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return datetime;
  }
}
