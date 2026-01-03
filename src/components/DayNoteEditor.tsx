import { useEffect, useMemo, useState } from "react";
import { deleteNote, getNote, setNote } from "../utils/notes";

export default function DayNoteEditor({ dayId }: { dayId: string }) {
  const initial = useMemo(() => getNote(dayId)?.text ?? "", [dayId]);
  const [text, setText] = useState(initial);
  const [savedAt, setSavedAt] = useState<string | null>(getNote(dayId)?.updatedAt ?? null);

  useEffect(() => {
    setText(getNote(dayId)?.text ?? "");
    setSavedAt(getNote(dayId)?.updatedAt ?? null);
  }, [dayId]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      // Ne pas créer une note vide “fantôme”
      if (text.trim() === "") {
        deleteNote(dayId);
        setSavedAt(null);
      } else {
        setNote(dayId, text);
        setSavedAt(getNote(dayId)?.updatedAt ?? null);
      }
    }, 400);

    return () => window.clearTimeout(t);
  }, [dayId, text]);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
        <div style={{ fontWeight: 800 }}>Note personnelle</div>
        <div style={{ opacity: 0.75, fontSize: 12 }}>
          {savedAt ? `Enregistré : ${new Date(savedAt).toLocaleString()}` : "Aucune note"}
        </div>
      </div>

      <textarea
        className="whyTextarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Écrivez votre note du jour…"
        rows={7}
      />

      <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
        <button
          className="whyMiniBtn"
          onClick={() => {
            deleteNote(dayId);
            setText("");
            setSavedAt(null);
          }}
          disabled={!savedAt && text.trim() === ""}
        >
          Effacer la note
        </button>
      </div>
    </div>
  );
}
