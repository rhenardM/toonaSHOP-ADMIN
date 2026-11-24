import { apiRequest } from "@/lib/api/http"

import type { PromoCode, PromoCodeInput, RawPromoCode } from "../types/promo-code.types"
import { toPromoCode } from "./promo-code-adapters"

/** GET /admin/promo-codes — not paginated. `isActive` is only sent when filtering (legacy bug §8.8: it was never applied). */
export async function listPromoCodes(isActive?: boolean): Promise<PromoCode[]> {
  const raw = await apiRequest<{ promoCodes?: RawPromoCode[] }>("/admin/promo-codes", { query: { isActive } })
  return (raw?.promoCodes ?? []).map(toPromoCode)
}

export function createPromoCode(input: PromoCodeInput): Promise<void> {
  return apiRequest("/admin/promo-codes", { method: "POST", body: input })
}

export function updatePromoCode({ id, input }: { id: number; input: PromoCodeInput }): Promise<void> {
  return apiRequest(`/admin/promo-codes/${id}`, { method: "PUT", body: input })
}

export function deactivatePromoCode(id: number): Promise<void> {
  return apiRequest(`/admin/promo-codes/${id}/deactivate`, { method: "POST" })
}
