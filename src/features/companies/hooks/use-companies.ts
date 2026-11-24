"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { PageParams } from "@/lib/api/pagination"

import {
  activateCompany,
  COMPANY_SEARCH_MIN_LENGTH,
  disableCompany,
  extendSubscription,
  fetchAllCompanies,
  getCompany,
  getExpiringCompanies,
  getNewCompanies,
  listCompanies,
  listCompanyPayments,
  listCompanyUsers,
} from "../api/companies-service"

export const companyKeys = {
  all: ["companies"] as const,
  list: (params: PageParams & { search: string }) => [...companyKeys.all, "list", params] as const,
  directory: () => [...companyKeys.all, "directory"] as const,
  recent: (limit: number) => [...companyKeys.all, "recent", limit] as const,
  expiring: (limit: number) => [...companyKeys.all, "expiring", limit] as const,
  detail: (id: number) => [...companyKeys.all, "detail", id] as const,
  users: (id: number, params: PageParams) => [...companyKeys.all, "detail", id, "users", params] as const,
  payments: (id: number, params: PageParams) => [...companyKeys.all, "detail", id, "payments", params] as const,
}

export function useCompanies(params: PageParams & { search: string }) {
  return useQuery({ queryKey: companyKeys.list(params), queryFn: () => listCompanies(params), placeholderData: keepPreviousData })
}

export function useCompanyDirectory() {
  return useQuery({ queryKey: companyKeys.directory(), queryFn: fetchAllCompanies, staleTime: 5 * 60_000 })
}

export function useRecentCompanies(limit = 5) {
  return useQuery({ queryKey: companyKeys.recent(limit), queryFn: () => getNewCompanies(limit) })
}

export function useExpiringCompanies(limit = 20) {
  return useQuery({ queryKey: companyKeys.expiring(limit), queryFn: () => getExpiringCompanies(limit) })
}

export function useCompany(id: number) {
  return useQuery({ queryKey: companyKeys.detail(id), queryFn: () => getCompany(id), enabled: Number.isFinite(id) && id > 0 })
}

export function useCompanyUsers(id: number, params: PageParams) {
  return useQuery({ queryKey: companyKeys.users(id, params), queryFn: () => listCompanyUsers(id, params), placeholderData: keepPreviousData })
}

export function useCompanyPayments(id: number, params: PageParams) {
  return useQuery({ queryKey: companyKeys.payments(id, params), queryFn: () => listCompanyPayments(id, params), placeholderData: keepPreviousData })
}

export function useCompanySearch(query: string) {
  const term = query.trim()
  return useQuery({
    queryKey: companyKeys.list({ page: 1, pageSize: 5, search: term }),
    queryFn: () => listCompanies({ page: 1, pageSize: 5, search: term }),
    enabled: term.length >= COMPANY_SEARCH_MIN_LENGTH,
    placeholderData: keepPreviousData,
    select: (result) => result.items,
  })
}

/** Activation toggle, extension: every company view is refreshed afterwards. */
export function useCompanyMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: companyKeys.all })
  return {
    setEnabled: useMutation({
      mutationFn: ({ companyId, enabled }: { companyId: number; enabled: boolean }) =>
        enabled ? activateCompany(companyId) : disableCompany(companyId),
      onSuccess: invalidate,
    }),
    extend: useMutation({ mutationFn: extendSubscription, onSuccess: invalidate }),
  }
}
