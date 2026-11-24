"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/errors"
import type { PageParams } from "@/lib/api/pagination"

import { approveImf, getGroupInfo, getImfAnalytics, listApprovedImf, listPendingImf } from "../api/imf-service"

export const imfKeys = {
  all: ["imf"] as const,
  pending: (params: PageParams) => [...imfKeys.all, "pending", params] as const,
  approved: (params: PageParams) => [...imfKeys.all, "approved", params] as const,
  analytics: (groupId: number) => [...imfKeys.all, "analytics", groupId] as const,
  group: (groupId: number) => [...imfKeys.all, "group", groupId] as const,
}

export function usePendingImf(params: PageParams) {
  return useQuery({ queryKey: imfKeys.pending(params), queryFn: () => listPendingImf(params), placeholderData: keepPreviousData })
}

export function useApprovedImf(params: PageParams) {
  return useQuery({ queryKey: imfKeys.approved(params), queryFn: () => listApprovedImf(params), placeholderData: keepPreviousData })
}

/** Pending requests count for the sidebar badge and dashboard alerts. */
export function usePendingImfCount() {
  return useQuery({
    queryKey: imfKeys.pending({ page: 1, pageSize: 1 }),
    queryFn: () => listPendingImf({ page: 1, pageSize: 1 }),
    select: (result) => result.total,
    staleTime: 60_000,
  })
}

export function useImfAnalytics(groupId: number | null) {
  return useQuery({
    queryKey: imfKeys.analytics(groupId ?? 0),
    queryFn: () => getImfAnalytics(groupId ?? 0),
    enabled: groupId !== null,
  })
}

/** Group lookup for the validation page; a 404 is an answer, not a transient failure. */
export function useGroupInfo(groupId: number | null) {
  return useQuery({
    queryKey: imfKeys.group(groupId ?? 0),
    queryFn: () => getGroupInfo(groupId ?? 0),
    enabled: groupId !== null,
    retry: (failureCount, error) => !(error instanceof ApiError && (error.kind === "not-found" || error.kind === "validation")) && failureCount < 2,
  })
}

/** Approval refreshes every IMF view, including the sidebar badge. */
export function useApproveImf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveImf,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: imfKeys.all }),
  })
}
