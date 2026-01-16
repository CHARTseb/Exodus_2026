import type { InfoId } from "./InfosPratiquesMarkdownPage";

export default function InfosPratiquesHome(props: {
  onOpen: (id: InfoId) => void;
}) {
  return (
    <div>
      <button style={itemStyle} onClick={() => props.onOpen("messes-semaines")}>
        Messes de semaine
      </button>

      <button style={itemStyle} onClick={() => props.onOpen("confessions")}>
        Confessions
      </button>

      <button style={itemStyle} onClick={() => props.onOpen("adoration")}>
        Adoration du Saint Sacrement
      </button>
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--text)",
  borderRadius: 14,
  padding: "12px 12px",
  cursor: "pointer",
  fontWeight: 800,
  marginBottom: 10,
  boxShadow: "var(--shadow)",
};
