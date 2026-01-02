import { useMemo } from "react";
import { useDays } from "../data/useDays";
import { Card } from "../components/Card";
import type { DayEntry } from "../types";
import ReactMarkdown from "react-markdown";
import { formatDateFR } from "../utils/date";
import { cleanMd, mdComponents } from "../utils/markdown";

function toIsoDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Today({
  onOpenDetail,
}: {
  onOpenDetail: (id: number) => void;
}) {
  const { days, error } = useDays();
  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const sortedByDate = useMemo(() => {
    return days.slice().sort((a, b) => {
      const da = new Date(String(a.date).trim()).getTime();
      const db = new Date(String(b.date).trim()).getTime();
      return da - db;
    });
  }, [days]);

  const todayEntry: DayEntry | undefined = useMemo(
    () => days.find((d) => String(d.date).trim() === todayIso),
    [days, todayIso]
  );

  const firstEntry = sortedByDate[0];

  if (error) return <div style={{ padding: 20 }}>Erreur: {error}</div>;
  if (!days.length) return <div style={{ padding: 20 }}>Chargement…</div>;

  if (!todayEntry) {
    return (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>Aujourd’hui</h1>

        <Card title="Pas de contenu pour aujourd’hui">
          <div style={{ opacity: 0.85, lineHeight: 1.35 }}>
            Aucune entrée n’est prévue pour la date du jour ({formatDateFR(todayIso)}
            ).
          </div>

          {firstEntry ? (
            <div style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.35 }}>
              Le parcours commence le {formatDateFR(firstEntry.date)}.
            </div>
          ) : null}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Aujourd’hui</h1>

      <Card title={todayEntry.titre}>
        {/* Date + bouton Détail */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10,
            opacity: 0.9,
          }}
        >
          <b>{formatDateFR(todayEntry.date)}</b>

          <button
            onClick={() => onOpenDetail(todayEntry.id)}
            style={{
              border: "1px solid rgba(0,0,0,.15)",
              background: "white",
              borderRadius: 12,
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Détail →
          </button>
        </div>

        {/* Référence biblique */}
        {todayEntry.reference_biblique ? (
          <div style={{ opacity: 0.9, marginBottom: 10 }}>
            <b>{todayEntry.reference_biblique}</b>
          </div>
        ) : null}

        {/* Texte biblique */}
        {todayEntry.texte_biblique ? (
          <div
            className="bibleText"
            style={{ fontStyle: "italic", marginBottom: 14, opacity: 0.95 }}
          >
            {todayEntry.texte_biblique}
          </div>
        ) : null}

        {/* Réflexion */}
        {todayEntry.reflexion ? (
          <>
            <h3 style={{ margin: "10px 0 4px" }}>Réflexion</h3>
            <div className="md bodyText">
              <ReactMarkdown components={mdComponents}>
                {cleanMd(todayEntry.reflexion)}
              </ReactMarkdown>
            </div>
          </>
        ) : null}

        {/* Résolution */}
        {todayEntry.resolution ? (
          <>
            <h3 style={{ margin: "10px 0 4px" }}>Résolution</h3>
            <div className="md bodyText">
              <ReactMarkdown components={mdComponents}>
                {cleanMd(todayEntry.resolution)}
              </ReactMarkdown>
            </div>
          </>
        ) : null}

        {/* Paroisse */}
        {todayEntry.paroisse ? (
          <>
            <h3 style={{ margin: "10px 0 4px" }}>Proposition en paroisse</h3>
            <div className="md bodyText">
              <ReactMarkdown components={mdComponents}>
                {cleanMd(todayEntry.paroisse)}
              </ReactMarkdown>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}
