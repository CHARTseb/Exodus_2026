import type { InfoId } from "../InfoDetail";

export function InfosPratiquesHome(props: { onOpen: (id: InfoId) => void }) {
  return (
    <div className="page">
      <h1>Infos pratiques</h1>

      <button onClick={() => props.onOpen("messes-semaines")}>
        Messes de semaine
      </button>

      <button onClick={() => props.onOpen("confessions")}>Confessions</button>

      <button onClick={() => props.onOpen("adoration")}>
        Adoration du Saint Sacrement
      </button>
    </div>
  );
}
