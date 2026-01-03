export type DayNote = {
  text: string;
  updatedAt: string; // ISO
};

const keyFor = (dayId: string) => `note:${dayId}`;

export function getNote(dayId: string): DayNote | null {
  const raw = localStorage.getItem(keyFor(dayId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DayNote;
  } catch {
    return null;
  }
}

export function hasNote(dayId: string): boolean {
  const n = getNote(dayId);
  return !!n && n.text.trim().length > 0;
}

export function setNote(dayId: string, text: string) {
  const payload: DayNote = { text, updatedAt: new Date().toISOString() };
  localStorage.setItem(keyFor(dayId), JSON.stringify(payload));
}

export function deleteNote(dayId: string) {
  localStorage.removeItem(keyFor(dayId));
}

export function listAllNotes(): Array<{ dayId: string; note: DayNote }> {
  const out: Array<{ dayId: string; note: DayNote }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("note:")) continue;
    const dayId = k.slice("note:".length);
    const note = getNote(dayId);
    if (note && note.text.trim()) out.push({ dayId, note });
  }
  out.sort((a, b) => b.note.updatedAt.localeCompare(a.note.updatedAt));
  return out;
}
