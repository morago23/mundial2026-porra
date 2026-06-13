"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signOutUser } from "@/lib/firebase/auth";
import { useState, useEffect, useRef } from "react";
import { getUserLeagues, getApuestas, Porra, Apuesta } from "@/lib/firebase/firestore";
import { fetchMatches, fetchGroups, mapToMatchResults, mapToGroupStandings } from "@/lib/api/worldcup";
import { calculateScore } from "@/lib/scoring/calculator";
import { TEAMS_BY_CODE } from "@/lib/data/teams";
import { useRouter } from "next/navigation";

interface PlayerScore {
  apuesta: Apuesta;
  total: number;
  detail: string[];
}

interface LeagueDetail {
  porra: Porra;
  apuesta: Apuesta;
  scores?: PlayerScore[];
  loadingScores?: boolean;
}

export default function Navbar() {
  const { user, loading } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [leagues, setLeagues] = useState<LeagueDetail[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) {
      setTimeout(() => document.addEventListener("mousedown", handleClick), 50);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen]);

  // Load leagues when panel opens
  useEffect(() => {
    if (panelOpen && user && leagues.length === 0) {
      setLoadingLeagues(true);
      getUserLeagues(user.uid)
        .then((data) => setLeagues(data.map((d) => ({ ...d }))))
        .catch(console.error)
        .finally(() => setLoadingLeagues(false));
    }
  }, [panelOpen, user]);

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  async function toggleLeague(porraId: string) {
    if (expandedLeague === porraId) {
      setExpandedLeague(null);
      return;
    }
    setExpandedLeague(porraId);
    setExpandedPlayer(null);

    // Load scores for this league if not loaded yet
    const idx = leagues.findIndex((l) => l.porra.id === porraId);
    if (idx === -1 || leagues[idx].scores) return;

    setLeagues((prev) =>
      prev.map((l, i) => i === idx ? { ...l, loadingScores: true } : l)
    );

    try {
      const [apuestas, matches, groups] = await Promise.all([
        getApuestas(porraId),
        fetchMatches(),
        fetchGroups(),
      ]);
      const matchResults = mapToMatchResults(matches);
      const groupStandings = mapToGroupStandings(groups);

      const scored: PlayerScore[] = apuestas.map((a) => {
        const breakdown = calculateScore(
          { teams: a.teams, mvp: a.mvp, pichichi: a.pichichi, guanteOro: a.guanteOro, mejorJoven: a.mejorJoven },
          matchResults, groupStandings, {}
        );
        return { apuesta: a, total: breakdown.total, detail: breakdown.detail };
      });
      scored.sort((a, b) => b.total - a.total);

      setLeagues((prev) =>
        prev.map((l, i) => i === idx ? { ...l, scores: scored, loadingScores: false } : l)
      );
    } catch {
      setLeagues((prev) =>
        prev.map((l, i) => i === idx ? { ...l, loadingScores: false } : l)
      );
    }
  }

  function closePanel() {
    setPanelOpen(false);
    setExpandedLeague(null);
    setExpandedPlayer(null);
  }

  return (
    <>
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" className="navbar-brand">
            <span className="trophy">🏆</span>
            <span>Porra Mundial 2026</span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Cambiar tema">
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {!loading && !user && (
            <button className="btn btn-primary btn-sm" onClick={() => signInWithGoogle()}>
              Entrar
            </button>
          )}

          {!loading && user && (
            <div className="nav-user-area" ref={panelRef}>
              <button className="avatar-btn" onClick={() => setPanelOpen((p) => !p)}>
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" className="nav-avatar" referrerPolicy="no-referrer" />
                ) : (
                  <div className="nav-avatar nav-avatar-initials">
                    {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="nav-user-name">{user.displayName?.split(" ")[0]}</div>
                <span className="nav-chevron">{panelOpen ? "▲" : "▼"}</span>
              </button>

              {panelOpen && (
                <div className="nav-panel animate-panel">
                  {/* User info */}
                  <div className="nav-panel-user">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoURL} alt="" className="nav-panel-avatar" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="nav-panel-avatar nav-avatar-initials">
                        {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{user.displayName}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user.email}</div>
                    </div>
                  </div>

                  <div className="nav-panel-divider" />

                  {/* Leagues */}
                  <div className="nav-panel-section-title">Tus Ligas</div>

                  {loadingLeagues ? (
                    <div className="nav-panel-empty">Cargando ligas...</div>
                  ) : leagues.length === 0 ? (
                    <div className="nav-panel-empty">Aún no estás en ninguna liga</div>
                  ) : (
                    leagues.map((item) => (
                      <Link
                        href={`/porra/${item.porra.id}`}
                        key={item.porra.id}
                        className="nav-panel-item"
                        style={{ border: "1px solid rgba(201,162,39,0.15)", marginBottom: "4px" }}
                        onClick={closePanel}
                      >
                        <span>🏆</span> {item.porra.name}
                      </Link>
                    ))
                  )}

                  <div className="nav-panel-divider" />

                  <Link href="/crear-porra" className="nav-panel-item" onClick={closePanel}>
                    <span>✨</span> Crear nueva liga
                  </Link>
                  <Link href="/unirse" className="nav-panel-item" onClick={closePanel}>
                    <span>🔗</span> Unirse con código
                  </Link>
                  <Link href="/#resultados" className="nav-panel-item" onClick={closePanel}>
                    <span>⚽</span> Resultados en vivo
                  </Link>
                  <Link href="/#grupos" className="nav-panel-item" onClick={closePanel}>
                    <span>📊</span> Clasificación Grupos
                  </Link>

                  <div className="nav-panel-divider" />

                  <button className="nav-panel-item nav-panel-danger" onClick={() => { signOutUser(); closePanel(); }}>
                    <span>👋</span> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Backdrop for mobile */}
      {panelOpen && (
        <div className="nav-panel-backdrop" onClick={closePanel} />
      )}
    </>
  );
}
