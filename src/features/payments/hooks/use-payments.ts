"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { PageParams } from "@/lib/api/pagination"

import { getPaymentStats, listPayments } from "../api/payments-service"

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params: PageParams) => [...paymentKeys.all, "list", params] as const,
  stats: () => [...paymentKeys.all, "stats"] as const,
}

export function usePayments(params: PageParams, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => listPayments(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

/** Global totals from GET /multipay/subscription/stats. */
export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: getPaymentStats,
    staleTime: 60_000,
  })
}
