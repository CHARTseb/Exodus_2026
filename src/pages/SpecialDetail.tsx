import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/Card";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { cleanMd, mdComponents as baseMdComponents } from "../utils/markdown";
import { SPECIAL_PAGES, type SpecialId } from "../data/specials";

function storageKey(pageId: SpecialId, fieldKey: string) {
  return `special:${pageId}:${fieldKey}`;
}

function Callout({ children }: { children: React.ReactNode }) {
  return <div className="calloutBox">{children}</div>;
}

function EditableBlock({
  lsKey,
  placeholder,
  locked,
  onReset,
  rows = 4,
}: {
  lsKey: string;
  placeholder?: string;
  locked: boolean;
  onReset: () => void;
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
        readOnly={locked}
      />
      <div className="whyFieldActions">
        <button className="whyMiniBtn" onClick={onReset} disabled={locked && !value}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

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

  const [md, setMd] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [locked, setLocked] = useState<boolean>(() => localStorage.getItem(`ui:locked:${id}`) === "1");

  // Marqueur editable détecté juste avant le prochain blockquote
  const pendingEditableKey = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem(`ui:locked:${id}`, locked ? "1" : "0");
  }, [id, locked]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setMd("");

      try {
        if (!page) throw new Error("Page introuvable (id inconnu).");
        if (!("mdPath" in page) || !page.mdPath) throw new Error("mdPath manquant pour cette page.");

        const res = await fetch(page.mdPath);
        if (!res.ok) throw new Error(`Impossible de charger ${page.mdPath} (HTTP ${res.status})`);

        const text = await res.text();
        if (!cancelled) setMd(text);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function exportToClipboard() {
    const prefix = `special:${id}:`;
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    keys.sort();

    const content =
      `# ${title}\n\n` +
      keys
        .map((k) => {
          const field = k.slice(prefix.length);
          const val = (localStorage.getItem(k) ?? "").trim();
          return `## ${field}\n${val}`;
        })
        .join("\n\n");

    await navigator.clipboard.writeText(content);
    alert("✅ Copié dans le presse-papiers");
  }

  function clearAll() {
    const prefix = `special:${id}:`;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  function resetField(fieldKey: string) {
    localStorage.removeItem(storageKey(id, fieldKey));
    window.location.reload();
  }

  const mdComponents = useMemo(() => {
    if (!isPourquoi) return baseMdComponents;

    return {
      ...baseMdComponents,

      // Supporte :::callout ... :::
      // Ton cleanMd/mdComponents gère peut-être déjà ça. Si oui, tu peux supprimer cette partie.
      p({ children }: any) {
        // Détection du marqueur <!-- editable:xxx --> isolé en paragraphe
        const raw = Array.isArray(children) ? children.join("") : String(children ?? "");
        const m = raw.match(/editable:([a-z0-9_-]+)/i);
        if (m) {
          pendingEditableKey.current = m[1].toLowerCase();
          return null;
        }
        return <p>{children}</p>;
      },

      // Si ton parser remonte les commentaires HTML en tant que "html", on capture ici aussi
      // (selon tes options react-markdown, ça peut varier)
      // @ts-ignore
      html({ value }: any) {
        const m = String(value ?? "").match(/<!--\s*editable:([a-z0-9_-]+)\s*-->/i);
        if (m) {
          pendingEditableKey.current = m[1].toLowerCase();
          return null;
        }
        return null;
      },

      // Blockquote : editable seulement si un marqueur "editable" vient juste avant
      blockquote({ children }: any) {
        const fieldKey = pendingEditableKey.current;
        pendingEditableKey.current = null;

        if (!fieldKey) {
          // Pas un champ => rendu normal (ex: citation ou encadré si tu veux)
          return <blockquote>{children}</blockquote>;
        }

        const lsKey = storageKey(id, fieldKey);

        return (
          <EditableBlock
            lsKey={lsKey}
            placeholder="Écrivez ici…"
            locked={locked}
            onReset={() => resetField(fieldKey)}
            rows={fieldKey === "pourquoi" ? 3 : 4}
          />
        );
      },

      // Optionnel : si tu veux un vrai composant "callout" au lieu de blockquote
      // Ici on laisse tes :::callout être gérés par ton système de cleanMd/mdComponents.
      // Si tu n’as pas de support, dis-moi et je te donne un mini-parser très simple.
      // @ts-ignore
      div({ className, children }: any) {
        if (className === "callout") return <Callout>{children}</Callout>;
        return <div className={className}>{children}</div>;
      },
    };
  }, [isPourquoi, id, locked]);

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
          <div style={{ opacity: 0.85 }}>Chargement…</div>
        ) : error ? (
          <div style={{ opacity: 0.88, lineHeight: 1.35 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Erreur</div>
            <div>{error}</div>
            {page?.mdPath ? (
              <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
                Fichier : {page.mdPath}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            {isPourquoi ? (
              <div className="whyActions">
                <button className="whyBtn" onClick={() => window.print()}>
                  Imprimer
                </button>
                <button className="whyBtn" onClick={exportToClipboard}>
                  Exporter (copier)
                </button>
                <button className="whyBtn" onClick={() => setLocked((v) => !v)}>
                  {locked ? "Déverrouiller" : "Verrouiller"}
                </button>
                <button className="whyBtn danger" onClick={clearAll}>
                  Effacer tout
                </button>
              </div>
            ) : null}

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
