"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createClaim, fetchAllClaims } from "../api/claims-service"

/** `all` is shared with the dashboard (alerts, activity), so both views use one cache entry. */
export const claimKeys = {
  root: ["claims"] as const,
  all: ["claims", "all"] as const,
}

export function useClaims() {
  return useQuery({ queryKey: claimKeys.all, queryFn: fetchAllClaims, staleTime: 2 * 60_000 })
}

export function useCreateClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createClaim,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: claimKeys.root }),
  })
}
