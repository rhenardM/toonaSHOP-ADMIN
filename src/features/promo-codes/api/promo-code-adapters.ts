import { toIsoDate, toNumber, toText } from "@/lib/api/normalize"

import type { PromoCode, RawPromoCode } from "../types/promo-code.types"

function toPlanIds(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.map((id) => toNumber(id, Number.NaN)).filter((id) => Number.isFinite(id) && id > 0)
}

export function toPromoCode(raw: RawPromoCode): PromoCode {
  return {
    id: toNumber(raw.id),
    code: toText(raw.code).toUpperCase(),
    description: toText(raw.description),
    discountType: raw.discountType === "fixed" ? "fixed" : "percentage",
    discountValue: toNumber(raw.discountValue),
    maxUsageCount: Math.max(0, toNumber(raw.maxUsageCount)),
    usageCount: Math.max(0, toNumber(raw.usageCount)),
    allowedPlanTypes: toPlanIds(raw.allowedPlanTypes),
    validFrom: toIsoDate(raw.validFrom),
    validUntil: toIsoDate(raw.validUntil),
    isActive: raw.isActive !== false,
  }
}
