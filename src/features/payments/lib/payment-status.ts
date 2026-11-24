import type { PillTone } from "@/lib/constants/status"

const META: Record<string, { label: string; tone: PillTone }> = {
  approved: { label: "Approuvé", tone: "success" },
  failed: { label: "Échoué", tone: "danger" },
  timeout: { label: "Expiré (timeout)", tone: "warning" },
  pending: { label: "En attente", tone: "neutral" },
}

export const PAYMENT_STATUS_OPTIONS = Object.entries(META).map(([value, meta]) => ({ value, label: meta.label }))

export function paymentStatusMeta(status: string): {
  label: string
  tone: PillTone
} {
  return META[status] ?? { label: status, tone: "neutral" }
}
