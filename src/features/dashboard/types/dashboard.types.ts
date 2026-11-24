import type { IsoDate } from "@/types/domain"

/** Analysis period applied to payment analytics. */
export type DateRangePreset = "7d" | "30d" | "90d" | "12m"

/** Window shown by the revenue chart (its own filter, as in the prototype). */
export type RevenueWindow = "30d" | "90d" | "12m"

/** GET /admin/stats, normalised (the API answers in snake_case). */
export interface AdminStats {
  totalGroups: number
  activeGroups: number
  totalRevenue: number
  totalUsers: number
  activeSubscriptions: number | null
  trialGroups: number | null
  /** Change in % reported by the API, when provided. */
  trends: { groups?: number; users?: number; subs?: number; trials?: number }
}

export type KpiId = "companies" | "users" | "activeSubscriptions" | "trials" | "revenue"

export interface KpiMetric {
  id: KpiId
  label: string
  value: number | null
  currency?: string
  caption: string
  trendPct?: number
  /** Last 5 periods, oldest first. Omitted when not available. */
  history?: number[]
  tone: "brand" | "warning"
}

export interface RevenuePoint {
  date: IsoDate
  amount: number
}

export interface PaymentHealth {
  total: number
  approved: number
  failed: number
  timeout: number
  pending: number
  /** Companies with at least one failed or expired payment in the period. */
  companiesToFollowUp: number
}

export interface ProviderStat {
  provider: string
  amount: number
  count: number
}

export interface PlanShare {
  plan: string
  companies: number
}

export interface StatusShare {
  status: "active" | "expiring" | "expired" | "disabled"
  companies: number
}

export interface CompanyGrowthPoint {
  month: IsoDate
  signups: number
}

export type AlertSeverity = "critical" | "warning" | "info"

export interface DashboardAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  href: string
  actionLabel: string
}

export type ActivityCategory = "payments" | "companies" | "support"

export type ActivityKind = "payment-approved" | "payment-failed" | "company-created" | "imf-request" | "claim-opened" | "message-received"

export interface PlatformActivity {
  id: string
  kind: ActivityKind
  category: ActivityCategory
  title: string
  description: string
  occurredAt: IsoDate
  href: string
}
