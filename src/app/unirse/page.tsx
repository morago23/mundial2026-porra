"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/firebase/auth";

export default function UnirsePage() {
  const [codigo, setCodigo] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    router.push(`/porra/${codigo.trim()}/apostar`);
  }

  return (
    <div className="main-content" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🔗</div>
        <h1 style={{ marginBottom: "12px", fontSize: "2rem", fontWeight: 800 }}>Unirse a una Liga</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "1.1rem" }}>
          Pega el código que te ha enviado tu amigo para unirte a su liga y hacer tu predicción.
        </p>

        {!user ? (
          <div style={{ background: "var(--bg-secondary)", padding: "24px", borderRadius: "20px", marginBottom: "24px" }}>
            <p style={{ marginBottom: "16px", fontWeight: 600 }}>Debes iniciar sesión primero</p>
            <button onClick={signInWithGoogle} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Entrar con Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="text"
              className="form-input code-input"
              placeholder="EJ: XJ9K2L..."
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Unirse ahora
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
