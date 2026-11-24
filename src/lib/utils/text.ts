/** Lower-cases and strips accents so "réclamations" matches "reclam". */
export function normalizeSearchText(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
}
