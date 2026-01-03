export type SpecialId =
  | "parcours-exodus"
  | "priere"
  | "asceses"
  | "fraternite"
  | "pourquoi"
  | "guide-reunions"
  | "examen-conscience";

export type SpecialPage = {
  id: SpecialId;
  title: string;
  bodyMd: string; // markdown (recommandé)
};

export const SPECIAL_PAGES: SpecialPage[] = [
  { id: "parcours-exodus", title: "Parcours Exodus", bodyMd: "Contenu à venir…" },
  { id: "priere", title: "La Prière", bodyMd: "Contenu à venir…" },
  { id: "asceses", title: "Les Ascèses", bodyMd: "Contenu à venir…" },
  { id: "fraternite", title: "La Fraternité", bodyMd: "Contenu à venir…" },
  { id: "pourquoi", title: "Votre Pourquoi", bodyMd: "Contenu à venir…" },
  { id: "guide-reunions", title: "Guide des réunions", bodyMd: "Contenu à venir…" },
  { id: "examen-conscience", title: "Examen de conscience", bodyMd: "Contenu à venir…" },
];
