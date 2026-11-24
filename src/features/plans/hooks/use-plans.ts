"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createPlan, deactivatePlan, listPlans, updatePlan } from "../api/plans-service"

export const planKeys = {
  all: ["plans"] as const,
  list: (includeInactive: boolean) => [...planKeys.all, "list", includeInactive] as const,
}

export function usePlans(includeInactive = false) {
  return useQuery({
    queryKey: planKeys.list(includeInactive),
    queryFn: () => listPlans(includeInactive),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })
}

/** Create, update, deactivate: every plan list (and plan pickers elsewhere) is refreshed afterwards. */
export function usePlanMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: planKeys.all })
  return {
    create: useMutation({ mutationFn: createPlan, onSuccess: invalidate }),
    update: useMutation({ mutationFn: updatePlan, onSuccess: invalidate }),
    deactivate: useMutation({ mutationFn: deactivatePlan, onSuccess: invalidate }),
  }
}
