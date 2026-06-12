"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { getPorra, hasApuesta, saveApuesta, Porra } from "@/lib/firebase/firestore";
import { calcTotalValue, MAX_BUDGET, MAX_TEAMS } from "@/lib/data/teams";
import TeamSelector from "@/components/porra/TeamSelector";
import BudgetMeter from "@/components/porra/BudgetMeter";
import PlayerSearch from "@/components/porra/PlayerSearch";
import { TEAMS_BY_CODE } from "@/lib/data/teams";

export default function ApostarPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [porra, setPorra] = useState<Porra | null>(null);
  const [alreadyBet, setAlreadyBet] = useState(false);
  const [loading, setLoading] = useState(true);

  // Bet form state
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [mvp, setMvp] = useState("");
  const [pichichi, setPichichi] = useState("");
  const [guanteOro, setGuanteOro] = useState("");
  const [mejorJoven, setMejorJoven] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalValue = calcTotalValue(selectedTeams);
  const budgetOk = totalValue <= MAX_BUDGET;
  const teamsOk = selectedTeams.length === MAX_TEAMS;
  const awardsOk = mvp.trim() && pichichi.trim() && guanteOro.trim() && mejorJoven.trim();
  const canSubmit = budgetOk && teamsOk && awardsOk;

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      const p = await getPorra(id);
      setPorra(p);
      if (user) {
        const already = await hasApuesta(id, user.uid);
        setAlreadyBet(already);
      }
      setLoading(false);
    }
    load();
  }, [id, user, authLoading]);

  async function handleSubmit() {
    if (!user || !canSubmit || !porra) return;
    setSubmitting(true);
    setError("");
    try {
      await saveApuesta(id, user.uid, user.displayName ?? "Anónimo", user.photoURL ?? "", {
        teams: selectedTeams,
        totalValue,
        mvp: mvp.trim(),
        pichichi: pichichi.trim(),
        guanteOro: guanteOro.trim(),
        mejorJoven: mejorJoven.trim(),
      });
      router.push(`/porra/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la apuesta");
      setSubmitting(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="loading-center">
        <div className="loading-spinner" />
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

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🏆</div>
          <h2 style={{ marginBottom: "8px" }}>Únete a <em>{porra.name}</em></h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
            Inicia sesión con Google para hacer tu apuesta.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => signInWithGoogle()}>
            Entrar con Google
          </button>
          <div style={{ marginTop: "16px" }}>
            <Link href={`/porra/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Ver clasificación sin apostar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (alreadyBet) {
    return (
      <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ marginBottom: "8px" }}>Ya has apostado</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
            Ya has hecho tu apuesta en <strong>{porra.name}</strong>. Las apuestas son irreversibles.
          </p>
          <Link href={`/porra/${id}`} className="btn btn-primary">
            Ver clasificación →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Back */}
      <Link href={`/porra/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
        ← Ver porra
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div className="badge badge-gold" style={{ marginBottom: "12px" }}>
          🏆 {porra.name}
        </div>
        <h1 style={{ marginBottom: "8px" }}>Tu apuesta</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Hola {user.displayName?.split(" ")[0]}! Elige tus 10 selecciones (≤115 pts) y predice los premios especiales.
        </p>
        <div
          style={{ marginTop: "16px", padding: "10px 14px", background: "rgba(232,51,74,0.08)", border: "1px solid rgba(232,51,74,0.2)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--red)", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          ⚠️ Una vez confirmada, tu apuesta <strong>no se puede modificar</strong>
        </div>
      </div>

      {/* ── Team selector ─────────────────────────────────────── */}
      <div style={{ marginBottom: "48px" }}>
        <h2 style={{ marginBottom: "8px" }}>1. Elige tus 10 equipos</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
          Presupuesto máximo: <strong style={{ color: "var(--gold)" }}>115 puntos</strong>
        </p>
        <div className="layout-bet">
          <TeamSelector selected={selectedTeams} onChange={setSelectedTeams} />
          <BudgetMeter selectedTeams={selectedTeams} />
        </div>
      </div>

      {/* ── Special awards ────────────────────────────────────── */}
      <div style={{ maxWidth: "640px", marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "8px" }}>2. Predicciones especiales</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
          Cada acierto exacto vale <strong style={{ color: "var(--gold)" }}>+5 puntos</strong>.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <PlayerSearch label="MVP del Mundial" icon="🌟" value={mvp} onChange={setMvp} />
          <PlayerSearch label="Pichichi (máximo goleador)" icon="⚽" value={pichichi} onChange={setPichichi} />
          <PlayerSearch label="Guante de Oro (mejor portero)" icon="🧤" value={guanteOro} onChange={setGuanteOro} />
          <PlayerSearch label="Mejor Jugador Joven" icon="🌱" value={mejorJoven} onChange={setMejorJoven} />
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────────────── */}
      {error && (
        <div style={{ marginBottom: "20px", padding: "12px 16px", background: "rgba(232,51,74,0.1)", border: "1px solid rgba(232,51,74,0.3)", borderRadius: "10px", color: "var(--red)", fontSize: "0.9rem" }}>
          ⚠️ {error}
        </div>
      )}

      <button
        className="btn btn-primary btn-lg"
        onClick={() => setShowConfirm(true)}
        disabled={!canSubmit || submitting}
      >
        ⚽ Confirmar apuesta
      </button>

      {!canSubmit && (
        <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {!teamsOk && `• Selecciona ${MAX_TEAMS - selectedTeams.length} equipo(s) más`}
          {!budgetOk && `• Presupuesto excedido (${totalValue.toFixed(1)} / ${MAX_BUDGET})`}
          {!awardsOk && "• Rellena todos los premios especiales"}
        </div>
      )}

      {/* ── Confirm Modal ─────────────────────────────────────── */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal animate-in">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
            <h2 className="modal-title">¿Confirmas tu apuesta?</h2>
            <div className="modal-body">
              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "var(--red)" }}>Esta acción es irreversible.</strong>{" "}
                No podrás modificar tu apuesta una vez confirmada.
              </p>
              <div style={{ background: "var(--bg-card)", borderRadius: "10px", padding: "16px", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {selectedTeams.map((c) => (
                    <span key={c} style={{ fontSize: "1.5rem" }} title={TEAMS_BY_CODE[c]?.name}>
                      {TEAMS_BY_CODE[c]?.flag ?? "🏳️"}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Total: {totalValue.toFixed(1)} / {MAX_BUDGET} pts
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem" }}>
                  <div>🌟 MVP: <strong>{mvp}</strong></div>
                  <div>⚽ Pichichi: <strong>{pichichi}</strong></div>
                  <div>🧤 Guante de Oro: <strong>{guanteOro}</strong></div>
                  <div>🌱 Mejor Joven: <strong>{mejorJoven}</strong></div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { setShowConfirm(false); handleSubmit(); }}
                disabled={submitting}
              >
                {submitting ? "Guardando..." : "✅ Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
