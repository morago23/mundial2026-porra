"use client";

import { useState } from "react";
import { calcTotalValue } from "@/lib/data/teams";
import { TEAMS_BY_CODE } from "@/lib/data/teams";
import { MAX_BUDGET } from "@/lib/data/teams";

interface BudgetMeterProps {
  selectedTeams: string[];
}

export default function BudgetMeter({ selectedTeams }: BudgetMeterProps) {
  const [expanded, setExpanded] = useState(false);
  const total = calcTotalValue(selectedTeams);
  const pct = Math.min((total / MAX_BUDGET) * 100, 100);
  const isDanger = total > MAX_BUDGET;

  return (
    <div className={`budget-meter-container sticky-budget ${expanded ? "expanded" : ""}`}>
      <div className="budget-meter-toggle" onClick={() => setExpanded(!expanded)}>
        <span style={{ fontWeight: 600, color: "var(--gold)" }}>
          Presupuesto: {total.toFixed(1)} / {MAX_BUDGET}
        </span>
        <span style={{ color: "var(--text-muted)" }}>
          {expanded ? "▼ Ocultar" : "▲ Ver equipos"}
        </span>
      </div>

      <div className="budget-meter">
        <div className="budget-title" style={{ display: "none" }}>Presupuesto</div>

      <div className="budget-numbers">
        <span className="budget-used" style={{ color: isDanger ? "var(--red)" : "var(--gold)" }}>
          {total.toFixed(1)}
        </span>
        <span className="budget-total">/ {MAX_BUDGET}</span>
      </div>

      <div className="budget-bar-track">
        <div
          className={`budget-bar-fill ${isDanger ? "danger" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <span>{selectedTeams.length}/10 equipos</span>
        <span style={{ color: isDanger ? "var(--red)" : "var(--text-secondary)" }}>
          Restante: {(MAX_BUDGET - total).toFixed(1)}
        </span>
      </div>

      {selectedTeams.length > 0 && (
        <div className="budget-teams">
          {selectedTeams.map((code) => {
            const team = TEAMS_BY_CODE[code];
            return (
              <div key={code} className="budget-team-row">
                <span className="budget-team-name">
                  <span>{team?.flag ?? "🏳️"}</span>
                  {team?.name ?? code}
                </span>
                <span className="budget-team-value">{team?.value ?? 0}</span>
              </div>
            );
          })}
        </div>
      )}

        {selectedTeams.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", padding: "12px 0" }}>
            Selecciona tus 10 equipos
          </div>
        )}
      </div>
    </div>
  );
}
