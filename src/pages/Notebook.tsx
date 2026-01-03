import { useMemo, useState } from "react";
import { useDays } from "../data/useDays";
import { listAllNotes } from "../utils/notes";
import { Card } from "../components/Card";
import { formatDateFR } from "../utils/date";

type PeriodPreset = "all" | "7d" | "30d" | "thisMonth" | "custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function toISODateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODateInputValue(s: string): Date | null {
  if (!s) return null;
  const [yy, mm, dd] = s.split("-").map((v) => Number(v));
  if (!yy || !mm || !dd) return null;
  // midi local pour éviter les surprises de timezone
  return new Date(yy, mm - 1, dd, 12, 0, 0, 0);
}

export default function Notebook({
  onOpenDetail,
}: {
  onOpenDetail: (id: number) => void;
}) {
  const { days, error } = useDays();
  const [q, setQ] = useState("");

  // Période
  const [preset, setPreset] = useState<PeriodPreset>("all");
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6); // 7 jours incluant aujourd’hui
    return d;
  }, [today]);

  const [fromStr, setFromStr] = useState(toISODateInputValue(defaultFrom));
  const [toStr, setToStr] = useState(toISODateInputValue(today));

  // Notes
  const notes = useMemo(() => listAllNotes(), []);

  const dayById = useMemo(() => {
    const map = new Map<number, any>();
    for (const d of days) map.set(d.id, d);
    return map;
  }, [days]);

  // Range timestamps (ms)
  const periodRange = useMemo(() => {
    if (preset === "all") return { from: null as number | null, to: null as number | null };

    if (preset === "7d") {
      return {
        from: startOfDay(defaultFrom).getTime(),
        to: endOfDay(today).getTime(),
      };
    }

    if (preset === "30d") {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return {
        from: startOfDay(d).getTime(),
        to: endOfDay(today).getTime(),
      };
    }

    if (preset === "thisMonth") {
      const fromD = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0);
      const toD = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12, 0, 0, 0);
      return {
        from: startOfDay(fromD).getTime(),
        to: endOfDay(toD).getTime(),
      };
    }

    // custom
    const fromD = parseISODateInputValue(fromStr);
    const toD = parseISODateInputValue(toStr);
    return {
      from: fromD ? startOfDay(fromD).getTime() : null,
      to: toD ? endOfDay(toD).getTime() : null,
    };
  }, [preset, today, defaultFrom, fromStr, toStr]);

  // Enrichit les notes avec infos du jour + date pour filtrage
  const notesEnriched = useMemo(() => {
    return notes.map(({ dayId, note }) => {
      const idNum = Number(dayId);
      const day = Number.isFinite(idNum) ? dayById.get(idNum) : undefined;

      // On filtre par la date du "jour" si elle existe, sinon fallback sur updatedAt
      const dayDateMs = day?.date ? Date.parse(day.date) : NaN;
      const filterDateMs = Number.isFinite(dayDateMs) ? dayDateMs : note.updatedAt;

      return { dayId, idNum, day, note, filterDateMs };
    });
  }, [notes, dayById]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const { from, to } = periodRange;

    return notesEnriched.filter((x) => {
      if (qq) {
        const okText =
          x.dayId.toLowerCase().includes(qq) ||
          (x.note.content ?? "").toLowerCase().includes(qq);
        if (!okText) return false;
      }

      if (from != null && x.filterDateMs < from) return false;
      if (to !=null && x.filterDateMs > to) return false;

      return true;
    });
  }, [q, notesEnriched, periodRange]);

  function exportAsMarkdown() {
    const lines: string[] = [];

    const { from, to } = periodRange;
    const periodLabel =
      preset === "all"
        ? "Toutes les notes"
        : preset === "7d"
          ? "7 derniers jours"
          : preset === "30d"
            ? "30 derniers jours"
            : preset === "thisMonth"
              ? "Ce mois"
              : `Période personnalisée: ${fromStr || "?"} → ${toStr || "?"}`;

    lines.push(`# Exodus — Mon carnet`);
    lines.push("");
    lines.push(`- Période : **${periodLabel}**`);
    if (from != null || to != null) {
      lines.push(
        `- Filtre dates : **${from != null ? new Date(from).toLocaleDateString() : "…"} → ${
          to != null ? new Date(to).toLocaleDateString() : "…"
        }**`
      );
    }
    if (q.trim()) lines.push(`- Recherche : \`${q.trim()}\``);
    lines.push(`- Exporté le : ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push(`---`);
    lines.push("");

    for (const x of filtered) {
      const title = x.day?.titre ? x.day.titre : `Jour ${x.dayId}`;
      const dateLabel = x.day?.date ? formatDateFR(x.day.date) : null;

      lines.push(`## ${title}`);
      if (dateLabel) lines.push(`_${dateLabel}_`);
      lines.push("");
      lines.push(`**Modifié :** ${new Date(x.note.updatedAt).toLocaleString()}`);
      lines.push("");

      // Bloc citation => très lisible + imprimable
      const content = (x.note.content ?? "").trim();
      lines.push(`> ${content.replace(/\n/g, "\n> ")}`);
      lines.push("");
      lines.push(`---`);
      lines.push("");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const stamp = new Date();
    const fileStamp = `${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, "0")}-${String(
      stamp.getDate()
    ).padStart(2, "0")}`;
    a.download = `exodus-carnet-${fileStamp}.md`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportAsPdfViaPrint() {
    window.print(); // ensuite: "Enregistrer en PDF"
  }

  if (error) return <div style={{ padding: 20 }}>Erreur: {error}</div>;
  if (!days.length) return <div style={{ padding: 20 }}>Chargement…</div>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <div
        className="noPrint"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Mon carnet</h1>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="whyMiniBtn" onClick={exportAsMarkdown} disabled={filtered.length === 0}>
            Export Markdown
          </button>
          <button className="whyMiniBtn" onClick={exportAsPdfViaPrint} disabled={filtered.length === 0}>
            Export PDF / Imprimer
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="noPrint" style={{ display: "grid", gap: 10, marginBottom: 12 }}>
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
          }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as PeriodPreset)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.06)",
              color: "var(--text)",
            }}
          >
            <option value="all">Toutes</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="thisMonth">Ce mois</option>
            <option value="custom">Période…</option>
          </select>

          {preset === "custom" ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ opacity: 0.85, fontSize: 12 }}>Du</label>
              <input
                type="date"
                value={fromStr}
                onChange={(e) => setFromStr(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text)",
                }}
              />
              <label style={{ opacity: 0.85, fontSize: 12 }}>au</label>
              <input
                type="date"
                value={toStr}
                onChange={(e) => setToStr(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text)",
                }}
              />
            </div>
          ) : null}

          <div style={{ opacity: 0.7, fontSize: 12 }}>
            {filtered.length} note{filtered.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <Card title="Aucune note">
          <div style={{ opacity: 0.85, lineHeight: 1.35 }}>
            Vos notes apparaîtront ici dès que vous écrirez une note sur un jour.
          </div>
        </Card>
      ) : (
        <div className="printArea" style={{ display: "grid", gap: 10 }}>
          {filtered.map((x) => {
            const title = x.day?.titre ? x.day.titre : `Jour ${x.dayId}`;
            const dateLabel = x.day?.date ? formatDateFR(x.day.date) : null;

            const preview =
              x.note.content.length > 220 ? x.note.content.slice(0, 220) + "…" : x.note.content;

            return (
              <div
                key={x.dayId}
                style={{
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 14,
                  padding: 12,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (Number.isFinite(x.idNum)) onOpenDetail(x.idNum);
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
                    {new Date(x.note.updatedAt).toLocaleString()}
                  </div>
                </div>

                {dateLabel ? (
                  <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>{dateLabel}</div>
                ) : null}

                <div style={{ marginTop: 8, opacity: 0.92, lineHeight: 1.35 }}>{preview}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
