"use client"

import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import { PageContainer } from "@/components/shared/page-container"

import { DEFAULT_DATE_RANGE, getRangeLabel } from "../constants"
import type { DateRangePreset } from "../types/dashboard.types"
import { ActivityTimeline } from "./activity-timeline"
import { AlertPanel } from "./alert-panel"
import { CompanyGrowthCard } from "./company-growth-card"
import { DashboardHeader } from "./dashboard-header"
import { KpiGrid } from "./kpi-grid"
import { PaymentHealthCard } from "./payment-health-card"
import { ProviderBreakdownCard } from "./provider-breakdown-card"
import { RecentCompaniesTable } from "./recent-companies-table"
import { RevenueAnalyticsCard } from "./revenue-analytics-card"
import { SubscriptionDistributionCard } from "./subscription-distribution-card"
import { SubscriptionWatchlist } from "./subscription-watchlist"

/** Rows wrap like the prototype's flex rows: side by side on desktop, stacked below lg. */
const rowClass = "flex flex-col gap-5 lg:flex-row lg:flex-wrap"

/**
 * Each card owns its query: a failing source only affects its own card.
 * Sections the API does not compute (series, distributions, activity) are
 * derived from real data in lib/analytics.ts.
 */
export function DashboardView() {
  const queryClient = useQueryClient()
  const [range, setRange] = useState<DateRangePreset>(DEFAULT_DATE_RANGE)
  // Reference time, fixed for the lifetime of the view (refreshed with the data).
  const [now, setNow] = useState(() => new Date())
  const fetching = useIsFetching() > 0

  async function refresh() {
    setNow(new Date())
    await queryClient.refetchQueries({ type: "active" })
    const failed = queryClient
      .getQueryCache()
      .findAll({ type: "active" })
      .some((q) => q.state.status === "error")
    if (failed) toast.warning("Actualisation partielle", { description: "Certaines données n’ont pas pu être chargées." })
    else toast.success("Tableau de bord actualisé")
  }

  const rangeLabel = getRangeLabel(range)

  return (
    <PageContainer>
      <DashboardHeader now={now} range={range} onRangeChange={setRange} onRefresh={refresh} refreshing={fetching} />
      <KpiGrid now={now} />
      <div className={rowClass}>
        <RevenueAnalyticsCard now={now} />
        <PaymentHealthCard range={range} rangeLabel={rangeLabel} now={now} />
      </div>
      <div className={rowClass}>
        <ProviderBreakdownCard range={range} rangeLabel={rangeLabel} now={now} />
        <SubscriptionWatchlist now={now} />
      </div>
      <div className={rowClass}>
        <SubscriptionDistributionCard now={now} />
        <CompanyGrowthCard now={now} />
      </div>
      <div className={rowClass}>
        <AlertPanel range={range} now={now} />
        <ActivityTimeline />
      </div>
      <RecentCompaniesTable />
    </PageContainer>
  )
}
