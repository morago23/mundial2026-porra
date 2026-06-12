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
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">
            <span>⚽</span>
            <span>FIFA World Cup 2026</span>
          </div>

          <h1 className="hero-title">
            La <span className="gold-text">Porra</span> del Mundial
          </h1>

          <p className="hero-subtitle">
            Selecciona tus 10 selecciones con presupuesto ≤ 115 puntos,
            predice los premios y compite con tus amigos.
          </p>

          <div className="hero-actions">
            <Link href="/crear-porra" className="btn btn-primary btn-lg">
              🏆 Crear mi Porra
            </Link>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                document.getElementById("resultados-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              📊 Ver Resultados
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: "48px", marginTop: "48px", flexWrap: "wrap" }}>
            {[
              { value: "48", label: "Selecciones" },
              { value: "104", label: "Partidos" },
              { value: "12", label: "Grupos" },
              { value: "115", label: "Presupuesto máx." },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 800, background: "var(--gradient-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {value}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
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

      {/* ─── CTA Crear Porra ──────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div
            className="card card-gold"
            style={{ textAlign: "center", padding: "64px 32px", background: "radial-gradient(ellipse at center, rgba(201,162,39,0.12) 0%, rgba(8,12,26,0) 70%)" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🏆</div>
            <h2 style={{ marginBottom: "12px" }}>¿Listo para la porra?</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
              Crea tu porra, elige tus 10 selecciones con presupuesto máximo de 115 puntos y comparte el enlace con tus amigos.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/crear-porra" className="btn btn-primary btn-lg">
                🏆 Crear Porra
              </Link>
              <Link href="/unirse" className="btn btn-secondary btn-lg">
                🔗 Unirse con código
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
