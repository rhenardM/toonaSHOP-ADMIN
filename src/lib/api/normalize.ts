/** Small coercion helpers for the API's mixed types (API spec §4). */

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."))
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

export function toOptionalNumber(value: unknown): number | null {
  const parsed = toNumber(value, Number.NaN)
  return Number.isNaN(parsed) ? null : parsed
}

export function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return String(value)
  return fallback
}

export function toOptionalText(value: unknown): string | null {
  const text = toText(value)
  return text ? text : null
}

/** ISO date string or null when missing/invalid. */
export function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null
  return Number.isNaN(new Date(value).getTime()) ? null : value
}
