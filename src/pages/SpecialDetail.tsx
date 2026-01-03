import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { Card } from "../components/Card";
import { cleanMd, mdComponents as baseMdComponents } from "../utils/markdown";
import { SPECIAL_PAGES, type SpecialId } from "../data/specials";

/** Clé localStorage par champ */
function lsKey(id: SpecialId, field: string) {
  return `special:${id}:${field}`;
}

function useLocalField(key: string) {
  const [value, setValue] = useState(() => localStorage.getItem(key) ?? "");
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}

/** Formulaire dédié à "Votre Pourquoi" + verrouillage */
function WhyForm({ id, title }: { id: SpecialId; title: string }) {
  const [dependance, setDependance] = useLocalField(lsKey(id, "dependance"));
  const [personnes, setPersonnes] = useLocalField(lsKey(id, "personnes"));
  const [service, setService] = useLocalField(lsKey(id, "service"));
  const [plan, setPlan] = useLocalField(lsKey(id, "plan"));
  const [pourquoi, setPourquoi] = useLocalField(lsKey(id, "pourquoi"));

  // ✅ Verrouillage persistant
  const lockStorage = `ui:locked:${id}`;
  const [locked, setLocked] = useState<boolean>(() => localStorage.getItem(lockStorage) === "1");

  useEffect(() => {
    localStorage.setItem(lockStorage, locked ? "1" : "0");
  }, [lockStorage, locked]);

  async function exportToClipboard() {
    const content = `# ${title}

## dependance
${dependance.trim()}

## personnes
${personnes.trim()}

## service
${service.trim()}

## plan
${plan.trim()}

## pourquoi
${pourquoi.trim()}
`;
    await navigator.clipboard.writeText(content);
    alert("Copié dans le presse-papiers");
  }

  function clearAll() {
    ["dependance", "personnes", "service", "plan", "pourquoi"].forEach((f) =>
      localStorage.removeItem(lsKey(id, f))
    );
    window.location.reload();
  }

  return (
    <>
      <div className="whyActions">
        <button className="whyBtn" onClick={() => window.print()}>
          Imprimer
        </button>
        <button className="whyBtn" onClick={exportToClipboard}>
          Exporter
        </button>
        <button className="whyBtn" onClick={() => setLocked((v) => !v)}>
          {locked ? "Déverrouiller" : "Verrouiller"}
        </button>
        <button className="whyBtn danger" onClick={clearAll}>
          Effacer
        </button>
      </div>

      <h2>Écrivez votre pourquoi</h2>

      <p>
        Prenez un moment seul, sans vous presser.
        <br />
        Écrivez simplement, avec des mots vrais.
      </p>

      <h3>Ma dépendance / mon attachement principal</h3>
      <div className="whyField">
        <textarea
          className="whyTextarea"
          value={dependance}
          onChange={(e) => setDependance(e.target.value)}
          placeholder="Exemple : téléphone, nourriture, contrôle, pornographie, confort…"
          rows={3}
          readOnly={locked}
        />
      </div>

      <hr />

      <h3>Les personnes pour lesquelles je veux être libre</h3>
      <div className="whyField">
        <textarea
          className="whyTextarea"
          value={personnes}
          onChange={(e) => setPersonnes(e.target.value)}
          placeholder="Exemple : mon épouse, mes enfants, ma fiancée, mes frères, une personne confiée…"
          rows={3}
          readOnly={locked}
        />
      </div>

      <hr />

      <h3>Comment ma liberté les servira concrètement</h3>
      <div className="whyField">
        <textarea
          className="whyTextarea"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Exemple : plus de présence, plus d’écoute, plus de patience, plus de disponibilité…"
          rows={3}
          readOnly={locked}
        />
      </div>

      <hr />

      <h3>Comment cette liberté m’aidera à accomplir le plan de Dieu</h3>
      <div className="whyField">
        <textarea
          className="whyTextarea"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="Exemple : être un homme fidèle, un père juste, un disciple disponible…"
          rows={3}
          readOnly={locked}
        />
      </div>

      <hr />

      <h3>Mon POURQUOI (en une ou deux phrases)</h3>
      <div className="whyField">
        <textarea
          className="whyTextarea"
          value={pourquoi}
          onChange={(e) => setPourquoi(e.target.value)}
          placeholder="« Je veux être libre de … afin de … pour … »"
          rows={2}
          readOnly={locked}
        />
      </div>

      {locked ? (
        <p style={{ opacity: 0.75, marginTop: 8 }}>
          Verrouillé : cliquez sur « Déverrouiller » pour modifier.
        </p>
      ) : null}
    </>
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

  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setMd("");

      try {
        if (!page?.mdPath) throw new Error("mdPath manquant.");
        const res = await fetch(page.mdPath);
        if (!res.ok) throw new Error(`Impossible de charger ${page.mdPath} (HTTP ${res.status})`);
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

  // On rend seulement l'intro du markdown sur "Pourquoi"
  const mdIntro = useMemo(() => {
    if (!isPourquoi) return md;
    const marker = "## Écrivez votre pourquoi";
    const idx = md.indexOf(marker);
    return idx >= 0 ? md.slice(0, idx).trim() : md;
  }, [md, isPourquoi]);

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
          <div className="md bodyText specialPage">
            <ReactMarkdown rehypePlugins={[rehypeRaw]} components={baseMdComponents}>
              {cleanMd(mdIntro)}
            </ReactMarkdown>

            {isPourquoi ? <WhyForm id={id} title={title} /> : null}
          </div>
        )}
      </Card>
    </div>
  );
}
