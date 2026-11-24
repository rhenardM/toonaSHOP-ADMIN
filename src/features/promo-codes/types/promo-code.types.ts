import type { IsoDate } from "@/types/domain"

export type DiscountType = "percentage" | "fixed"

/** Promo code as returned by GET /admin/promo-codes (API spec §5.6). */
export interface RawPromoCode {
  id: number | string
  code?: unknown
  description?: unknown
  discountType?: unknown
  discountValue?: unknown
  maxUsageCount?: unknown
  usageCount?: unknown
  allowedPlanTypes?: unknown
  validFrom?: unknown
  validUntil?: unknown
  isActive?: unknown
}

export interface PromoCode {
  id: number
  code: string
  description: string
  discountType: DiscountType
  discountValue: number
  /** 0 = unlimited. */
  maxUsageCount: number
  usageCount: number
  /** Plan ids the code applies to (empty = every plan). */
  allowedPlanTypes: number[]
  validFrom: IsoDate | null
  validUntil: IsoDate | null
  isActive: boolean
}

/** Body of POST /admin/promo-codes and PUT /admin/promo-codes/{id}. */
export interface PromoCodeInput {
  code: string
  description: string
  discountType: DiscountType
  discountValue: number
  maxUsageCount: number
  allowedPlanTypes: number[]
  validFrom: IsoDate
  validUntil: IsoDate
  isActive: boolean
}

export type PromoCodeStatus = "active" | "expired" | "exhausted" | "inactive"
