import { Link } from "react-router-dom";

export function InfosPratiquesHome() {
  return (
    <div className="page">
      <h1>Infos pratiques</h1>

      <ul>
        <li>
          <Link to="/infos-pratiques/messes-semaine">Messes de semaine</Link>
        </li>
        <li>
          <Link to="/infos-pratiques/confessions">Confessions</Link>
        </li>
        <li>
          <Link to="/infos-pratiques/adoration">Adoration du Saint Sacrement</Link>
        </li>
      </ul>
    </div>
  );
}
