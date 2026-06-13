"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { signOutUser } from "@/lib/firebase/auth";
import { getUserLeagues } from "@/lib/firebase/firestore";
import { Porra, Apuesta } from "@/lib/firebase/firestore";

interface UserDropdownProps {
  user: User;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const [leagues, setLeagues] = useState<{ porra: Porra; apuesta: Apuesta }[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadLeagues() {
    setLoading(true);
    try {
      const data = await getUserLeagues(user.uid);
      setLeagues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleDropdown() {
    if (!open) {
      loadLeagues();
    }
    setOpen(!open);
  }

  return (
    <div className="user-dropdown-container" ref={wrapperRef}>
      <button className="avatar-btn" onClick={toggleDropdown}>
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt={user.displayName ?? "User"} className="avatar" />
        ) : (
          <div className="avatar" style={{ background: "var(--gradient-gold)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
            {user.displayName?.charAt(0).toUpperCase() ?? "U"}
          </div>
        )}
      </button>

      {open && (
        <div className="user-dropdown-menu">
          <div className="dropdown-user-info">
            <div className="name">{user.displayName}</div>
            <div className="email">{user.email}</div>
          </div>

          <div className="dropdown-section-title">Tus Ligas</div>
          {loading ? (
            <div style={{ padding: "12px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", margin: "0 auto 8px" }} />
              Cargando...
            </div>
          ) : leagues.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
              Aún no estás en ninguna liga
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
              {leagues.map((item) => (
                <Link
                  key={item.porra.id}
                  href={`/porra/${item.porra.id}`}
                  className="dropdown-league-item"
                  onClick={() => setOpen(false)}
                >
                  <span style={{ fontWeight: 600 }}>🏆 {item.porra.name}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.apuesta.totalValue} pts</span>
                </Link>
              ))}
            </div>
          )}

          <div style={{ margin: "8px 0", borderTop: "1px solid var(--border-glass)" }} />
          
          <Link href="/crear-porra" className="dropdown-item" onClick={() => setOpen(false)}>
            <span>✨</span> Crear nueva liga
          </Link>
          <Link href="/unirse" className="dropdown-item" onClick={() => setOpen(false)}>
            <span>🔗</span> Unirse con código
          </Link>

          <div style={{ margin: "8px 0", borderTop: "1px solid var(--border-glass)" }} />

          <button className="dropdown-item danger" onClick={() => signOutUser()}>
            <span>👋</span> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
