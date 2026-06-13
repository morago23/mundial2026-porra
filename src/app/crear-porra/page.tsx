"use client";



import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { createPorra } from "@/lib/firebase/firestore";
import { calcTotalValue, MAX_BUDGET, MAX_TEAMS, TEAMS_BY_CODE } from "@/lib/data/teams";
import TeamSelector from "@/components/porra/TeamSelector";
import BudgetMeter from "@/components/porra/BudgetMeter";
import PlayerSearch from "@/components/porra/PlayerSearch";
import Link from "next/link";

type Step = 1 | 2 | 3;

export default function CrearPorraPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [porraName, setPorraName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [mvp, setMvp] = useState("");
  const [pichichi, setPichichi] = useState("");
  const [guanteOro, setGuanteOro] = useState("");
  const [mejorJoven, setMejorJoven] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const totalValue = calcTotalValue(selectedTeams);
  const budgetOk = totalValue <= MAX_BUDGET;
  const teamsOk = selectedTeams.length === MAX_TEAMS;
  const awardsOk = mvp.trim() && pichichi.trim() && guanteOro.trim() && mejorJoven.trim();
  const canSubmit = budgetOk && teamsOk && awardsOk && porraName.trim();

  async function handleCreate() {
    if (!user || !canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const id = await createPorra(
        porraName.trim(),
        user.uid,
        user.displayName ?? "Anónimo",
        user.photoURL ?? "",
        {
          teams: selectedTeams,
          totalValue,
          mvp: mvp.trim(),
          pichichi: pichichi.trim(),
          guanteOro: guanteOro.trim(),
          mejorJoven: mejorJoven.trim(),
        }
      );
      router.push(`/porra/${id}?nuevo=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la porra");
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="loading-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: "80px", textAlign: "center" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🔐</div>
          <h1 style={{ marginBottom: "12px" }}>Inicia sesión</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
            Para crear una porra necesitas iniciar sesión con tu cuenta de Google.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => signInWithGoogle()}>
            Entrar con Google
          </button>
          <div style={{ marginTop: "16px" }}>
            <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          ← Inicio
        </Link>
        <h1>Crear Porra 🏆</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Elige el nombre de tu porra, selecciona 10 equipos (≤115 pts) y predice los premios.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: step >= s ? 1 : 0.4,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: step > s ? "var(--green)" : step === s ? "var(--gradient-gold)" : "var(--bg-card)",
                border: "2px solid " + (step >= s ? "var(--gold)" : "var(--border)"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: step >= s ? "#080c1a" : "var(--text-muted)",
                backgroundImage: step === s ? "var(--gradient-gold)" : step > s ? "none" : "none",
                backgroundColor: step > s ? "var(--green)" : "var(--bg-card)",
              }}
            >
              {step > s ? "✓" : s}
            </div>
            <span style={{ fontSize: "0.85rem", color: step === s ? "var(--text-primary)" : "var(--text-muted)", display: s < 3 ? "block" : undefined }}>
              {s === 1 ? "Nombre" : s === 2 ? "Equipos" : "Premios"}
            </span>
            {s < 3 && <span style={{ color: "var(--border)", margin: "0 4px" }}>→</span>}
          </div>
        ))}
      </div>

      {/* ── Step 1: Nombre ──────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ maxWidth: "560px" }} className="animate-in">
          <div className="card">
            <h2 style={{ marginBottom: "24px" }}>¿Cómo se llama tu porra?</h2>
            <div className="form-group">
              <label className="form-label">Nombre de la porra</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Los Cracks del Curro, Peña Mundialista..."
                value={porraName}
                onChange={(e) => setPorraName(e.target.value)}
                maxLength={60}
                autoFocus
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {porraName.length}/60 caracteres
              </span>
            </div>

            <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={!porraName.trim()}
              >
                Siguiente → Elegir equipos
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: "16px", background: "rgba(201,162,39,0.04)" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>📋 Sistema de puntuación</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {[
                ["Victoria en grupos", "+3p"],
                ["Empate en grupos", "+1p"],
                ["1º de grupo", "+2p"],
                ["2º de grupo", "+1p"],
                ["3º que pasa", "+0.5p"],
                ["Octavos de final", "+3p"],
                ["Cuartos de final", "+5p"],
                ["Semifinal", "+8p"],
                ["Final", "+10p"],
                ["Campeón", "+12p"],
                ["3er puesto", "+3p"],
                ["Premio especial", "+5p"],
              ].map(([label, pts]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderRadius: "6px", background: "var(--bg-card)" }}>
                  <span>{label}</span>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Equipos ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="animate-in mobile-budget-padding">
          <div className="layout-bet">
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ marginBottom: "8px" }}>Elige tus 10 equipos</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Presupuesto máximo: <strong style={{ color: "var(--gold)" }}>115 puntos</strong>. 
                  Exactamente 10 selecciones.
                </p>
              </div>
              <TeamSelector
                selected={selectedTeams}
                onChange={setSelectedTeams}
              />
            </div>
            <BudgetMeter selectedTeams={selectedTeams} />
          </div>

          <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              ← Atrás
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setStep(3)}
              disabled={!teamsOk || !budgetOk}
            >
              Siguiente → Premios especiales
            </button>
          </div>

          {!teamsOk && (
            <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {selectedTeams.length < MAX_TEAMS
                ? `Selecciona ${MAX_TEAMS - selectedTeams.length} equipo(s) más`
                : `Demasiados equipos seleccionados`}
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Premios ─────────────────────────────────────── */}
      {step === 3 && (
        <div style={{ maxWidth: "640px" }} className="animate-in">
          <h2 style={{ marginBottom: "8px" }}>Predicciones especiales</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.9rem" }}>
            Cada acierto vale <strong style={{ color: "var(--gold)" }}>+5 puntos</strong>. Tienes que acertar el jugador exacto.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <PlayerSearch label="MVP del Mundial" icon="🌟" value={mvp} onChange={setMvp} />
            <PlayerSearch label="Pichichi (máximo goleador)" icon="⚽" value={pichichi} onChange={setPichichi} />
            <PlayerSearch label="Guante de Oro (mejor portero)" icon="🧤" value={guanteOro} onChange={setGuanteOro} />
            <PlayerSearch label="Mejor Jugador Joven" icon="🌱" value={mejorJoven} onChange={setMejorJoven} />
          </div>

          {error && (
            <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(232,51,74,0.1)", border: "1px solid rgba(232,51,74,0.3)", borderRadius: "10px", color: "var(--red)", fontSize: "0.9rem" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>
              ← Atrás
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowConfirm(true)}
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Creando..." : "🏆 Crear Porra y Apostar"}
            </button>
          </div>

          {!awardsOk && (
            <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Rellena todos los premios especiales para continuar
            </p>
          )}
        </div>
      )}

      {/* ── Confirm Modal ────────────────────────────────────────── */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal animate-in">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
            <h2 className="modal-title">¿Confirmas tu apuesta?</h2>
            <div className="modal-body">
              <p style={{ marginBottom: "16px" }}>
                <strong style={{ color: "var(--red)" }}>Esta acción es irreversible.</strong> Una vez confirmada tu apuesta no podrás modificarla.
              </p>
              <div style={{ background: "var(--bg-card)", borderRadius: "10px", padding: "16px", fontSize: "0.9rem" }}>
                <div style={{ marginBottom: "8px" }}><strong>Porra:</strong> {porraName}</div>
                <div style={{ marginBottom: "8px" }}><strong>Equipos:</strong> {selectedTeams.map((c) => TEAMS_BY_CODE[c]?.flag ?? "🏳️").join(" ")}</div>
                <div style={{ marginBottom: "4px" }}><strong>Total:</strong> {totalValue.toFixed(1)} / 115</div>
                <div style={{ borderTop: "1px solid var(--border)", marginTop: "12px", paddingTop: "12px" }}>
                  <div>🌟 MVP: {mvp}</div>
                  <div>⚽ Pichichi: {pichichi}</div>
                  <div>🧤 Guante de Oro: {guanteOro}</div>
                  <div>🌱 Mejor Joven: {mejorJoven}</div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { setShowConfirm(false); handleCreate(); }}
                disabled={submitting}
              >
                {submitting ? "Creando..." : "✅ Confirmar y Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
