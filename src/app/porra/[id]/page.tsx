"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPorra, getApuestas, getApuesta, Porra, Apuesta } from "@/lib/firebase/firestore";
import { fetchMatches, fetchGroups, mapToMatchResults, mapToGroupStandings } from "@/lib/api/worldcup";
import { calculateScore } from "@/lib/scoring/calculator";
import { TEAMS_BY_CODE } from "@/lib/data/teams";
import { useAuth } from "@/contexts/AuthContext";

interface PlayerScore {
  apuesta: Apuesta;
  total: number;
  detail: string[];
}

export default function PorraPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const isNew = searchParams.get("nuevo") === "1";
  const { user } = useAuth();

  const [porra, setPorra] = useState<Porra | null>(null);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/porra/${id}/apostar` : "";

  async function load() {
    setLoading(true);
    try {
      const [p, apuestas, matches, groups] = await Promise.all([
        getPorra(id),
        getApuestas(id),
        fetchMatches(),
        fetchGroups(),
      ]);

      setPorra(p);

      const matchResults = mapToMatchResults(matches);
      const groupStandings = mapToGroupStandings(groups);
      const realAwards = p?.awards ?? {};

      const scored: PlayerScore[] = apuestas.map((a) => {
        const breakdown = calculateScore(
          {
            teams: a.teams,
            mvp: a.mvp,
            pichichi: a.pichichi,
            guanteOro: a.guanteOro,
            mejorJoven: a.mejorJoven,
          },
          matchResults,
          groupStandings,
          realAwards
        );
        return { apuesta: a, total: breakdown.total, detail: breakdown.detail };
      });

      scored.sort((a, b) => b.total - a.total);
      setScores(scored);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="loading-center">
        <div className="loading-spinner" />
        <span>Cargando porra...</span>
      </div>
    );
  }

  if (!porra) {
    return (
      <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <div className="empty-state-title">Porra no encontrada</div>
          <Link href="/" className="btn btn-secondary" style={{ marginTop: "16px" }}>← Inicio</Link>
        </div>
      </div>
    );
  }

  const myApuesta = scores.find((s) => s.apuesta.id === user?.uid);
  const hasJoined = !!myApuesta;

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Back */}
      <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        ← Inicio
      </Link>

      {/* ── Banner nuevo ─────────────────────────────────────── */}
      {isNew && (
        <div
          className="card card-gold animate-in"
          style={{ textAlign: "center", marginBottom: "32px", padding: "32px" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎉</div>
          <h2 style={{ marginBottom: "8px" }}>¡Porra creada!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Comparte este enlace con tus amigos para que se unan:
          </p>
          <div className="share-box" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <span className="share-url">{shareUrl}</span>
            <button className="btn btn-primary btn-sm" onClick={copyLink}>
              {copied ? "✓ Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ marginBottom: "4px" }}>🏆 {porra.name}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Creada por {porra.createdByName} · {scores.length} participante{scores.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {!hasJoined && user && (
            <Link href={`/porra/${id}/apostar`} className="btn btn-primary">
              ⚽ Hacer mi apuesta
            </Link>
          )}
          {!hasJoined && !user && (
            <Link href={`/porra/${id}/apostar`} className="btn btn-primary">
              🔗 Unirse a la porra
            </Link>
          )}
          <button className="btn btn-secondary" onClick={copyLink}>
            {copied ? "✓ Copiado" : "🔗 Compartir enlace"}
          </button>
        </div>
      </div>

      {/* ── Share link ───────────────────────────────────────── */}
      {!isNew && (
        <div className="share-box" style={{ marginBottom: "32px" }}>
          <span className="share-url">{shareUrl}</span>
          <button className="btn btn-secondary btn-sm" onClick={copyLink}>
            {copied ? "✓" : "Copiar"}
          </button>
        </div>
      )}

      {/* ── Clasificación ────────────────────────────────────── */}
      <div style={{ marginBottom: "16px" }}>
        <h2 className="section-title">
          <span className="icon">🏅</span> Clasificación
        </h2>
      </div>

      {scores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Aún no hay participantes</div>
          <p style={{ fontSize: "0.9rem" }}>Comparte el enlace para que tus amigos hagan sus apuestas.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {scores.map((s, idx) => {
            const isMe = s.apuesta.id === user?.uid;
            const isExpanded = expandedUser === s.apuesta.id;

            return (
              <div key={s.apuesta.id}>
                <div
                  className="standings-row"
                  style={{
                    background: isMe ? "rgba(201,162,39,0.05)" : undefined,
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedUser(isExpanded ? null : s.apuesta.id)}
                >
                  {/* Rank */}
                  <div className={`standings-rank rank-${idx + 1}`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>

                  {/* Avatar */}
                  {s.apuesta.userPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.apuesta.userPhoto} alt="" className="standings-avatar" />
                  ) : (
                    <div className="standings-avatar-placeholder">
                      {s.apuesta.userName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <div className="standings-name">
                      {s.apuesta.userName}
                      {isMe && <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: "var(--gold)" }}>(tú)</span>}
                    </div>
                    <div className="standings-teams">
                      {s.apuesta.teams.map((code) => (
                        <span key={code} className="standings-team-flag" title={TEAMS_BY_CODE[code]?.name}>
                          {TEAMS_BY_CODE[code]?.flag ?? "🏳️"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="standings-points">
                    {s.total.toFixed(1)}
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "4px" }}>pts</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: "16px 24px 24px", background: "rgba(201,162,39,0.03)", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                      <div>
                        <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Equipos seleccionados</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {s.apuesta.teams.map((code) => {
                            const t = TEAMS_BY_CODE[code];
                            return (
                              <div key={code} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                                <span>{t?.flag ?? "🏳️"}</span>
                                <span style={{ color: "var(--text-secondary)" }}>{t?.name ?? code}</span>
                                <span style={{ marginLeft: "auto", color: "var(--gold)", fontWeight: 700, fontSize: "0.8rem" }}>{t?.value ?? "?"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Predicciones</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                          <div>🌟 MVP: <strong style={{ color: "var(--text-primary)" }}>{s.apuesta.mvp}</strong></div>
                          <div>⚽ Pichichi: <strong style={{ color: "var(--text-primary)" }}>{s.apuesta.pichichi}</strong></div>
                          <div>🧤 Guante de Oro: <strong style={{ color: "var(--text-primary)" }}>{s.apuesta.guanteOro}</strong></div>
                          <div>🌱 Mejor Joven: <strong style={{ color: "var(--text-primary)" }}>{s.apuesta.mejorJoven}</strong></div>
                        </div>
                        {s.detail.length > 0 && (
                          <>
                            <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "16px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Puntos ganados</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {s.detail.map((d, i) => (
                                <div key={i} style={{ fontSize: "0.8rem", color: "var(--green)" }}>✓ {d}</div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh */}
      <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          🔄 Actualizar puntuaciones
        </button>
      </div>
    </div>
  );
}
