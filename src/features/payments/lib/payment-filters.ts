import { normalizeSearchText } from "@/lib/utils"

import type { Payment } from "../types/payment.types"

export const ALL = "all"

export interface PaymentFilters {
  status: string
  provider: string
  search: string
}

export function hasActiveFilters(filters: PaymentFilters): boolean {
  return filters.status !== ALL || filters.provider !== ALL || filters.search.trim() !== ""
}

/** Client-side filtering: /admin/payments accepts no filter parameter. */
export function filterPayments(payments: readonly Payment[], filters: PaymentFilters): Payment[] {
  const term = normalizeSearchText(filters.search.trim())
  return payments.filter((p) => {
    if (filters.status !== ALL && p.status !== filters.status) return false
    if (filters.provider !== ALL && p.provider !== filters.provider) return false
    if (!term) return true
    return [p.reference, p.transactionId, p.company?.name].some((value) => value && normalizeSearchText(value).includes(term))
  })
}

/** Distinct operators, sorted, for the provider filter. */
export function collectProviders(...sources: readonly (readonly string[])[]): string[] {
  return [...new Set(sources.flat())].sort((a, b) => a.localeCompare(b, "fr"))
}
