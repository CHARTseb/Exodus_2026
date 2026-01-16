export type SpecialId =
  | "parcours-exodus"
  | "priere"
  | "heure-sainte"
  | "asceses"
  | "fraternite"
  | "pourquoi"
  | "guide-reunions"
  | "examen-conscience"
  

export type SpecialPage = {
  id: SpecialId;
  title: string;
  mdPath?: string;
  bodyMd?: string; // fallback / legacy
};

export const SPECIAL_PAGES: SpecialPage[] = [
  { id: "parcours-exodus", title: "Parcours Exodus", mdPath: "/specials/parcours-exodus.md" },
  { id: "priere", title: "La Prière", mdPath: "/specials/priere.md" },
  { id: "heure-sainte", title: "Prier une heure sainte", mdPath: "/specials/heure-sainte.md" },
  { id: "asceses", title: "Les Ascèses", mdPath: "/specials/asceses.md" },
  { id: "fraternite", title: "La Fraternité", mdPath: "/specials/fraternite.md" },


  // ✅ Page maintenant active
  { id: "pourquoi", title: "Votre Pourquoi", mdPath: "/specials/votre-pourquoi.md" },
  { id: "guide-reunions", title: "Guide des réunions", mdPath: "/specials/guide-reunions.md" },
  { id: "examen-conscience", title: "Examen de conscience", mdPath: "/specials/examen-conscience.md" },
];
