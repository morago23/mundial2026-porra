"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPorra, getApuestas, getAllPredictions, Porra, Apuesta, removeUserFromLeague, leaveLeague, deletePorra, updatePorraSettings } from "@/lib/firebase/firestore";
import { fetchMatches, fetchGroups, mapToMatchResults, mapToGroupStandings } from "@/lib/api/worldcup";
import { calculateScore } from "@/lib/scoring/calculator";
import { TEAMS_BY_CODE } from "@/lib/data/teams";
import { useAuth } from "@/contexts/AuthContext";

interface PlayerScore {
  userId: string;
  userName: string;
  userPhoto: string;
  apuesta: Apuesta | null;
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
      const [p, apuestas, predictionsSnap, matches, groups] = await Promise.all([
        getPorra(id),
        getApuestas(id),
        getAllPredictions(id),
        fetchMatches(),
        fetchGroups(),
      ]);

      setPorra(p);
      const matchResults = mapToMatchResults(matches);
      const groupStandings = mapToGroupStandings(groups);
      const realAwards = p?.awards ?? {};

      const userIds = new Set([...apuestas.map(a => a.id), ...predictionsSnap.map(p => p.userId)]);
      const scored: PlayerScore[] = Array.from(userIds).map((uid) => {
        const apuesta = apuestas.find(a => a.id === uid) || null;
        const preds = predictionsSnap.find(p => p.userId === uid) || null;
        const name = apuesta?.userName || preds?.userName || "Anónimo";
        const photo = apuesta?.userPhoto || preds?.userPhoto || "";

        const breakdown = calculateScore(
          apuesta ? { teams: apuesta.teams, mvp: apuesta.mvp, pichichi: apuesta.pichichi, guanteOro: apuesta.guanteOro, mejorJoven: apuesta.mejorJoven } : null,
          preds?.predictions || null,
          matchResults, groupStandings, realAwards
        );
        return { userId: uid, userName: name, userPhoto: photo, apuesta, total: breakdown.total, detail: breakdown.detail };
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
        setScores((prev) => prev.filter((s) => s.userId !== adminAction.userId));
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

  async function handleToggleMode(mode: "enableFantasy" | "enablePredictor", value: boolean) {
    if (!porra) return;
    const newSettings = { 
      enableFantasy: porra.settings?.enableFantasy ?? true,
      enablePredictor: porra.settings?.enablePredictor ?? true,
      [mode]: value 
    };
    try {
      await updatePorraSettings(id, newSettings);
      setPorra({ ...porra, settings: newSettings });
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la configuración");
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

  const myScore = scores.find((s) => s.userId === user?.uid);
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
              {!hasJoined && user && porra.settings?.enableFantasy !== false && (
                <Link href={`/porra/${id}/apostar`} className="btn btn-primary">
                  ⚽ Hacer mi apuesta
                </Link>
              )}
              {!hasJoined && !user && porra.settings?.enableFantasy !== false && (
                <Link href={`/porra/${id}/apostar`} className="btn btn-primary">
                  🔗 Unirse a la porra
                </Link>
              )}
              {porra.settings?.enablePredictor !== false && user && (
                <Link href={`/porra/${id}/predicciones`} className="btn btn-primary">
                  🎯 Mis Predicciones
                </Link>
              )}
              {porra.settings?.enablePredictor !== false && !user && (
                <Link href={`/porra/${id}/predicciones`} className="btn btn-primary">
                  🎯 Hacer Predicciones
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
            {/* ── Clasificación Completa Normal ───────────────────────── */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Clasificación</h2>
                {myScore && (
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Tu posición: <strong style={{ color: "var(--gold)" }}>#{scores.indexOf(myScore) + 1}</strong>
                  </div>
                )}
              </div>

              {scores.map((s, idx) => {
                const isMe = s.userId === user?.uid;
                return (
                  <div
                    key={s.userId}
                    className={`league-row ${isMe ? "league-row-me" : ""}`}
                    onClick={() => setSelectedPlayer(s)}
                  >
                    <div className="league-rank">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>{idx + 1}</span>}
                    </div>
                    {s.userPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.userPhoto} alt="" className="league-avatar" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="league-avatar league-avatar-initials">{s.userName.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="league-info">
                      <div className="league-name">
                        {s.userName}
                        {isMe && <span className="league-you-badge">tú</span>}
                      </div>
                      {s.apuesta ? (
                        <div className="league-teams">
                          {s.apuesta.teams.slice(0, 5).map((code) => (
                            <span key={code} title={TEAMS_BY_CODE[code]?.name}>{TEAMS_BY_CODE[code]?.flag ?? "🏳️"}</span>
                          ))}
                          {s.apuesta.teams.length > 5 && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>+{s.apuesta.teams.length - 5}</span>}
                        </div>
                      ) : (
                        <div className="league-teams">
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Solo predicciones</span>
                        </div>
                      )}
                    </div>
                    <div className="league-score">
                      <div className="league-pts">{s.total.toFixed(1)}</div>
                      <div className="league-pts-label">pts</div>
                    </div>
                    <div className="league-chevron">›</div>
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
              {selectedPlayer.userPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedPlayer.userPhoto} alt="" className="modal-player-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="modal-player-avatar modal-player-avatar-initials">
                  {selectedPlayer.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="modal-title">{selectedPlayer.userName}</h2>
                <div className="modal-player-pts">
                  <span style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.4rem" }}>{selectedPlayer.total.toFixed(1)}</span>
                  <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>puntos</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPlayer(null)}>✕</button>
            </div>

            <div className="modal-player-body">
              {selectedPlayer.apuesta && (
                <>
                  <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {selectedPlayer.apuesta.teams.map((code) => (
                      <span key={code} style={{ background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid var(--border)" }}>
                        {TEAMS_BY_CODE[code]?.flag} {TEAMS_BY_CODE[code]?.name}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginBottom: "20px", fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div>🌟 MVP: <strong>{selectedPlayer.apuesta.mvp || "—"}</strong></div>
                    <div>⚽ Pichichi: <strong>{selectedPlayer.apuesta.pichichi || "—"}</strong></div>
                    <div>🧤 Guante Oro: <strong>{selectedPlayer.apuesta.guanteOro || "—"}</strong></div>
                    <div>🌱 Mejor Joven: <strong>{selectedPlayer.apuesta.mejorJoven || "—"}</strong></div>
                  </div>
                </>
              )}

              {/* Points breakdown */}
              <div className="modal-section">
                <div className="modal-section-title">✅ Historial de Puntos</div>
                {selectedPlayer.detail.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selectedPlayer.detail.map((d, i) => (
                      <div key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <span style={{ color: "var(--gold)", marginTop: "2px" }}>•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Aún no ha sumado ningún punto.
                  </div>
                )}
              </div>

              {/* Admin remove button */}
              {isAdmin && selectedPlayer.userId !== user?.uid && (
                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                  <button 
                    className="btn btn-sm" 
                    style={{ background: "transparent", color: "var(--red)", border: "1px solid rgba(232,51,74,0.3)" }}
                    onClick={() => {
                      setAdminAction({ type: "remove", userId: selectedPlayer.userId, name: selectedPlayer.userName });
                      setShowAdmin(false);
                      setSelectedPlayer(null);
                    }}
                  >
                    Expulsar jugador
                  </button>
                </div>
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
              <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", fontSize: "0.9rem" }}>
                <h3 style={{ marginBottom: "12px", fontSize: "1rem" }}>Modos de Juego Activos</h3>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={porra.settings?.enableFantasy ?? true} onChange={(e) => handleToggleMode("enableFantasy", e.target.checked)} style={{ width: "16px", height: "16px" }} />
                  Modo Manager (Equipos y presupuesto)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={porra.settings?.enablePredictor ?? true} onChange={(e) => handleToggleMode("enablePredictor", e.target.checked)} style={{ width: "16px", height: "16px" }} />
                  Modo Quiniela (Predicción de partidos)
                </label>
              </div>

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
