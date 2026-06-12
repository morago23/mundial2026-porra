"use client";

import { WCGroup } from "@/lib/api/worldcup";
import { TEAMS_BY_CODE } from "@/lib/data/teams";

interface GroupTableProps {
  group: WCGroup;
}

export default function GroupTable({ group }: GroupTableProps) {
  const sorted = [...group.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="group-card">
      <div className="group-header">Grupo {group.group}</div>
      <table className="group-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 20px", textAlign: "left", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Equipo</th>
            <th style={{ padding: "8px 8px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>PJ</th>
            <th style={{ padding: "8px 8px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>G</th>
            <th style={{ padding: "8px 8px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>E</th>
            <th style={{ padding: "8px 8px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>P</th>
            <th style={{ padding: "8px 8px", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>DG</th>
            <th style={{ padding: "8px 20px", textAlign: "center", fontSize: "0.7rem", color: "var(--gold)", fontWeight: "800" }}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, idx) => {
            const teamData = TEAMS_BY_CODE[team.code];
            const isQualified = idx < 2;
            return (
              <tr
                key={team.code}
                style={{
                  borderTop: "1px solid var(--border)",
                  background: isQualified
                    ? "rgba(46, 202, 106, 0.03)"
                    : "transparent",
                }}
              >
                <td style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ opacity: 0.5, fontSize: "0.75rem", width: "14px" }}>{idx + 1}</span>
                  <span style={{ fontSize: "1.1rem" }}>{teamData?.flag ?? "🏳️"}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: isQualified ? 600 : 400, color: isQualified ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {teamData?.name ?? team.name}
                  </span>
                  {isQualified && (
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                  )}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>{team.played ?? 0}</td>
                <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>{team.won ?? 0}</td>
                <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>{team.drawn ?? 0}</td>
                <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>{team.lost ?? 0}</td>
                <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {(team.goalsFor ?? 0) - (team.goalsAgainst ?? 0) >= 0
                    ? `+${(team.goalsFor ?? 0) - (team.goalsAgainst ?? 0)}`
                    : (team.goalsFor ?? 0) - (team.goalsAgainst ?? 0)}
                </td>
                <td style={{ padding: "10px 20px", textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--gold)", fontSize: "0.95rem" }}>
                  {team.points ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
