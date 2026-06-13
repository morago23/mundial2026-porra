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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leagues, setLeagues] = useState<LeagueDetail[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);

  // Load leagues when sidebar opens
  useEffect(() => {
    if (sidebarOpen && user && leagues.length === 0) {
      setLoadingLeagues(true);
      getUserLeagues(user.uid)
        .then((data) => setLeagues(data))
        .catch(console.error)
        .finally(() => setLoadingLeagues(false));
    }
  }, [sidebarOpen, user]);

  return (
    <>
      <nav className="navbar" style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{ background: "transparent", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer", padding: "4px" }}
          >
            ☰
          </button>
          <Link href="/" className="navbar-brand" style={{ color: "white" }}>
            <span className="trophy">⚽</span>
            <span style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>PORRA MUNDIAL</span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!loading && !user && (
            <button className="btn btn-primary btn-sm" onClick={() => signInWithGoogle()}>
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* Biwenger Sidebar */}
      {sidebarOpen && (
        <div className="bw-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`bw-sidebar ${sidebarOpen ? "open" : ""}`} style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <div className="bw-sidebar-header">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt="" className="bw-sidebar-avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="bw-sidebar-avatar" style={{ background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
              {user?.displayName?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
          <div className="bw-sidebar-info">
            <span className="bw-sidebar-name">{user?.displayName || "Usuario"}</span>
            <span className="bw-sidebar-email">{user?.email || ""}</span>
          </div>
        </div>

        <div className="bw-sidebar-menu">
          <div className="bw-sidebar-leagues">
            <div className="bw-sidebar-leagues-title">Tus Ligas</div>
            {loadingLeagues ? (
              <div style={{ padding: "8px", color: "#888", fontSize: "0.85rem" }}>Cargando ligas...</div>
            ) : leagues.length === 0 ? (
              <div style={{ padding: "8px", color: "#888", fontSize: "0.85rem" }}>Aún no estás en ninguna liga</div>
            ) : (
              leagues.map((item) => (
                <Link
                  key={item.porra.id}
                  href={`/porra/${item.porra.id}`}
                  className="bw-league-btn"
                  onClick={() => setSidebarOpen(false)}
                >
                  🏆 <span style={{ flex: 1, fontWeight: 600 }}>{item.porra.name}</span>
                </Link>
              ))
            )}
          </div>

          <Link href="/crear-porra" className="bw-sidebar-item" onClick={() => setSidebarOpen(false)}>
            ➕ AÑADIR LIGA
          </Link>
          <Link href="/unirse" className="bw-sidebar-item" onClick={() => setSidebarOpen(false)}>
            🔗 Unirse con código
          </Link>
          
          <div style={{ height: "1px", background: "#222", margin: "16px 0" }} />
          
          <Link href="/" className="bw-sidebar-item" onClick={() => setSidebarOpen(false)}>
            📊 Clasificación Grupos
          </Link>

          <div style={{ flex: 1 }} />
          
          <button className="bw-sidebar-item bw-sidebar-item-danger" onClick={() => { signOutUser(); setSidebarOpen(false); }}>
            ⏻ Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
