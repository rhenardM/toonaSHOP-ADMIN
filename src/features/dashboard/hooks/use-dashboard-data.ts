"use client"

import { useQuery } from "@tanstack/react-query"
import { subMonths } from "date-fns"

import { useClaims } from "@/features/claims/hooks/use-claims"
import { fetchPaymentsSince } from "@/features/payments/api/payments-service"

import { getAdminStats } from "../api/stats-service"

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  payments12m: ["payments", "since-12-months"] as const,
}

export function useAdminStats() {
  return useQuery({ queryKey: dashboardKeys.stats, queryFn: getAdminStats })
}

/** Last 12 months of payments: source of the revenue, health and operator analytics. */
export function usePaymentsLast12Months(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.payments12m,
    queryFn: () => fetchPaymentsSince(subMonths(new Date(), 12)),
    staleTime: 2 * 60_000,
    enabled,
  })
}

/** All claims — same cache entry as the claims module. */
export const useAllClaims = useClaims
