"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signOutUser } from "@/lib/firebase/auth";
import { useState, useEffect } from "react";
import { getUserLeagues, Porra, Apuesta } from "@/lib/firebase/firestore";

interface LeagueDetail {
  porra: Porra;
  apuesta: Apuesta;
}

export default function Navbar() {
  const { user, loading } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [leagues, setLeagues] = useState<LeagueDetail[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current);
  }, []);

  // Load leagues when panel opens
  useEffect(() => {
    if (panelOpen && user && leagues.length === 0) {
      setLoadingLeagues(true);
      getUserLeagues(user.uid)
        .then((data) => setLeagues(data))
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

  function closePanel() {
    setPanelOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <button 
              onClick={() => setPanelOpen((p) => !p)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "8px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}
              title="Menú"
            >
              ☰
            </button>
          )}
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
            <div className="nav-user-area">
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
                        <span>🏆</span> <span style={{ flex: 1, fontWeight: 600 }}>{item.porra.name}</span>
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
