import { ApiError } from "@/lib/api/errors"
import { apiRequest } from "@/lib/api/http"
import { fetchAllPages, normalizePaginated, type PageParams, type Paginated, type RawPaginated } from "@/lib/api/pagination"
import type { Payment, RawPayment } from "@/features/payments/types/payment.types"
import { toPayment } from "@/features/payments/api/payment-adapters"

import type { Company, CompanyUser, ExtendSubscriptionInput, RawGroup, RawGroupUser } from "../types/company.types"
import { toCompany, toCompanyUser } from "./company-adapters"

/** The API only searches from 2 characters (API spec §4). */
export const COMPANY_SEARCH_MIN_LENGTH = 2

export async function listCompanies(params: PageParams & { search?: string }): Promise<Paginated<Company>> {
  const search = params.search?.trim() ?? ""
  const useSearch = search.length >= COMPANY_SEARCH_MIN_LENGTH
  const raw = await apiRequest<RawPaginated<RawGroup>>(useSearch ? "/admin/groups/search" : "/admin/groups", {
    query: { page: params.page, limit: params.pageSize, q: useSearch ? search : undefined },
  })
  return normalizePaginated(raw, params, toCompany)
}

/** Whole company directory (a few hundred rows) — used for distribution & growth analytics. */
export async function fetchAllCompanies(): Promise<Company[]> {
  const raw = await fetchAllPages((page, limit) =>
    apiRequest<RawPaginated<RawGroup>>("/admin/groups", { query: { page, limit } })
  )
  return raw.map(toCompany)
}

export async function getNewCompanies(limit = 5): Promise<Company[]> {
  const raw = await apiRequest<RawPaginated<RawGroup>>("/admin/new-groups", { query: { limit } })
  return (raw?.data ?? []).map(toCompany)
}

export async function getExpiringCompanies(limit = 20): Promise<Company[]> {
  const raw = await apiRequest<RawPaginated<RawGroup>>("/admin/groups/expiring-soon", { query: { limit } })
  return (raw?.data ?? []).map(toCompany)
}

/**
 * There is no GET /admin/groups/{id} (API spec §5.3): scan the paginated list,
 * like the legacy console. Ask the backend for a detail endpoint.
 */
export async function getCompany(id: number): Promise<Company> {
  const pageSize = 100
  for (let page = 1; page <= 50; page++) {
    const raw = await apiRequest<RawPaginated<RawGroup>>("/admin/groups", { query: { page, limit: pageSize } })
    const result = normalizePaginated(raw, { page, pageSize }, toCompany)
    const match = result.items.find((company) => company.id === id)
    if (match) return match
    if (result.items.length < pageSize || page >= result.totalPages) break
  }
  throw new ApiError("not-found", `L’entreprise #${id} est introuvable.`, 404)
}

export async function listCompanyUsers(companyId: number, params: PageParams): Promise<Paginated<CompanyUser>> {
  const raw = await apiRequest<RawPaginated<RawGroupUser>>(`/admin/group/${companyId}/new-users`, {
    query: { page: params.page, limit: params.pageSize },
  })
  return normalizePaginated(raw, params, toCompanyUser)
}

export async function listCompanyPayments(companyId: number, params: PageParams): Promise<Paginated<Payment>> {
  const raw = await apiRequest<RawPaginated<RawPayment>>(`/admin/group/${companyId}/payments`, {
    query: { page: params.page, limit: params.pageSize },
  })
  return normalizePaginated(raw, params, toPayment)
}

export function activateCompany(companyId: number): Promise<void> {
  return apiRequest(`/admin/group/${companyId}/active`, { method: "POST" })
}

export function disableCompany(companyId: number): Promise<void> {
  return apiRequest(`/admin/group/${companyId}/disable`, { method: "POST" })
}

/** ⚠️ Payload `{ months, plan }` as sent by the legacy pages — to confirm with the backend (API spec §5.3). */
export function extendSubscription({ companyId, months, plan }: ExtendSubscriptionInput): Promise<void> {
  return apiRequest(`/admin/group/${companyId}/subscription/extend`, { method: "POST", body: { months, plan } })
}
