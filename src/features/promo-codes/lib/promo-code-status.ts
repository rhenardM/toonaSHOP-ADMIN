import type { PillTone } from "@/lib/constants/status"
import { DEFAULT_CURRENCY } from "@/lib/constants/app"
import { formatCurrency, formatNumber } from "@/lib/utils"
import type { Plan } from "@/features/plans/types/plan.types"

import type { PromoCode, PromoCodeStatus } from "../types/promo-code.types"

/** API spec §5.6: Inactif → Expiré → Épuisé → Actif. */
export function getPromoCodeStatus(promo: PromoCode, now = new Date()): PromoCodeStatus {
  if (!promo.isActive) return "inactive"
  if (promo.validUntil && new Date(promo.validUntil).getTime() < now.getTime()) return "expired"
  if (promo.maxUsageCount > 0 && promo.usageCount >= promo.maxUsageCount) return "exhausted"
  return "active"
}

export const promoStatusMeta: Record<PromoCodeStatus, { label: string; tone: PillTone }> = {
  active: { label: "Actif", tone: "success" },
  expired: { label: "Expiré", tone: "danger" },
  exhausted: { label: "Épuisé", tone: "warning" },
  inactive: { label: "Inactif", tone: "neutral" },
}

/**
 * Currency of a fixed discount: the API stores none, so use the currency shared by the
 * allowed plans (or by every plan when the code applies to all), else the default one.
 */
export function discountCurrency(promo: PromoCode, plansById: Map<number, Plan>): string {
  const plans = promo.allowedPlanTypes.length > 0 ? promo.allowedPlanTypes.map((id) => plansById.get(id)) : [...plansById.values()]
  const currencies = new Set(plans.map((plan) => plan?.currency).filter(Boolean))
  return currencies.size === 1 ? [...currencies][0]! : DEFAULT_CURRENCY
}

/** "15 %" or "5 000 USD". */
export function formatDiscount(promo: PromoCode, plansById: Map<number, Plan>): string {
  return promo.discountType === "percentage"
    ? `${formatNumber(promo.discountValue)} %`
    : formatCurrency(promo.discountValue, discountCurrency(promo, plansById))
}
