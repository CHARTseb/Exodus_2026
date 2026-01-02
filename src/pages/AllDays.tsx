import { useMemo, useState } from "react";
import { useDays } from "../data/useDays";
import { Card } from "../components/Card";
import type { DayEntry } from "../types";
import ReactMarkdown from "react-markdown";
import { cleanMd, mdComponents } from "../utils/markdown";

function excerpt(s: string | null | undefined, max: number) {
  const t = (s ?? "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max).trimEnd() + "…" : t;
}

export default function AllDays({
  onSelectDay,
}: {
  onSelectDay: (id: number) => void;
}) {
  const { days, error } = useDays();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const sorted = days.slice().sort((a, b) => {
      const da = new Date(String(a.date).trim()).getTime();
      const db = new Date(String(b.date).trim()).getTime();
      return da - db;
    });

    if (!query) return sorted;

    return sorted.filter((d) => {
      const hay = [
        d.date,
        d.titre,
        d.reference_biblique ?? "",
        d.texte_biblique ?? "",
        d.reflexion ?? "",
        d.resolution ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [days, q]);

  if (error) return <div style={{ padding: 20 }}>Erreur: {error}</div>;
  if (!days.length) return <div style={{ padding: 20 }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Tous les jours</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher (titre, référence, mot)…"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,.15)",
          marginBottom: 14,
        }}
      />

      {filtered.map((d: DayEntry) => {
        const biblePreview = excerpt(d.texte_biblique, 180);
        const reflexionPreview = excerpt(d.reflexion, 220);
        const resolutionPreview = excerpt(d.resolution, 160);

        return (
          <div
            key={d.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectDay(d.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelectDay(d.id);
            }}
            style={{ cursor: "pointer" }}
          >
            <Card title={d.titre}>
              {d.reference_biblique ? (
                <div style={{ opacity: 0.9, marginBottom: 8 }}>
                  <b>{d.reference_biblique}</b>
                </div>
              ) : null}

              {biblePreview ? (
                <div
                  className="bibleText"
                  style={{ fontStyle: "italic", opacity: 0.9, marginBottom: 10 }}
                >
                  {biblePreview}
                </div>
              ) : null}

              {reflexionPreview ? (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, opacity: 0.9 }}>
                    Réflexion
                  </div>
                  <div className="md bodyText">
                    <ReactMarkdown components={mdComponents}>
                      {cleanMd(reflexionPreview)}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {resolutionPreview ? (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4, opacity: 0.9 }}>
                    Résolution
                  </div>
                  <div className="md bodyText">
                    <ReactMarkdown components={mdComponents}>
                      {cleanMd(resolutionPreview)}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {/* Paroisse non affichée dans l'aperçu */}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
