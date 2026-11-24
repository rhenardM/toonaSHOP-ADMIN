import { ApiError } from "@/lib/api/errors"
import { apiRequest } from "@/lib/api/http"
import { toIsoDate, toNumber, toOptionalNumber, toOptionalText, toText } from "@/lib/api/normalize"
import { normalizePaginated, type PageParams, type Paginated, type RawPaginated } from "@/lib/api/pagination"

import type { GroupInfo, ImfAnalytics, ImfGroup, RawGroupInfo, RawImfAnalytics, RawImfGroup } from "../types/imf.types"

export function toImfGroup(raw: RawImfGroup): ImfGroup {
  return {
    id: toNumber(raw.id),
    name: toText(raw.name) || toText(raw.nomEntreprise) || `Groupe #${raw.id}`,
    phone: toOptionalText(raw.contact),
    email: toOptionalText(raw.email),
    address: toOptionalText(raw.address),
    planName: toOptionalText(raw.planName),
    createdAt: toIsoDate(raw.createdAt),
    approvedAt: toIsoDate(raw.approvedAt),
    activeClients: toOptionalNumber(raw.activeClients),
    inactiveClients: toOptionalNumber(raw.inactiveClients),
  }
}

export function toImfAnalytics(raw: RawImfAnalytics | null | undefined): ImfAnalytics {
  return {
    totalSales: toNumber(raw?.totalSales),
    totalRevenue: toNumber(raw?.totalRevenue),
    averageTransaction: toNumber(raw?.averageTransaction),
    topProducts: (raw?.topProducts ?? [])
      .map((product, index) => ({
        name: toText(product.name) || `Produit ${index + 1}`,
        quantity: toNumber(product.quantity),
        revenue: toOptionalNumber(product.revenue),
      }))
      .sort((a, b) => b.quantity - a.quantity),
  }
}

export function toGroupInfo(raw: RawGroupInfo, requestedId: number): GroupInfo {
  return {
    id: toNumber(raw.id, requestedId),
    name: toText(raw.name) || toText(raw.nomEntreprise) || `Groupe #${requestedId}`,
    phone: toOptionalText(raw.contact),
    email: toOptionalText(raw.email),
    address: toOptionalText(raw.address),
    status: toOptionalText(raw.status),
    isImf: raw.isImf ?? raw.isApproved ?? false,
  }
}

export async function listPendingImf(params: PageParams): Promise<Paginated<ImfGroup>> {
  const raw = await apiRequest<RawPaginated<RawImfGroup>>("/admin/imf/groups/pending", {
    query: { page: params.page, limit: params.pageSize },
  })
  return normalizePaginated(raw, params, toImfGroup)
}

export async function listApprovedImf(params: PageParams): Promise<Paginated<ImfGroup>> {
  const raw = await apiRequest<RawPaginated<RawImfGroup>>("/admin/imf/groups/approved", {
    query: { page: params.page, limit: params.pageSize },
  })
  return normalizePaginated(raw, params, toImfGroup)
}

export function approveImf(groupId: number): Promise<void> {
  return apiRequest(`/admin/imf/group/${groupId}/approve`, { method: "PATCH" })
}

export async function getImfAnalytics(groupId: number): Promise<ImfAnalytics> {
  const raw = await apiRequest<RawImfAnalytics | null>(`/imf/analytics/${groupId}`)
  return toImfAnalytics(raw)
}

export async function getGroupInfo(groupId: number): Promise<GroupInfo> {
  const raw = await apiRequest<RawGroupInfo | null>("/group/info", { query: { id: groupId } })
  if (!raw || typeof raw !== "object") {
    throw new ApiError("not-found", `Aucun groupe ne correspond à l’ID ${groupId}.`, 404)
  }
  return toGroupInfo(raw, groupId)
}
