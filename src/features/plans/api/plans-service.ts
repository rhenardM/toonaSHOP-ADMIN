import { apiRequest } from "@/lib/api/http"
import { toNumber, toText } from "@/lib/api/normalize"
import { DEFAULT_CURRENCY } from "@/lib/constants/app"

import type { Plan, PlanInput } from "../types/plan.types"

type RawPlan = Partial<Record<keyof Plan, unknown>> & { id: number | string }

export function toPlan(raw: RawPlan): Plan {
  return {
    id: toNumber(raw.id),
    code: toText(raw.code),
    name: toText(raw.name) || toText(raw.code),
    description: toText(raw.description),
    isActive: raw.isActive !== false,
    currency: toText(raw.currency) || DEFAULT_CURRENCY,
    monthlyPrice: toNumber(raw.monthlyPrice),
    semesterPrice: toNumber(raw.semesterPrice),
    annualPrice: toNumber(raw.annualPrice),
    maxUsers: toNumber(raw.maxUsers),
    maxPointOfSales: toNumber(raw.maxPointOfSales),
    maxWarehouses: toNumber(raw.maxWarehouses),
    maxLocations: toNumber(raw.maxLocations),
    features: Array.isArray(raw.features) ? raw.features.map((f) => toText(f)).filter(Boolean) : [],
  }
}

/** GET /admin/plans — not paginated: `{ plans: Plan[] }`. */
export async function listPlans(includeInactive = false): Promise<Plan[]> {
  const raw = await apiRequest<{ plans?: RawPlan[] }>("/admin/plans", {
    query: { include_inactive: includeInactive ? "true" : undefined },
  })
  return (raw?.plans ?? []).map(toPlan)
}

export function createPlan(input: PlanInput): Promise<void> {
  return apiRequest("/admin/plans", { method: "POST", body: input })
}

export function updatePlan({ id, input }: { id: number; input: PlanInput }): Promise<void> {
  return apiRequest(`/admin/plans/${id}`, { method: "PUT", body: input })
}

export function deactivatePlan(id: number): Promise<void> {
  return apiRequest(`/admin/plans/${id}/deactivate`, { method: "POST" })
}
