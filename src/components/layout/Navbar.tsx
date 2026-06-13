"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signOutUser } from "@/lib/firebase/auth";
import { useState, useEffect } from "react";
import { getUserLeagues } from "@/lib/firebase/firestore";
import { Porra, Apuesta } from "@/lib/firebase/firestore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [leagues, setLeagues] = useState<{ porra: Porra; apuesta: Apuesta }[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current);
  }, []);

  // Fetch leagues when sidebar opens and user is logged in
  useEffect(() => {
    if (sidebarOpen && user) {
      async function load() {
        setLoadingLeagues(true);
        try {
          const data = await getUserLeagues(user.uid);
          setLeagues(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingLeagues(false);
        }
      }
      load();
    }
  }, [sidebarOpen, user]);

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-header" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <Link href="/" className="navbar-brand">
            <span className="trophy">🏆</span>
            <span>Porra Mundial 2026</span>
          </Link>
        </div>

        <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme} 
            title="Cambiar tema"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {!loading && !user && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => signInWithGoogle()}
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              Entrar
            </button>
          )}

          {!loading && user && (
            <button className="avatar-btn" onClick={() => setSidebarOpen(true)}>
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={user.displayName ?? "User"} className="avatar" />
              ) : (
                <div className="avatar" style={{ background: "var(--gradient-gold)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar Drawer */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}>
          <div className="sidebar-drawer animate-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              {user ? (
                <div className="sidebar-user">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="User" className="sidebar-avatar" />
                  ) : (
                    <div className="sidebar-avatar" style={{ background: "var(--gradient-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
                      {user.displayName?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div className="sidebar-user-info">
                    <div className="name">{user.displayName}</div>
                    <div className="email">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="sidebar-title">Menú</div>
              )}
              <button className="sidebar-close" onClick={closeSidebar}>✕</button>
            </div>

            <div className="sidebar-content">
              {/* Leages Section */}
              {user && (
                <div className="sidebar-section">
                  <div className="sidebar-section-title">Tus Ligas</div>
                  {loadingLeagues ? (
                    <div style={{ padding: "16px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Cargando ligas...
                    </div>
                  ) : leagues.length === 0 ? (
                    <div style={{ padding: "12px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      Aún no estás en ninguna liga
                    </div>
                  ) : (
                    <div className="sidebar-leagues">
                      {leagues.map((item) => (
                        <Link
                          key={item.porra.id}
                          href={`/porra/${item.porra.id}`}
                          className="sidebar-league-item"
                          onClick={closeSidebar}
                        >
                          <span style={{ fontWeight: 600 }}>🏆 {item.porra.name}</span>
                          <span className="badge badge-gold" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>{item.apuesta.totalValue} pts</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <div className="sidebar-actions">
                    <Link href="/crear-porra" className="btn btn-secondary btn-sm" onClick={closeSidebar}>
                      ✨ Crear Liga
                    </Link>
                    <Link href="/unirse" className="btn btn-secondary btn-sm" onClick={closeSidebar}>
                      🔗 Unirse
                    </Link>
                  </div>
                </div>
              )}

              {/* General Navigation */}
              <div className="sidebar-section">
                <div className="sidebar-section-title">Navegación</div>
                <Link href="/" className="sidebar-nav-item" onClick={closeSidebar}>🏠 Inicio</Link>
                <Link href="/#resultados" className="sidebar-nav-item" onClick={closeSidebar}>⚽ Resultados en vivo</Link>
                <Link href="/#grupos" className="sidebar-nav-item" onClick={closeSidebar}>📊 Clasificación Grupos</Link>
              </div>
            </div>

            <div className="sidebar-footer">
              {user ? (
                <button className="btn btn-secondary" style={{ width: "100%", color: "var(--red)", borderColor: "rgba(232,51,74,0.3)" }} onClick={() => { signOutUser(); closeSidebar(); }}>
                  Cerrar sesión
                </button>
              ) : (
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => { signInWithGoogle(); closeSidebar(); }}>
                  Entrar con Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
