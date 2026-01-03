import { useMemo, useState } from "react";
import { useDays } from "../data/useDays";
import { listAllNotes } from "../utils/notes";
import { Card } from "../components/Card";
import { formatDateFR } from "../utils/date";

export default function Notebook({
  onOpenDetail,
}: {
  onOpenDetail: (id: number) => void;
}) {
  const { days, error } = useDays();
  const [q, setQ] = useState("");

  const notes = useMemo(() => listAllNotes(), []);
  const dayById = useMemo(() => {
    const map = new Map<number, any>();
    for (const d of days) map.set(d.id, d);
    return map;
  }, [days]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return notes;
    return notes.filter(({ dayId, note }) => {
      return (
        dayId.toLowerCase().includes(qq) ||
        note.text.toLowerCase().includes(qq)
      );
    });
  }, [q, notes]);

  if (error) return <div style={{ padding: 20 }}>Erreur: {error}</div>;
  if (!days.length) return <div style={{ padding: 20 }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Mon carnet</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher dans mes notes…"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.06)",
          color: "var(--text)",
          marginBottom: 12,
        }}
      />

      {filtered.length === 0 ? (
        <Card title="Aucune note">
          <div style={{ opacity: 0.85, lineHeight: 1.35 }}>
            Vos notes apparaîtront ici dès que vous écrirez une note sur un jour.
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map(({ dayId, note }) => {
            const idNum = Number(dayId);
            const day = Number.isFinite(idNum) ? dayById.get(idNum) : undefined;

            const title = day?.titre ? day.titre : `Jour ${dayId}`;
            const dateLabel = day?.date ? formatDateFR(day.date) : null;

            return (
              <div
                key={dayId}
                style={{
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 14,
                  padding: 12,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (Number.isFinite(idNum)) onOpenDetail(idNum);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{title}</div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>
                    {new Date(note.updatedAt).toLocaleString()}
                  </div>
                </div>

                {dateLabel ? (
                  <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                    {dateLabel}
                  </div>
                ) : null}

                <div style={{ marginTop: 8, opacity: 0.92, lineHeight: 1.35 }}>
                  {note.text.length > 220 ? note.text.slice(0, 220) + "…" : note.text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
