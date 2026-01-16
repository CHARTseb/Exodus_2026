import { Card } from "../components/Card";
import { SPECIAL_PAGES, type SpecialId } from "../data/specials";

export default function Specials({
  onOpen,
}: {
  onOpen: (id: SpecialId) => void;
}) {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Pages spéciales</h1>

      {SPECIAL_PAGES.map((p) => (
        <div
          key={p.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(p.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpen(p.id);
          }}
          style={{ cursor: "pointer" }}
        >
          <Card title={p.title}>
            {/* children requis par Card, mais on n'affi*
