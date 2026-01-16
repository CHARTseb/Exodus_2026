import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const MD_LOADERS = {
  "messes-semaine": async () =>
    (await import("../../content/infos-pratiques/messes-semaines.md?raw")).default,
  confessions: async () =>
    (await import("../../content/infos-pratiques/confessions.md?raw")).default,
  adoration: async () =>
    (await import("../../content/infos-pratiques/adoration.md?raw")).default,
} as const;

type Slug = keyof typeof MD_LOADERS;

export function InfosPratiquesMarkdownPage({ slug }: { slug: Slug }) {
  const [md, setMd] = useState("");

  useEffect(() => {
    let mounted = true;
    MD_LOADERS[slug]().then((txt) => mounted && setMd(txt));
    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <div className="page">
      <ReactMarkdown>{md}</ReactMarkdown>
    </div>
  );
}
