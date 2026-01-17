import { useEffect, useState } from "react";
import Today from "./pages/Today";
import AllDays from "./pages/AllDays";
import DayDetail from "./pages/DayDetail";
import Specials from "./pages/Specials";
import SpecialDetail from "./pages/SpecialDetail";
import Notebook from "./pages/Notebook";
import InfosPratiquesHome from "./pages/InfosPratiquesHome";
import InfosPratiquesMarkdownPage, {
  type InfoId,
} from "./pages/InfosPratiquesMarkdownPage";
import type { SpecialId } from "./data/specials";
import "./App.css";

/* =========================
   Types
   ========================= */

type Tab = "today" | "all" | "notebook" | "special" | "infos";
type ThemeMode = "auto" | "dark" | "light";
type FontSize = "small" | "normal" | "large" | "xlarge";

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
   Taille du texte (UI scale)
   ========================= */

function getSavedFontSize(): FontSize {
  const v = localStorage.getItem("fontSize");
  return v === "small" || v === "large" || v === "xlarge" || v === "normal"
    ? v
    : "normal";
}

function applyFontSize(size: FontSize) {
  const scale =
    size === "small"
      ? 0.9
      : size === "large"
      ? 1.15
      : size === "xlarge"
      ? 1.3
      : 1;

  document.documentElement.style.setProperty("--ui-scale", String(scale));
  localStorage.setItem("fontSize", size);
}

/* =========================
   App
   ========================= */

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [menuOpen, setMenuOpen] = useState(false);

  const [detailId, setDetailId] = useState<number | null>(null);
  const [backTab, setBackTab] = useState<Tab>("today");

  const [specialId, setSpecialId] = useState<SpecialId | null>(null);
  const [specialBackTab, setSpecialBackTab] = useState<Tab>("today");

  const [infoId, setInfoId] = useState<InfoId | null>(null);
  const [infoBackTab, setInfoBackTab] = useState<Tab>("today");

  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof window === "undefined" ? "auto" : getSavedTheme()
  );

  const [fontSize, setFontSize] = useState<FontSize>(() =>
    typeof window === "undefined" ? "normal" : getSavedFontSize()
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  /* =========================
     Navigation helpers
     ========================= */

  function openDetail(from: Tab, id: number) {
    setBackTab(from);
    setDetailId(id);
    setMenuOpen(false);
  }

  function openSpecial(from: Tab, id: SpecialId) {
    setSpecialBackTab(from);
    setTab("special");
    setSpecialId(id);
    setMenuOpen(false);
  }

  function openInfo(from: Tab, id: InfoId) {
    setInfoBackTab(from);
    setTab("infos");
    setInfoId(id);
    setMenuOpen(false);
  }

  /* =========================
     Titre top bar
     ========================= */

  const topTitle = detailId
    ? "Détail"
    : specialId
    ? "Pages spéciales"
    : infoId
    ? "Infos pratiques"
    : tab === "today"
    ? "Aujourd’hui"
    : tab === "all"
    ? "Tous les jours"
    : tab === "notebook"
    ? "Mon carnet"
    : tab === "infos"
    ? "Infos pratiques"
    : "Pages spéciales";

  /* =========================
     Render
     ========================= */

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={styles.topBar}>
        <div style={styles.topTitle}>{topTitle}</div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={styles.burgerBtn}
        >
          ☰
        </button>
      </header>

      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button style={styles.menuItem} onClick={() => setTab("today")}>
              Aujourd’hui
            </button>
            <button style={styles.menuItem} onClick={() => setTab("all")}>
              Tous les jours
            </button>
            <button style={styles.menuItem} onClick={() => setTab("notebook")}>
              Mon carnet
            </button>
            <button style={styles.menuItem} onClick={() => setTab("infos")}>
              Infos pratiques
            </button>
            <button style={styles.menuItem} onClick={() => setTab("special")}>
              Pages spéciales
            </button>

            <div style={{ marginTop: 14, fontWeight: 900 }}>Taille du texte</div>

            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSize)}
              style={styles.select}
            >
              <option value="small">Petit</option>
              <option value="normal">Normal</option>
              <option value="large">Grand</option>
              <option value="xlarge">Très grand</option>
            </select>
          </div>
        </div>
      )}

      <main style={{ padding: 16 }}>
        {detailId ? (
          <DayDetail id={detailId} onBack={() => setDetailId(null)} />
        ) : specialId ? (
          <SpecialDetail id={specialId} onBack={() => setSpecialId(null)} />
        ) : infoId ? (
          <InfosPratiquesMarkdownPage
            id={infoId}
            onBack={() => setInfoId(null)}
          />
        ) : tab === "today" ? (
          <Today onOpenDetail={(id) => openDetail("today", id)} />
        ) : tab === "all" ? (
          <AllDays onSelectDay={(id) => openDetail("all", id)} />
        ) : tab === "notebook" ? (
          <Notebook onOpenDetail={(id) => openDetail("notebook", id)} />
        ) : tab === "infos" ? (
          <InfosPratiquesHome onOpen={(id) => openInfo("infos", id)} />
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
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "rgba(0,0,0,0.25)",
    color: "white",
  },
  topTitle: {
    fontWeight: 900,
    fontSize: 18,
  },
  burgerBtn: {
    fontSize: 18,
    fontWeight: 900,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: 280,
    background: "var(--card)",
    padding: 16,
  },
  menuItem: {
    width: "100%",
    marginBottom: 10,
  },
  select: {
    width: "100%",
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
  },
};
