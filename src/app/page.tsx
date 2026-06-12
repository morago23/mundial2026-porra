"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMatches, fetchGroups, WCMatch, WCGroup, getLastUpdated, clearCache } from "@/lib/api/worldcup";
import MatchCard from "@/components/mundial/MatchCard";
import GroupTable from "@/components/mundial/GroupTable";

type Tab = "resultados" | "grupos" | "proximos";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("resultados");
  const [matches, setMatches] = useState<WCMatch[]>([]);
  const [groups, setGroups] = useState<WCGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function loadData(force = false) {
    if (force) clearCache();
    setLoading(true);
    try {
      const [m, g] = await Promise.all([fetchMatches(), fetchGroups()]);
      setMatches(m);
      setGroups(g);
      setLastUpdated(getLastUpdated());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const finishedMatches = matches
    .filter((m) => m.status === "FINISHED" || m.status === "FT")
    .slice(-20)
    .reverse();

  const liveMatches = matches.filter(
    (m) => m.status === "LIVE" || m.status === "in_play"
  );

  const upcomingMatches = matches
    .filter((m) => m.status === "SCHEDULED" || m.status === "scheduled")
    .slice(0, 20);

  const displayedMatches =
    tab === "resultados"
      ? [...liveMatches, ...finishedMatches]
      : upcomingMatches;

  return (
    <div>
      {/* ─── Hero (Direct to Action) ──────────────────────────────── */}
      <section className="hero" style={{ padding: "40px 0" }}>
        <div className="container">
          <div className="hero-eyebrow" style={{ marginBottom: "16px", display: "inline-block", padding: "8px 16px", background: "var(--bg-card)", borderRadius: "99px", fontSize: "0.9rem", fontWeight: 700, border: "1px solid var(--border-glass)" }}>
            <span>⚽ FIFA World Cup 2026</span>
          </div>

          <h1 className="hero-title" style={{ fontSize: "3rem", marginBottom: "40px" }}>
            La <span className="gold-text">Porra</span> Definitiva
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "800px", margin: "0 auto 40px" }}>
            {/* Create Card */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 24px", background: "radial-gradient(ellipse at top, rgba(245, 158, 11, 0.1) 0%, transparent 70%), var(--bg-card)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🏆</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Crear una Liga</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.95rem" }}>
                Conviértete en administrador, configura tu porra y reta a tus amigos.
              </p>
              <Link href="/crear-porra" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                Empezar nueva liga
              </Link>
            </div>

            {/* Join Card */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 24px", background: "radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 70%), var(--bg-card)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🤝</div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Unirse con Código</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.95rem" }}>
                ¿Tienes un código de invitación? Entra directo a competir.
              </p>
              <Link href="/unirse" className="btn btn-secondary btn-lg" style={{ width: "100%", justifyContent: "center", border: "2px solid var(--border-glass)" }}>
                Tengo un código
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Resultados ───────────────────────────────────────────── */}
      <section className="section" id="resultados-section">
        <div className="container">
          <div className="section-header" id="resultados">
            <h2 className="section-title">
              <span className="icon">⚽</span> Partidos
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {lastUpdated && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Actualizado: {lastUpdated}
                </span>
              )}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => loadData(true)}
              >
                🔄 Actualizar
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: "24px" }}>
            <div className="tabs">
              <button
                className={`tab ${tab === "resultados" ? "active" : ""}`}
                onClick={() => setTab("resultados")}
              >
                {liveMatches.length > 0 && (
                  <span style={{ display: "inline-flex", width: 8, height: 8, borderRadius: "50%", background: "var(--red)", marginRight: 6, animation: "pulse 1s infinite" }} />
                )}
                Resultados
              </button>
              <button
                className={`tab ${tab === "proximos" ? "active" : ""}`}
                onClick={() => setTab("proximos")}
              >
                Próximos
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="loading-spinner" />
              <span>Cargando resultados...</span>
            </div>
          ) : displayedMatches.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚽</div>
              <div className="empty-state-title">No hay partidos disponibles</div>
              <p style={{ fontSize: "0.9rem" }}>La API del Mundial puede tardar en actualizarse.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px", maxWidth: "700px" }}>
              {displayedMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Grupos ───────────────────────────────────────────────── */}
      <section className="section" id="grupos" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="icon">📊</span> Clasificación de Grupos
            </h2>
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="loading-spinner" />
            </div>
          ) : groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">Datos de grupos no disponibles</div>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map((g) => (
                <GroupTable key={g.group} group={g} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Removed Bottom CTA since it is now prominent at the top */}
    </div>
  );
}
