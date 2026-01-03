import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { Card } from "../components/Card";
import { cleanMd, mdComponents as baseMdComponents } from "../utils/markdown";
import { SPECIAL_PAGES, type SpecialId } from "../data/specials";

/* =========================================================
   Utils
   ========================================================= */

function storageKey(pageId: SpecialId, fieldKey: string) {
  return `special:${pageId}:${fieldKey}`;
}

/* =========================================================
   Editable block
   ========================================================= */

function EditableBlock({
  lsKey,
  placeholder,
  rows = 4,
}: {
  lsKey: string;
  placeholder?: string;
  rows?: number;
}) {
  const [value, setValue] = useState<string>(() => localStorage.getItem(lsKey) ?? "");

  useEffect(() => {
    localStorage.setItem(lsKey, value);
  }, [lsKey, value]);

  return (
    <div className="whyField">
      <textarea
        className="whyTextarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

/* =========================================================
   Page
   ========================================================= */

export default function SpecialDetail({
  id,
  onBack,
}: {
  id: SpecialId;
  onBack: () => void;
}) {
  const page = useMemo(() => SPECIAL_PAGES.find((p) => p.id === id), [id]);
  const title = page?.title ?? "Page spéciale";

  const isPourquoi = id === "pourquoi";

  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Marqueur détecté avant le prochain blockquote */
  const pendingEditableKey = useRef<string | null>(null);

  /* =======================================================
     Load markdown
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (!page?.mdPath) throw new Error("mdPath manquant.");

        const res = await fetch(page.mdPath);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

        const text = await res.text();
        if (!cancelled) setMd(text);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  /* =======================================================
     Export
     ======================================================= */

  async function exportToClipboard() {
    const prefix = `special:${id}:`;
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix)).sort();

    const content =
      `# ${title}\n\n` +
      keys
        .map((k) => {
          const section = k.slice(prefix.length);
          const value = (localStorage.getItem(k) ?? "").trim();
          return `## ${section}\n${value}`;
        })
        .join("\n\n");

    await navigator.clipboard.writeText(content);
    alert("Copié dans le presse-papiers");
  }

  function clearAll() {
    const prefix = `special:${id}:`;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  /* =======================================================
     Markdown components
     ======================================================= */

  const mdComponents = useMemo(() => {
    if (!isPourquoi) return baseMdComponents;

    return {
      ...baseMdComponents,

      /** Marker HTML fiable */
      span({ node, ...props }: any) {
        const key = node?.properties?.["data-editable"];
        if (typeof key === "string") {
          pendingEditableKey.current = key.toLowerCase();
          return null;
        }
        return <span {...props} />;
      },

      /** Blockquote → textarea si un marker a été vu juste avant */
      blockquote({ children }: any) {
        const fieldKey = pendingEditableKey.current;
        pendingEditableKey.current = null;

        if (!fieldKey) {
          return <blockquote>{children}</blockquote>;
        }

        return (
          <EditableBlock
            lsKey={storageKey(id, fieldKey)}
            placeholder="Écrivez ici…"
            rows={fieldKey === "pourquoi" ? 3 : 4}
          />
        );
      },
    };
  }, [id, isPourquoi]);

  /* =======================================================
     Render
     ======================================================= */

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <button
        onClick={onBack}
        style={{
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.08)",
          color: "var(--text)",
          borderRadius: 12,
          padding: "8px 12px",
          cursor: "pointer",
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        ← Retour
      </button>

      <Card title={title}>
        {loading ? (
          <div>Chargement…</div>
        ) : error ? (
          <div>Erreur : {error}</div>
        ) : (
          <>
            {isPourquoi && (
              <div className="whyActions">
                <button className="whyBtn" onClick={() => window.print()}>
                  Imprimer
                </button>
                <button className="whyBtn" onClick={exportToClipboard}>
                  Exporter
                </button>
                <button className="whyBtn danger" onClick={clearAll}>
                  Effacer
                </button>
              </div>
            )}

            <div className="md bodyText specialPage">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} components={mdComponents}>
                {cleanMd(md)}
              </ReactMarkdown>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
