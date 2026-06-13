"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useState, useEffect } from "react";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  return (
    <nav className={`navbar ${menuOpen ? "open" : ""}`}>
      <div className="navbar-header">
        <Link href="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="trophy">🏆</span>
          <span>Porra Mundial 2026</span>
        </Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className={`navbar-collapse ${menuOpen ? "show" : ""}`}>
        <ul className="navbar-nav">
          <li><Link href="/#resultados" onClick={() => setMenuOpen(false)}>Resultados</Link></li>
          <li><Link href="/#grupos" onClick={() => setMenuOpen(false)}>Grupos</Link></li>
        </ul>

        <div className="auth-user">
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme} 
            title="Cambiar tema"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          
          {loading ? null : user ? (
            <UserDropdown user={user} />
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => signInWithGoogle()}
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              Entrar con Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
