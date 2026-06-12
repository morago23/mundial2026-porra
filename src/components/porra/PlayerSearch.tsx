"use client";

import { useState, useRef, useEffect } from "react";
import { searchPlayers, PLAYERS } from "@/lib/data/players";
import { TEAMS_BY_CODE } from "@/lib/data/teams";

interface PlayerSearchProps {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PlayerSearch({
  label,
  icon,
  value,
  onChange,
  disabled,
}: PlayerSearchProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = searchPlayers(query);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(name: string) {
    onChange(name);
    setQuery(name);
    setOpen(false);
  }

  return (
    <div className="form-group">
      <label className="form-label">
        {icon} {label}
      </label>
      <div className="autocomplete-wrapper" ref={wrapperRef}>
        <input
          type="text"
          className="form-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Escribe el nombre del jugador..."
          disabled={disabled}
          autoComplete="off"
        />
        {open && results.length > 0 && (
          <div className="autocomplete-dropdown">
            {results.map((player) => {
              const team = TEAMS_BY_CODE[player.teamCode];
              return (
                <div
                  key={player.name}
                  className="autocomplete-item"
                  onMouseDown={() => handleSelect(player.name)}
                >
                  <span className="autocomplete-item-flag">{team?.flag ?? "🏳️"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{player.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {team?.name ?? player.teamCode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
