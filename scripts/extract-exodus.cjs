const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PDF_PATH = path.join(__dirname, "Exodus90_2026.pdf");
const OUTPUT_PATH = path.join(ROOT, "public", "data", "days.json");

// --- pdf.js (ESM) chargé dynamiquement ---
let pdfjsLib;
async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib = mod.default || mod;
  return pdfjsLib;
}

function normalize(text) {
  return text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function monthToNumber(fr) {
  const m = fr.toLowerCase();
  const map = {
    janvier: "01",
    février: "02",
    fevrier: "02",
    mars: "03",
    avril: "04",
    mai: "05",
    juin: "06",
    juillet: "07",
    août: "08",
    aout: "08",
    septembre: "09",
    octobre: "10",
    novembre: "11",
    décembre: "12",
    decembre: "12",
  };
  return map[m];
}

function findDateIsoFromBlock(block) {
  let s = block
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");

  // Corrige "1 er" -> "1"
  s = s.replace(/\b(\d{1,2})\s*er\b/gi, "$1");

  // Corrige "202 6" -> "2026"
  s = s.replace(/\b202\s*6\b/g, "2026");

  // Corrige les mois cassés : "fév rier" / "fév r ie r" etc.
  // (on enlève les espaces au milieu du mot si c'est un mois connu)
  s = s.replace(/\b(fé|fe)\s*v\s*r\s*\.?\b/gi, "févr"); // au cas où "fé v r"
  s = s.replace(/\b(fé|fe)\s*v\s*r\s*i\s*e\s*r\b/gi, "février");
  s = s.replace(/\bf\s*é\s*v\s*r\s*i\s*e\s*r\b/gi, "février");
  s = s.replace(/\bf\s*e\s*v\s*r\s*i\s*e\s*r\b/gi, "fevrier");

  // plus général : recolle "fév rier" en "février"
  s = s.replace(/\b(fév|fev)\s*rier\b/gi, "février");
  s = s.replace(/\b(fév|fev)\s*r\s*ier\b/gi, "février");

  const lower = s.toLowerCase();

  const monthMap = {
    "janvier": "01",
    "janv": "01",
    "janv.": "01",
    "février": "02",
    "fevrier": "02",
    "févr": "02",
    "fevr": "02",
    "févr.": "02",
    "fevr.": "02",
    "mars": "03",
    "avril": "04",
    "avr": "04",
    "avr.": "04",
    "mai": "05",
    "juin": "06",
    "juillet": "07",
    "juil": "07",
    "juil.": "07",
    "août": "08",
    "aout": "08",
    "septembre": "09",
    "sept": "09",
    "sept.": "09",
    "octobre": "10",
    "oct": "10",
    "oct.": "10",
    "novembre": "11",
    "nov": "11",
    "nov.": "11",
    "décembre": "12",
    "decembre": "12",
    "déc": "12",
    "dec": "12",
    "déc.": "12",
    "dec.": "12",
  };

  const m = lower.match(
    /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)?\s*(\d{1,2})\s+([a-zéû\.]+)\s*(2026)?/
  );
  if (!m) return null;

  const dd = String(m[1]).padStart(2, "0");
  const monthRaw = m[2].replace(/\.$/, "");
  const mm = monthMap[m[2]] || monthMap[monthRaw];
  if (!mm) return null;

  const yyyy = m[3] || "2026";
  return `${yyyy}-${mm}-${dd}`;
}

function extractSection(block, label, nextLabels) {
  const s = block;
  const idx = s.search(new RegExp(label, "i"));
  if (idx < 0) return "";

  const after = s.slice(idx).replace(new RegExp(label, "i"), "").trim();

  if (!nextLabels || !nextLabels.length) return normalize(after);

  const nextRe = new RegExp(nextLabels.join("|"), "i");
  const m = after.search(nextRe);

  return m >= 0 ? normalize(after.slice(0, m).trim()) : normalize(after);
}

function parseDays(text) {
  const days = [];

  // On ne prend que les vrais en-têtes : "JOUR 36 :"
const re = /(?:^|\n)\s*JOUR\s+(\d{1,3})\s*:\s*/gim;
  const starts = [];
  let match;

  while ((match = re.exec(text)) !== null) {
    starts.push({ index: match.index, n: Number(match[1]) });
  }

  // Construit les blocs
  const blocks = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : text.length;
    blocks.push({ n: starts[i].n, chunk: text.slice(start, end) });
  }

  for (const b of blocks) {
    const block = b.chunk;

    const dateIso = findDateIsoFromBlock(block);
if (!dateIso) {
  if (!global.__noDate) global.__noDate = 0;
  if (global.__noDate < 5) 
  global.__noDate++;
  continue;
}

    // Titre provisoire (on affinera ensuite)
    const titre = block
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140);

    const reflexion = extractSection(block, "RÉFLEXION", ["RÉSOLUTION", "EXODE"]);
    const resolution = extractSection(block, "RÉSOLUTION", ["EXODE", "RÉFLEXION"]);
    const exodeRaw = extractSection(block, "EXODE", ["RÉFLEXION", "RÉSOLUTION"]);

    // Référence biblique : première “ligne” de la section EXODE, si possible
    let reference_biblique = "";
    let texte_biblique = "";
    if (exodeRaw) {
      const parts = exodeRaw.split("\n").map((x) => x.trim()).filter(Boolean);
      if (parts.length) {
        reference_biblique = "Exode " + parts[0];
        texte_biblique = normalize(parts.slice(1).join("\n"));
      } else {
        texte_biblique = exodeRaw;
      }
    }

    days.push({
      id: days.length + 1,
      date: dateIso,
      titre,
      reference_biblique,
      texte_biblique,
      reflexion,
      resolution,
      paroisse: null,
    });
  }
    // --- Debug: quels numéros de jours manque-t-il ? ---
  const nums = starts.map((x) => x.n).sort((a, b) => a - b);
  const missing = [];
  for (let i = 1; i <= 90; i++) {
    if (!nums.includes(i)) missing.push(i);
  }

  return days;
}

async function extractTextFromPdf(pdfPath) {
  const pdf = await getPdfjs();
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdf.getDocument({ data }).promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    // On reconstruit du texte lisible
    const pageText = content.items.map((it) => it.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

async function run() {
  console.log("📥 Lecture du PDF:", PDF_PATH);
  if (!fs.existsSync(PDF_PATH)) {
    process.exit(1);
  }

  const rawText = await extractTextFromPdf(PDF_PATH);
  const text = normalize(rawText);

  const text2 = text.replace(/(\s)(JOUR\s+\d{1,3}\s*:)/g, "\n$2");
const days = parseDays(text2);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(days, null, 2), "utf8");

}

run().catch((e) => {
  console.error("❌ Erreur:", e);
  process.exit(1);
});
