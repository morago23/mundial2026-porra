"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPorra, getApuestas, Porra, Apuesta, removeUserFromLeague, leaveLeague, deletePorra } from "@/lib/firebase/firestore";
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
  const router = useRouter();

  const [porra, setPorra] = useState<Porra | null>(null);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerScore | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAction, setAdminAction] = useState<null | { type: "remove" | "delete" | "leave"; userId?: string; name?: string }>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/porra/${id}/apostar` : "";
  const waText = porra ? encodeURIComponent(`🏆 ¡Únete a mi porra del Mundial 2026!\n\nLiga: ${porra.name}\nCódigo: ${id}\n\nÚnete aquí: ${shareUrl}`) : "";
  const waUrl = `https://wa.me/?text=${waText}`;

  const isAdmin = porra?.createdBy === user?.uid;

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
          { teams: a.teams, mvp: a.mvp, pichichi: a.pichichi, guanteOro: a.guanteOro, mejorJoven: a.mejorJoven },
          matchResults, groupStandings, realAwards
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

  useEffect(() => { load(); }, [id]);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAdminAction() {
    if (!adminAction || !user) return;
    setActionLoading(true);
    setActionError("");
    try {
      if (adminAction.type === "remove" && adminAction.userId) {
        await removeUserFromLeague(id, adminAction.userId, user.uid);
        setScores((prev) => prev.filter((s) => s.apuesta.id !== adminAction.userId));
      } else if (adminAction.type === "delete") {
        await deletePorra(id, user.uid);
        router.push("/");
        return;
      } else if (adminAction.type === "leave") {
        await leaveLeague(id, user.uid);
        router.push("/");
        return;
      }
      setAdminAction(null);
      setShowAdmin(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error");
    } finally {
      setActionLoading(false);
    }
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
          <div className="empty-state-title">Liga no encontrada</div>
          <Link href="/" className="btn btn-secondary" style={{ marginTop: "16px" }}>← Inicio</Link>
        </div>
      </div>
    );
  }

  const myScore = scores.find((s) => s.apuesta.id === user?.uid);
  const hasJoined = !!myScore;

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", paddingBottom: "80px" }}>

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="league-hero">
        <div className="container">
          <div className="league-hero-inner">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "2rem" }}>🏆</span>
                <h1 className="league-hero-title">{porra.name}</h1>
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Creada por <strong style={{ color: "var(--text-secondary)" }}>{porra.createdByName}</strong>
                {" · "}{scores.length} participante{scores.length !== 1 ? "s" : ""}
                {" · "}Código: <strong style={{ fontFamily: "monospace", color: "var(--gold)", letterSpacing: "2px" }}>{id.toUpperCase()}</strong>
              </div>
            </div>
            <div className="league-hero-actions">
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
              <button className="btn btn-secondary btn-sm" onClick={copyLink}>
                {copied ? "✓ Copiado" : "🔗 Copiar link"}
              </button>
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="btn btn-sm" style={{ background: "#25D366", color: "white", textDecoration: "none" }}>
                WhatsApp
              </a>
              {isAdmin ? (
                <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)" }}
                  onClick={() => setShowAdmin(true)}>
                  ⚙️ Admin
                </button>
              ) : hasJoined && (
                <button className="btn btn-sm"
                  style={{ background: "rgba(232,51,74,0.08)", border: "1px solid rgba(232,51,74,0.3)", color: "var(--red)" }}
                  onClick={() => setAdminAction({ type: "leave" })}>
                  🚪 Abandonar
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => setShowRules(true)}>
                📜 Reglas
              </button>
              <button className="btn btn-secondary btn-sm" onClick={load}>
                🔄
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── New League Banner ─────────────────────────────────── */}
      {isNew && (
        <div className="container" style={{ marginBottom: "24px" }}>
          <div className="card card-gold animate-in" style={{ textAlign: "center", padding: "24px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🎉</div>
            <h2 style={{ marginBottom: "8px" }}>¡Liga creada! Invita a tus amigos</h2>
            <div className="share-box" style={{ maxWidth: "500px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span className="share-url" style={{ flex: 1, fontFamily: "monospace", fontSize: "0.8rem" }}>{shareUrl}</span>
              <button className="btn btn-primary btn-sm" onClick={copyLink}>{copied ? "✓" : "Copiar"}</button>
              <a href={waUrl} target="_blank" rel="noreferrer"
                className="btn btn-sm" style={{ background: "#25D366", color: "white", textDecoration: "none" }}>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {scores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-title">Aún no hay participantes</div>
            <p style={{ fontSize: "0.9rem" }}>Comparte el link para que tus amigos se unan.</p>
          </div>
        ) : (
          <>
            {/* ── Biwenger Standings Table ───────────────────────── */}
            <div style={{ background: "#0d0d0d", marginTop: "16px", borderRadius: "12px", overflow: "hidden", border: "1px solid #222" }}>
              <div className="bw-standings-header">
                <div className="bw-standings-header-cols">
                  <span>Gen.</span>
                  <span>Pts.</span>
                </div>
              </div>

              {scores.map((s, idx) => {
                const isMe = s.apuesta.id === user?.uid;
                const pos = idx + 1;
                // Trend simulation: assume 1st goes up, others are flat or down (since we don't have historical data yet, we fake it for aesthetics like Biwenger, or we just put a dash)
                // Let's just put a dash to be truthful, but style it like the screenshot.
                let rankClass = "other";
                if (pos === 1) rankClass = "first";
                else if (pos === 2) rankClass = "second";
                else if (pos === 3) rankClass = "third";

                return (
                  <div
                    key={s.apuesta.id}
                    className="bw-row"
                    onClick={() => setSelectedPlayer(s)}
                    style={isMe ? { background: "#1a1a1a", borderLeft: "3px solid #4CAF50" } : {}}
                  >
                    <div className="bw-rank-col">
                      <div className={`bw-rank-box ${rankClass}`}>
                        {pos}º
                      </div>
                      <div className="bw-rank-trend bw-trend-flat">-</div>
                    </div>

                    <div className="bw-user-col">
                      {s.apuesta.userPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.apuesta.userPhoto} alt="" className="bw-avatar" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="bw-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700 }}>
                          {s.apuesta.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="bw-name">
                        {s.apuesta.userName}
                        {porra.createdBy === s.apuesta.id && <span style={{ fontSize: "0.6rem", background: "#333", color: "#aaa", padding: "2px 4px", borderRadius: "4px", marginLeft: "6px", verticalAlign: "middle" }}>ADMIN</span>}
                      </div>
                    </div>

                    <div className="bw-score-col">
                      <div className="bw-score-box">{s.total.toFixed(0)}</div>
                      <div className="bw-score-box" style={{ background: "transparent" }}>{s.total.toFixed(0)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Player Modal ─────────────────────────────────────────── */}
      {selectedPlayer && (
        <div className="modal-overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="modal modal-player animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-player-header">
              {selectedPlayer.apuesta.userPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedPlayer.apuesta.userPhoto} alt="" className="modal-player-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="modal-player-avatar modal-player-avatar-initials">
                  {selectedPlayer.apuesta.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="modal-player-name">{selectedPlayer.apuesta.userName}</div>
                <div className="modal-player-pts">
                  <span style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.4rem" }}>{selectedPlayer.total.toFixed(1)}</span>
                  <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>puntos</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPlayer(null)}>✕</button>
            </div>

            <div className="modal-player-body">
              {/* Teams */}
              <div className="modal-section">
                <div className="modal-section-title">🌍 Equipos seleccionados</div>
                <div className="modal-teams-grid">
                  {selectedPlayer.apuesta.teams.map((code) => {
                    const t = TEAMS_BY_CODE[code];
                    return (
                      <div key={code} className="modal-team-item">
                        <span className="modal-team-flag">{t?.flag ?? "🏳️"}</span>
                        <span className="modal-team-name">{t?.name ?? code}</span>
                        <span className="modal-team-value">{t?.value ?? "?"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Predictions */}
              <div className="modal-section">
                <div className="modal-section-title">🎯 Predicciones especiales</div>
                <div className="modal-predictions">
                  <div className="modal-prediction-item"><span>🌟 MVP</span><strong>{selectedPlayer.apuesta.mvp || "—"}</strong></div>
                  <div className="modal-prediction-item"><span>⚽ Pichichi</span><strong>{selectedPlayer.apuesta.pichichi || "—"}</strong></div>
                  <div className="modal-prediction-item"><span>🧤 Guante de Oro</span><strong>{selectedPlayer.apuesta.guanteOro || "—"}</strong></div>
                  <div className="modal-prediction-item"><span>🌱 Mejor Joven</span><strong>{selectedPlayer.apuesta.mejorJoven || "—"}</strong></div>
                </div>
              </div>

              {/* Points breakdown */}
              {selectedPlayer.detail.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">✅ Puntos conseguidos</div>
                  <div className="modal-points-list">
                    {selectedPlayer.detail.map((d, i) => (
                      <div key={i} className="modal-point-item">
                        <span className="modal-point-dot" />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin remove button */}
              {isAdmin && selectedPlayer.apuesta.id !== user?.uid && (
                <button
                  className="btn btn-sm"
                  style={{ width: "100%", justifyContent: "center", background: "rgba(232,51,74,0.08)", border: "1px solid rgba(232,51,74,0.3)", color: "var(--red)", marginTop: "8px" }}
                  onClick={() => {
                    setAdminAction({ type: "remove", userId: selectedPlayer.apuesta.id, name: selectedPlayer.apuesta.userName });
                    setSelectedPlayer(null);
                  }}
                >
                  🗑️ Eliminar de la liga
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Panel Modal ────────────────────────────────────── */}
      {showAdmin && (
        <div className="modal-overlay" onClick={() => setShowAdmin(false)}>
          <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>⚙️ Administrar liga</h2>
              <button className="btn" style={{ background: "transparent", border: "none", fontSize: "1.5rem" }} onClick={() => setShowAdmin(false)}>✕</button>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
              Eres el administrador de <strong>{porra.name}</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Para eliminar un jugador específico, pulsa en su nombre en la clasificación y usa el botón rojo.
              </div>
              <button
                className="btn"
                style={{ justifyContent: "center", background: "rgba(232,51,74,0.08)", border: "1px solid rgba(232,51,74,0.3)", color: "var(--red)" }}
                onClick={() => { setAdminAction({ type: "delete" }); setShowAdmin(false); }}
              >
                🗑️ Borrar liga permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Action Modal ─────────────────────────────────── */}
      {adminAction && (
        <div className="modal-overlay" onClick={() => setAdminAction(null)}>
          <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "12px" }}>
              {adminAction.type === "delete" ? "🗑️" : adminAction.type === "leave" ? "🚪" : "❌"}
            </div>
            <h2 className="modal-title" style={{ textAlign: "center" }}>
              {adminAction.type === "delete" && "¿Borrar la liga?"}
              {adminAction.type === "leave" && "¿Abandonar la liga?"}
              {adminAction.type === "remove" && `¿Eliminar a ${adminAction.name}?`}
            </h2>
            <p style={{ color: "var(--text-secondary)", textAlign: "center", marginBottom: "24px", fontSize: "0.9rem" }}>
              {adminAction.type === "delete" && "Se borrarán la liga y TODAS las apuestas. Esta acción es irreversible."}
              {adminAction.type === "leave" && "Tu apuesta se eliminará y no podrás volver a unirte con la misma cuenta."}
              {adminAction.type === "remove" && "Su apuesta se eliminará de la liga. Esta acción es irreversible."}
            </p>
            {actionError && <p style={{ color: "var(--red)", marginBottom: "16px", fontSize: "0.85rem" }}>⚠️ {actionError}</p>}
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setAdminAction(null); setActionError(""); }}>
                Cancelar
              </button>
              <button
                className="btn"
                style={{ flex: 1, justifyContent: "center", background: "var(--red)", color: "white" }}
                onClick={handleAdminAction}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rules Modal ──────────────────────────────────────────── */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal animate-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>📜 Reglas de Puntuación</h2>
              <button className="btn" style={{ background: "transparent", border: "none", fontSize: "1.5rem", padding: "0" }} onClick={() => setShowRules(false)}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem" }}>
              {[
                ["Victoria en grupos", "+3p"], ["Empate en grupos", "+1p"],
                ["1º de grupo", "+2p"], ["2º de grupo", "+1p"],
                ["3º que pasa", "+0.5p"], ["Octavos de final", "+3p"],
                ["Cuartos de final", "+5p"], ["Semifinal", "+8p"],
                ["Final", "+10p"], ["Campeón", "+12p"],
                ["3er puesto", "+3p"], ["Premio especial", "+5p"],
              ].map(([label, pts]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderRadius: "6px", background: "var(--bg-secondary)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>{pts}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "100%", marginTop: "20px", justifyContent: "center" }} onClick={() => setShowRules(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
