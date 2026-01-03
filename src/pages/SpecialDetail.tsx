import { Card } from "../components/Card";
import ReactMarkdown from "react-markdown";
import { cleanMd, mdComponents } from "../utils/markdown";
import { SPECIAL_PAGES, type SpecialId } from "../data/specials";

export default function SpecialDetail({
  id,
  onBack,
}: {
  id: SpecialId;
  onBack: () => void;
}) {
  const page = SPECIAL_PAGES.find((p) => p.id === id);

  if (!page) return <div style={{ padding: 20 }}>Page introuvable.</div>;

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

      <Card title={page.title}>
        <div className="md bodyText">
          <ReactMarkdown components={mdComponents}>
            {cleanMd(page.bodyMd)}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
}
