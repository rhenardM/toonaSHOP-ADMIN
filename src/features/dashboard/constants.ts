import type { SegmentedOption } from "@/components/shared/segmented-control"

import type { DateRangePreset, RevenueWindow } from "./types/dashboard.types"

export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string; description: string }[] = [
  { value: "7d", label: "7 derniers jours", description: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours", description: "30 derniers jours" },
  { value: "90d", label: "90 derniers jours", description: "90 derniers jours" },
  { value: "12m", label: "12 derniers mois", description: "12 derniers mois" },
]

export const DEFAULT_DATE_RANGE: DateRangePreset = "30d"

export const REVENUE_WINDOW_OPTIONS: readonly SegmentedOption<RevenueWindow>[] = [
  { value: "30d", label: "30 j" },
  { value: "90d", label: "90 j" },
  { value: "12m", label: "12 mois" },
]

export function getRangeLabel(range: DateRangePreset): string {
  return DATE_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? ""
}
