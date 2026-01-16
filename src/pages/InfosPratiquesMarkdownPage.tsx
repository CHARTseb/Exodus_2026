import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export type InfoId = "messes-semaines" | "confessions" | "adoration";

const PATHS: Record<InfoId, string> = {
  "messes-semaines": "/specials/messes-semaines.md",
  confessions: "/specials/confessions.md",
  adoration: "/specials/adoration.md",
};

export default function InfosPratiquesMarkdownPage(props: {
  id: InfoId;
  onBack: () => void;
}) {
  const [md, setMd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);
    setMd("");

    fetch(PATHS[props.id])
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} – ${PATHS[props.id]}`);
        }
        return res.text();
      })
      .then((txt) => {
        if (mounted) setMd(txt);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      });

    return () => {
      mounted = false;
    };
  }, [props.id]);

  return (
    <div>
      <button
        onClick={props.onBack}
        style={{
          border: "1px solid var(--border)",
          background: "var(--card)",
          color: "var(--text)",
          borderRadius: 12,
          padding: "8px 10px",
          cursor: "pointer",
          fontWeight: 800,
          marginBottom: 12,
        }}
      >
        ← Retour
      </button>

      {error ? (
        <div
          style={{
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
            borderRadius: 14,
            padding: 12,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            Impossible de charger la page
          </div>
          <div style={{ opacity: 0.85, fontSize: 13 }}>{error}</div>
        </div>
      ) : (
        <ReactMarkdown>{md}</ReactMarkdown>
      )}
    </div>
  );
}
