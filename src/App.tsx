import React, { useState } from "react";
import Today from "./pages/Today";
import AllDays from "./pages/AllDays";
import DayDetail from "./pages/DayDetail";

type Tab = "today" | "all" | "detail";

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "var(--bg)",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid var(--border)",
  },

  banner: {
    height: 300, // ajuste ici la hauteur du bandeau
    overflow: "hidden",
  },

  bannerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center 20%", // ↓ descend l’image (essaie 70%, 80%, 90%)
    display: "block",
    background: "rgba(255,255,255,0.2)",
  },

  nav: {
    display: "flex",
    gap: 8,
    padding: 12,
  },

  tab: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,.12)",
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
  },

  active: {
    background: "#111827",
    color: "white",
    borderColor: "#111827",
  },
};

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // mémorise d'où on vient quand on ouvre le détail
  const [detailFrom, setDetailFrom] = useState<"today" | "all">("all");

  const openDetailFromToday = (id: number) => {
    setDetailFrom("today");
    setSelectedId(id);
    setTab("detail");
  };

  const openDetailFromAll = (id: number) => {
    setDetailFrom("all");
    setSelectedId(id);
    setTab("detail");
  };

  const goBackFromDetail = () => {
    setTab(detailFrom);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.banner}>
          {/* Mets ton image dans: public/banner.jpg */}
          <img src="/banner.jpg" alt="Bandeau" style={styles.bannerImg} />
        </div>

        <nav style={styles.nav}>
          <button
            style={{ ...styles.tab, ...(tab === "today" ? styles.active : {}) }}
            onClick={() => setTab("today")}
          >
            Aujourd’hui
          </button>

          <button
            style={{ ...styles.tab, ...(tab === "all" ? styles.active : {}) }}
            onClick={() => setTab("all")}
          >
            Tous
          </button>
        </nav>
      </header>

      {tab === "today" ? (
        <Today onOpenDetail={openDetailFromToday} />
      ) : tab === "all" ? (
        <AllDays onSelectDay={openDetailFromAll} />
      ) : selectedId != null ? (
        <DayDetail id={selectedId} onBack={goBackFromDetail} />
      ) : (
        <div style={{ padding: 20 }}>Aucun jour sélectionné.</div>
      )}
    </div>
  );
}
