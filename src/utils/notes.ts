// src/utils/notes.ts

export type DayNote = {
  dayId: string
  content: string
  updatedAt: number // timestamp (Date.now())
}

export type DayNoteEntry = {
  dayId: string
  note: DayNote
}

const KEY_PREFIX = "exodus:note:" // une clé par jour => exodus:note:12

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function getKey(dayId: string) {
  return `${KEY_PREFIX}${dayId}`
}

/**
 * Convertit ce qui est trouvé dans localStorage vers le format DayNote.
 * Rétrocompatibilité :
 * - string brute -> devient content
 * - { text, updatedAt } (ancien) -> converti en { content, updatedAt:number }
 * - { content, updatedAt } (déjà ok) -> normalisé
 */
function normalizeStoredValue(dayId: string, rawValue: unknown): DayNote | null {
  if (rawValue == null) return null

  // 1) Ancien format : string directe
  if (typeof rawValue === "string") {
    const content = rawValue.trim()
    if (!content) return null
    return { dayId, content, updatedAt: Date.now() }
  }

  // 2) Format objet (ancien ou nouveau)
  if (typeof rawValue === "object") {
    const obj = rawValue as any

    const contentCandidate =
      typeof obj.content === "string"
        ? obj.content
        : typeof obj.text === "string"
          ? obj.text
          : ""

    const content = String(contentCandidate ?? "").trim()
    if (!content) return null

    // updatedAt peut être number, string ISO, etc.
    let updatedAt = Date.now()
    if (typeof obj.updatedAt === "number" && Number.isFinite(obj.updatedAt)) {
      updatedAt = obj.updatedAt
    } else if (typeof obj.updatedAt === "string") {
      const t = Date.parse(obj.updatedAt)
      if (!Number.isNaN(t)) updatedAt = t
    }

    return { dayId, content, updatedAt }
  }

  return null
}

export function getNote(dayId: string): DayNote | null {
  if (!isBrowser()) return null

  const key = getKey(dayId)
  const raw = localStorage.getItem(key)
  if (!raw) return null

  // Si c'est une string brute (ancien stockage), on la renvoie convertie
  // Sinon, on tente JSON.parse
  try {
    const parsed = JSON.parse(raw)
    const normalized = normalizeStoredValue(dayId, parsed)

    // Option : on réécrit au nouveau format pour "migrer" silencieusement
    if (normalized) {
      localStorage.setItem(key, JSON.stringify(normalized))
    }

    return normalized
  } catch {
    // raw n'était pas du JSON => ancien format string
    const normalized = normalizeStoredValue(dayId, raw)
    if (normalized) {
      localStorage.setItem(key, JSON.stringify(normalized))
    }
    return normalized
  }
}

export function setNote(dayId: string, content: string) {
  if (!isBrowser()) return

  const key = getKey(dayId)
  const trimmed = (content ?? "").trim()

  // Si vide => on supprime
  if (!trimmed) {
    localStorage.removeItem(key)
    return
  }

  const note: DayNote = {
    dayId,
    content: trimmed,
    updatedAt: Date.now(),
  }

  localStorage.setItem(key, JSON.stringify(note))
}

export function deleteNote(dayId: string) {
  if (!isBrowser()) return
  localStorage.removeItem(getKey(dayId))
}

export function hasNote(dayId: string): boolean {
  const note = getNote(dayId)
  return !!note?.content?.trim()
}

export function listAllNotes(): DayNoteEntry[] {
  if (!isBrowser()) return []

  const out: DayNoteEntry[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith(KEY_PREFIX)) continue

    const dayId = k.slice(KEY_PREFIX.length)
    const note = getNote(dayId)
    if (!note) continue

    out.push({ dayId, note })
  }

  // tri: plus récent d’abord
  out.sort((a, b) => b.note.updatedAt - a.note.updatedAt)
  return out
}
