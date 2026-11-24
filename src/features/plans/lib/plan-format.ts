import { formatNumber } from "@/lib/utils"

/** Plan limits use a negative value (−1) for "no limit", as the legacy console's data did. */
export const UNLIMITED = -1

export function formatLimit(value: number): string {
  return value < 0 ? "Illimité" : formatNumber(value)
}

/**
 * Saving of a longer billing period compared with paying monthly, as a whole percentage.
 * Null when there is nothing to compare or no saving.
 */
export function periodSaving(periodPrice: number, monthlyPrice: number, months: number): number | null {
  if (monthlyPrice <= 0 || periodPrice <= 0) return null
  const saving = Math.round((1 - periodPrice / (monthlyPrice * months)) * 100)
  return saving > 0 ? saving : null
}
