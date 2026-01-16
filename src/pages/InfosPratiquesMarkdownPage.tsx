import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export type InfoId = "messes-semaines" | "confessions" | "adoration";

const LOADERS: Record<InfoId, () => Promise<string>> = {
  "messes-semaines": async () =>
    (await import("../content/infos-pratiques/messes-semaines.md?raw")).default,
  confessions: async () =>
    (await import("../content/infos-pratiques/confessions.md?raw")).default,
  adoration: async () =>
    (await import("../content/infos-pratiques/adoration.md?raw")).default,
};

export default function InfosPratiquesMarkdownPage(props: {
  id: InfoId;
  onBack: () => void;
}) {
  const [md, setMd] = useState("");

  useEffect(() => {
    let mounted = true;
    LOADERS[props.id]().then((txt) => mounted && setMd(txt));
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

      <ReactMarkdown>{md}</ReactMarkdown>
    </div>
  );
}
