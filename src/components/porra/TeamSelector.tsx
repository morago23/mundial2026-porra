"use client";

import { useState } from "react";
import { TEAMS, Team, MAX_BUDGET, MAX_TEAMS, calcTotalValue, GROUPS } from "@/lib/data/teams";

interface TeamSelectorProps {
  selected: string[];
  onChange: (teams: string[]) => void;
  disabled?: boolean;
}

export default function TeamSelector({ selected, onChange, disabled }: TeamSelectorProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const totalValue = calcTotalValue(selected);
  const remaining = MAX_BUDGET - totalValue;
  const atLimit = selected.length >= MAX_TEAMS;

  function toggleTeam(code: string) {
    if (disabled) return;
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      if (atLimit) return;
      const team = TEAMS.find((t) => t.code === code);
      if (!team) return;
      if (totalValue + team.value > MAX_BUDGET) return;
      onChange([...selected, code]);
    }
  }

  const displayedTeams = (activeGroup
    ? TEAMS.filter((t) => t.group === activeGroup)
    : [...TEAMS]).sort((a, b) => b.value - a.value);

  return (
    <div>
      {/* Group filter */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        overflowX: "auto", 
        paddingBottom: "8px",
        marginBottom: "12px",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none"
      }}>
        <button
          className={`tab ${activeGroup === null ? "active" : ""}`}
          onClick={() => setActiveGroup(null)}
          style={{ padding: "6px 16px", fontSize: "0.8rem" }}
        >
          Todos
        </button>
        {GROUPS.map((g) => (
          <button
            key={g}
            className={`tab ${activeGroup === g ? "active" : ""}`}
            onClick={() => setActiveGroup(g)}
            style={{ padding: "6px 14px", fontSize: "0.8rem" }}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      {/* Team grid */}
      <div className="team-grid">
        {displayedTeams.map((team) => {
          const isSelected = selected.includes(team.code);
          const isDisabledByBudget =
            !isSelected && totalValue + team.value > MAX_BUDGET;
          const isDisabledByLimit = !isSelected && atLimit;
          const isDisabled = disabled || isDisabledByBudget || isDisabledByLimit;

          return (
            <TeamChip
              key={team.code}
              team={team}
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => toggleTeam(team.code)}
            />
          );
        })}
      </div>

      {/* Status */}
      <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <span className={`badge ${atLimit ? "badge-gold" : "badge-blue"}`}>
          {selected.length}/{MAX_TEAMS} equipos
        </span>
        <span className={`badge ${remaining < 0 ? "badge-red" : remaining < 5 ? "badge-gold" : "badge-green"}`}>
          Presupuesto restante: {remaining.toFixed(1)} pts
        </span>
      </div>
    </div>
  );
}

function TeamChip({
  team,
  selected,
  disabled,
  onClick,
}: {
  team: Team;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`team-chip ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      type="button"
      title={`${team.name} — Valor: ${team.value}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
        <span className="team-chip-flag">{team.flag}</span>
        <span className="team-chip-name">{team.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span className="team-chip-value">{team.value} pts</span>
        {selected && <span className="team-chip-check">✓</span>}
      </div>
    </button>
  );
}
