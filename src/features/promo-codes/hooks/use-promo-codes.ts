"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createPromoCode, deactivatePromoCode, listPromoCodes, updatePromoCode } from "../api/promo-codes-service"

export const promoCodeKeys = {
  all: ["promo-codes"] as const,
  list: (isActive: boolean | undefined) => [...promoCodeKeys.all, "list", isActive ?? "all"] as const,
}

/** The `isActive` filter is part of the key, so changing it refetches with the param. */
export function usePromoCodes(isActive?: boolean) {
  return useQuery({
    queryKey: promoCodeKeys.list(isActive),
    queryFn: () => listPromoCodes(isActive),
    placeholderData: keepPreviousData,
  })
}

export function usePromoCodeMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: promoCodeKeys.all })
  return {
    create: useMutation({ mutationFn: createPromoCode, onSuccess: invalidate }),
    update: useMutation({ mutationFn: updatePromoCode, onSuccess: invalidate }),
    deactivate: useMutation({ mutationFn: deactivatePromoCode, onSuccess: invalidate }),
  }
}
