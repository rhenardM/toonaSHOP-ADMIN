import { apiRequest } from "@/lib/api/http"
import { toNumber, toOptionalNumber } from "@/lib/api/normalize"

import type { AdminStats } from "../types/dashboard.types"

type RawStats = Record<string, unknown> & { trends?: Record<string, unknown> | null }

function pick(raw: RawStats, snake: string, camel: string): unknown {
  return raw[snake] ?? raw[camel]
}

/** GET /admin/stats — snake_case in the API, camelCase tolerated (API spec §5.2). */
export async function getAdminStats(): Promise<AdminStats> {
  const raw = (await apiRequest<RawStats>("/admin/stats")) ?? {}
  const trends = raw.trends ?? {}
  const trend = (key: string) => toOptionalNumber(trends[key]) ?? undefined
  return {
    totalGroups: toNumber(pick(raw, "total_groups", "totalGroups")),
    activeGroups: toNumber(pick(raw, "active_groups", "activeGroups")),
    totalRevenue: toNumber(pick(raw, "total_revenue", "totalRevenue")),
    totalUsers: toNumber(pick(raw, "total_users", "totalUsers")),
    activeSubscriptions: toOptionalNumber(pick(raw, "active_subscriptions", "activeSubscriptions")),
    trialGroups: toOptionalNumber(pick(raw, "trial_groups", "trialGroups")),
    trends: { groups: trend("groups"), users: trend("users"), subs: trend("subs"), trials: trend("trials") },
  }
}
