import { useEffect, useState } from "react";
import Today from "./pages/Today";
import AllDays from "./pages/AllDays";
import DayDetail from "./pages/DayDetail";
import Specials from "./pages/Specials";
import SpecialDetail from "./pages/SpecialDetail";
import Notebook from "./pages/Notebook";
import { SPECIAL_PAGES, type SpecialId } from "./data/specials";
import "./App.css";

/* =========================
   Types
   ========================= */

type Tab = "today" | "all" | "notebook" | "special";
type ThemeMode = "auto" | "dark" | "light";

/* =========================
   Thème
   ========================= */

function getSavedTheme(): ThemeMode {
  const v = localStorage.getItem("theme");
  return v === "dark" || v === "light" || v === "auto" ? v : "auto";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
}

/* =========================
   App
   ========================= */

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [menuOpen, setMenuOpen] = useState(false);

  // Détail jour
  const [detailId, setDetailId] = useState<number | null>(null);
  const [backTab, setBackTab] = useState<Tab>("today");

  // Pages spéciales
  const [specialId, setSpecialId] = useState<SpecialId | null>(null);
  const [specialBackTab, setSpecialBackTab] = useState<Tab>("today");

  // Thème
  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof window === "undefined" ? "auto" : getSavedTheme()
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* =========================
     Navigation helpers
     ========================= */

  function openDetail(from: Tab, id: number) {
    setBackTab(from);
    setDetailId(id);
    setMenuOpen(false);
  }

  function goBackDay() {
    setDetailId(null);
    setTab(backTab);
  }

  function openSpecial(from: Tab, id: SpecialId) {
    setSpecialBackTab(from);
    setTab("special");
    setSpecialId(id);
    setMenuOpen(false);
  }

  function goBackSpecial() {
    setSpecialId(null);
    setTab(specialBackTab === "special" ? "special" : specialBackTab);
  }

  /* =========================
     Titre top bar
     ========================= */

  const topTitle = detailId
    ? "Détail"
    : specialId
    ? "Pages spéciales"
    : tab === "today"
    ? "Aujourd’hui"
    : tab === "all"
    ? "Tous les jours"
    : tab === "notebook"
    ? "Mon carnet"
    : "Pages spéciales";

  /* =========================
     Render
     ========================= */

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Bandeau */}
      <div style={styles.bannerWrap}>
        <img src="/banner.jpg" alt="Exodus" style={styles.bannerImg} />
      </div>

      {/* Top bar */}
      <header style={styles.topBar}>
        <div style={styles.topTitle}>{topTitle}</div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={styles.burgerBtn}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      </header>

      {/* Menu burger */}
      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Menu</div>

            {/* Navigation principale */}
            <button
              style={{
                ...styles.menuItem,
                ...(tab === "today" && !detailId && !specialId
                  ? styles.menuActive
                  : {}),
              }}
              onClick={() => {
                setDetailId(null);
                setSpecialId(null);
                setTab("today");
                setMenuOpen(false);
              }}
            >
              Aujourd’hui
            </button>

            <button
              style={{
                ...styles.menuItem,
                ...(tab === "all" && !detailId && !specialId
                  ? styles.menuActive
                  : {}),
              }}
              onClick={() => {
                setDetailId(null);
                setSpecialId(null);
                setTab("all");
                setMenuOpen(false);
              }}
            >
              Tous les jours
            </button>

            <button
              style={{
                ...styles.menuItem,
                ...(tab === "notebook" && !detailId
                  ? styles.menuActive
                  : {}),
              }}
              onClick={() => {
                setDetailId(null);
                setSpecialId(null);
                setTab("notebook");
                setMenuOpen(false);
              }}
            >
              Mon carnet
            </button>

            <button
              style={{
                ...styles.menuItem,
                ...(tab === "special" && !detailId
                  ? styles.menuActive
                  : {}),
              }}
              onClick={() => {
                setDetailId(null);
                setSpecialId(null);
                setTab("special");
                setMenuOpen(false);
              }}
            >
              Pages spéciales
            </button>

            {/* Thème */}
            <div style={{ marginTop: 10, fontWeight: 900, opacity: 0.9 }}>
              Thème
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {(["auto", "dark", "light"] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  style={{
                    ...styles.menuItem,
                    marginBottom: 0,
                    flex: 1,
                    textAlign: "center",
                    ...(theme === m ? styles.menuActive : {}),
                  }}
                  onClick={() => setTheme(m)}
                >
                  {m === "auto" ? "Auto" : m === "dark" ? "Sombre" : "Clair"}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12 }}>
              Exodus PWA
            </div>
          </div>
        </div>
      )}

      {/* Contenu */}
      <main style={{ padding: 16 }}>
        {detailId ? (
          <DayDetail id={detailId} onBack={goBackDay} />
        ) : specialId ? (
          <SpecialDetail id={specialId} onBack={goBackSpecial} />
        ) : tab === "today" ? (
          <Today onOpenDetail={(id) => openDetail("today", id)} />
        ) : tab === "all" ? (
          <AllDays onSelectDay={(id) => openDetail("all", id)} />
        ) : tab === "notebook" ? (
          <Notebook onOpenDetail={(id) => openDetail("notebook", id)} />
        ) : (
          <Specials onOpen={(id) => openSpecial("special", id)} />
        )}
      </main>
    </div>
  );
}

/* =========================
   Styles
   ========================= */

const styles: Record<string, React.CSSProperties> = {
  bannerWrap: {
    height: 220,
    overflow: "hidden",
    borderBottom: "1px solid var(--border)",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center 20%",
    display: "block",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(0,0,0,0.20)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid var(--border)",
  },
  topTitle: {
    color: "white",
    fontWeight: 900,
    fontSize: 18,
    letterSpacing: 0.2,
  },
  burgerBtn: {
    border: "1px solid var(--border)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    borderRadius: 12,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 18,
    lineHeight: 1,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 50,
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: 290,
    height: "100%",
    background: "var(--card)",
    borderLeft: "1px solid var(--border)",
    padding: 16,
    boxShadow: "var(--shadow)",
    color: "var(--text)",
    overflowY: "auto",
  },
  menuItem: {
    width: "100%",
    textAlign: "left",
    border: "1px solid var(--border)",
    background: "rgba(255,255,255,0.06)",
    color: "var(--text)",
    borderRadius: 14,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 800,
    marginBottom: 10,
  },
  menuActive: {
    background: "var(--accentSoft)",
    borderColor: "var(--accentBorder)",
  },
};
