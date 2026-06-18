"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMatches, mapToMatchResults } from "@/lib/api/worldcup";
import { getPorra, saveMatchPredictions, getUserPredictions, Porra, MatchPrediction } from "@/lib/firebase/firestore";
import { MatchResult } from "@/lib/scoring/calculator";
import { TEAMS_BY_CODE } from "@/lib/data/teams";

export default function PrediccionesPage() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [porra, setPorra] = useState<Porra | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [predictions, setPredictions] = useState<Record<string, MatchPrediction>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [p, rawMatches, userPreds] = await Promise.all([
          getPorra(id),
          fetchMatches(),
          getUserPredictions(id, user.uid),
        ]);
        setPorra(p);
        
        // Filter out matches that don't have known teams yet
        const validMatches = mapToMatchResults(rawMatches).filter(m => m.homeTeam && m.awayTeam && !m.homeTeam.startsWith("W") && !m.homeTeam.startsWith("L") && m.homeTeam !== "TBD" && m.awayTeam !== "TBD");
        setMatches(validMatches);

        if (userPreds) {
          setPredictions(userPreds.predictions || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) load();
  }, [id, user, authLoading]);

  const handleScoreChange = (matchId: string, side: "home" | "away", value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10);
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        homeScore: side === "home" ? numValue : (prev[matchId]?.homeScore ?? null),
        awayScore: side === "away" ? numValue : (prev[matchId]?.awayScore ?? null),
      }
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveMatchPredictions(id, user.uid, user.displayName ?? "Anónimo", user.photoURL ?? "", predictions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error al guardar predicciones");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="loading-center"><div className="loading-spinner" /></div>;

  if (!user) return (
    <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
      <h2>Inicia sesión para predecir</h2>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: "16px" }}>Volver</Link>
    </div>
  );

  if (!porra) return <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>Liga no encontrada</div>;

  return (
    <div className="container animate-in" style={{ paddingTop: "40px", paddingBottom: "100px" }}>
      <Link href={`/porra/${id}`} className="btn btn-secondary btn-sm" style={{ marginBottom: "24px", display: "inline-block" }}>
        ← Volver a la liga
      </Link>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ marginBottom: "8px" }}>Mis Predicciones 🎯</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Adivina el resultado exacto de los partidos. (Pleno: +3p, Tendencia: +1p)</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : saved ? "✅ Guardado" : "💾 Guardar"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {matches.map(match => {
          const isLiveOrFinished = match.status !== "SCHEDULED";
          const hTeam = TEAMS_BY_CODE[match.homeTeam];
          const aTeam = TEAMS_BY_CODE[match.awayTeam];
          const pred = predictions[match.id!] || { homeScore: null, awayScore: null };

          return (
            <div key={match.id} className="card" style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: isLiveOrFinished ? 0.6 : 1 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", textAlign: "right" }}>
                <span style={{ fontWeight: 600 }}>{hTeam?.name ?? match.homeTeam}</span>
                <span style={{ fontSize: "1.5rem" }}>{hTeam?.flag ?? "🏳️"}</span>
              </div>
              
              <div style={{ margin: "0 24px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input 
                  type="number" 
                  min="0" 
                  max="99" 
                  value={pred.homeScore ?? ""} 
                  onChange={(e) => handleScoreChange(match.id!, "home", e.target.value)}
                  disabled={isLiveOrFinished || saving}
                  style={{ width: "48px", height: "48px", textAlign: "center", fontSize: "1.2rem", fontWeight: 700, borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                />
                <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>-</span>
                <input 
                  type="number" 
                  min="0" 
                  max="99" 
                  value={pred.awayScore ?? ""} 
                  onChange={(e) => handleScoreChange(match.id!, "away", e.target.value)}
                  disabled={isLiveOrFinished || saving}
                  style={{ width: "48px", height: "48px", textAlign: "center", fontSize: "1.2rem", fontWeight: 700, borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                />
              </div>

              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.5rem" }}>{aTeam?.flag ?? "🏳️"}</span>
                <span style={{ fontWeight: 600 }}>{aTeam?.name ?? match.awayTeam}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "var(--bg-card)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center", zIndex: 100 }}>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", maxWidth: "400px", boxShadow: "0 -4px 20px rgba(0,0,0,0.1)" }} onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : saved ? "✅ Guardado" : "💾 Guardar Predicciones"}
        </button>
      </div>
    </div>
  );
}
