"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useCompanyDirectory } from "@/features/companies/hooks/use-companies"
import { getErrorMessage } from "@/lib/api/errors"
import { DEFAULT_CURRENCY } from "@/lib/constants/app"
import { cn, formatPercent } from "@/lib/utils"

import { useAdminStats } from "../hooks/use-dashboard-data"
import { companyGrowth, hasCreationDates } from "../lib/analytics"
import type { KpiMetric } from "../types/dashboard.types"
import { KpiStatCard } from "./kpi-stat-card"

/** Top KPI row from GET /admin/stats; the companies sparkline comes from the directory. */
export function KpiGrid({ now }: { now: Date }) {
  const stats = useAdminStats()
  const directory = useCompanyDirectory()

  if (stats.isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] sm:gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className={cn("h-[150px] rounded-2xl bg-card", i === 4 && "col-span-2 sm:col-span-1")} />
        ))}
      </div>
    )
  }
  if (stats.isError) {
    return (
      <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4">
        <p className="text-[13px] text-danger-strong">
          <strong>Indicateurs indisponibles.</strong> {getErrorMessage(stats.error)}
        </p>
        <button type="button" onClick={() => stats.refetch()} className="text-[13px] font-bold text-brand">
          Réessayer
        </button>
      </div>
    )
  }

  const s = stats.data
  const growth = directory.data && hasCreationDates(directory.data) ? companyGrowth(directory.data, now) : null
  // Cumulative sign-ups over the last 5 months, for the companies sparkline.
  const history = growth
    ? growth.slice(-5).reduce<number[]>((acc, point) => [...acc, (acc[acc.length - 1] ?? 0) + point.signups], [])
    : undefined

  const kpis: KpiMetric[] = [
    { id: "companies", label: "Entreprises", value: s.totalGroups, caption: `${s.activeGroups} actives`, trendPct: s.trends.groups, history, tone: "brand" },
    { id: "users", label: "Utilisateurs", value: s.totalUsers, caption: "toutes entreprises", trendPct: s.trends.users, tone: "brand" },
    {
      id: "activeSubscriptions",
      label: "Abonnements actifs",
      value: s.activeSubscriptions,
      caption: s.activeSubscriptions !== null && s.totalGroups > 0 ? `${formatPercent(s.activeSubscriptions / s.totalGroups)} des entreprises` : "abonnements en cours",
      trendPct: s.trends.subs,
      tone: "brand",
    },
    { id: "trials", label: "En période d’essai", value: s.trialGroups, caption: "à convertir", trendPct: s.trends.trials, tone: "warning" },
    { id: "revenue", label: "Revenu total", value: s.totalRevenue, currency: DEFAULT_CURRENCY, caption: "total encaissé", tone: "brand" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] sm:gap-4">
      {kpis.map((metric, index) => (
        <KpiStatCard
          key={metric.id}
          metric={metric}
          className={cn(index === kpis.length - 1 && kpis.length % 2 === 1 && "col-span-2 sm:col-span-1")}
        />
      ))}
    </div>
  )
}
