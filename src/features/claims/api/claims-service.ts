import { apiRequest } from "@/lib/api/http"
import { toIsoDate, toNumber, toText } from "@/lib/api/normalize"
import { fetchAllPages, normalizePaginated, type PageParams, type Paginated, type RawPaginated } from "@/lib/api/pagination"

import type { Claim, ClaimInput, ClaimPriority, ClaimStatus } from "../types/claim.types"

type RawClaim = Record<string, unknown> & { id: number | string }

const STATUSES: ClaimStatus[] = ["pending", "in-progress", "resolved", "closed"]
const PRIORITIES: ClaimPriority[] = ["low", "medium", "high"]

export function toClaim(raw: RawClaim): Claim {
  const status = toText(raw.status).toLowerCase().replace("_", "-") as ClaimStatus
  const priority = toText(raw.priority).toLowerCase() as ClaimPriority
  return {
    id: toNumber(raw.id),
    title: toText(raw.title) || `Réclamation #${raw.id}`,
    description: toText(raw.description),
    status: STATUSES.includes(status) ? status : "pending",
    priority: PRIORITIES.includes(priority) ? priority : "medium",
    client: toText(raw.client),
    createdAt: toIsoDate(raw.createdAt) ?? toIsoDate(raw.created_at),
    resolvedAt: toIsoDate(raw.resolvedAt) ?? toIsoDate(raw.resolved_at),
  }
}

export async function listClaims(params: PageParams): Promise<Paginated<Claim>> {
  const raw = await apiRequest<RawPaginated<RawClaim>>("/reclamation/list", {
    query: { page: params.page, limit: params.pageSize },
  })
  return normalizePaginated(raw, params, toClaim)
}

export async function fetchAllClaims(): Promise<Claim[]> {
  const raw = await fetchAllPages((page, limit) => apiRequest<RawPaginated<RawClaim>>("/reclamation/list", { query: { page, limit } }), 100, 10)
  return raw.map(toClaim)
}

export function createClaim(input: ClaimInput): Promise<void> {
  return apiRequest("/reclamation/create", { method: "POST", body: input })
}
