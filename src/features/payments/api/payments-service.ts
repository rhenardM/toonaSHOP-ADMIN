import { apiRequest } from "@/lib/api/http"
import { normalizePaginated, type PageParams, type Paginated, type RawPaginated } from "@/lib/api/pagination"

import type { Payment, PaymentStats, RawPayment } from "../types/payment.types"
import { type RawPaymentStats, toPayment, toPaymentStats } from "./payment-adapters"

export async function listPayments(params: PageParams): Promise<Paginated<Payment>> {
  const raw = await apiRequest<RawPaginated<RawPayment>>("/admin/payments", {
    query: { page: params.page, limit: params.pageSize },
  })
  return normalizePaginated(raw, params, toPayment)
}

/**
 * Payments created since `since`, newest first. /admin/payments has no date
 * filter (API spec §5.4), so pages are read until older payments appear.
 */
export async function fetchPaymentsSince(since: Date, pageSize = 500, maxPages = 40): Promise<Payment[]> {
  const result: Payment[] = []
  for (let page = 1; page <= maxPages; page++) {
    const { items, totalPages } = await listPayments({ page, pageSize })
    let reachedOlder = false
    for (const payment of items) {
      if (payment.createdAt && new Date(payment.createdAt) < since) {
        reachedOlder = true
        continue
      }
      result.push(payment)
    }
    if (reachedOlder || items.length < pageSize || page >= totalPages) break
  }
  return result
}

export async function getPaymentStats(): Promise<PaymentStats> {
  return toPaymentStats(await apiRequest<RawPaymentStats>("/multipay/subscription/stats"))
}
