import { getCompanyStatus, isTrial } from "@/features/companies/lib/company-status"
import type { Company, CompanyStatus } from "@/features/companies/types/company.types"
import { normalizeSearchText } from "@/lib/utils"

export type SubscriptionSegment = "expiring" | "expired" | "active" | "disabled" | "all"

export const SEGMENT_LABELS: Record<SubscriptionSegment, string> = {
  expiring: "Expirent bientôt",
  expired: "Expirés",
  active: "Actifs",
  disabled: "Désactivés",
  all: "Tous",
}

export interface SubscriptionRow {
  company: Company
  status: CompanyStatus
  trial: boolean
}

export interface SubscriptionCounts extends Record<SubscriptionSegment, number> {
  trialActive: number
}

export function toSubscriptionRows(companies: readonly Company[], now: Date): SubscriptionRow[] {
  return companies.map((company) => ({
    company,
    status: getCompanyStatus(company, now),
    trial: isTrial(company),
  }))
}

export function countSubscriptions(rows: readonly SubscriptionRow[]): SubscriptionCounts {
  const counts: SubscriptionCounts = {
    expiring: 0,
    expired: 0,
    active: 0,
    disabled: 0,
    all: rows.length,
    trialActive: 0,
  }
  for (const row of rows) {
    counts[row.status]++
    if (row.trial && row.status === "active") counts.trialActive++
  }
  return counts
}

/** Segment + search, sorted by subscription end (most recent first for expired ones); no end date last. */
export function filterSubscriptions(rows: readonly SubscriptionRow[], segment: SubscriptionSegment, search: string): SubscriptionRow[] {
  const term = normalizeSearchText(search.trim())
  const direction = segment === "expired" ? -1 : 1
  return rows
    .filter((row) => segment === "all" || row.status === segment)
    .filter(({ company: c }) => !term || [c.name, c.rccm, c.email, c.phone, c.planName].some((value) => value && normalizeSearchText(value).includes(term)))
    .sort((a, b) => {
      const endA = a.company.subscriptionEnd
      const endB = b.company.subscriptionEnd
      if (!endA || !endB) return endA ? -1 : endB ? 1 : 0
      return direction * (new Date(endA).getTime() - new Date(endB).getTime())
    })
}
