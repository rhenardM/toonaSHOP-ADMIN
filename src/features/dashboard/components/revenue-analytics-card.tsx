"use client"

import { useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { QuerySection } from "@/components/shared/query-section"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { formatCurrency, formatSignedPercent } from "@/lib/utils"

import { RevenueChart } from "../charts/revenue-chart"
import { REVENUE_WINDOW_OPTIONS } from "../constants"
import { usePaymentsLast12Months } from "../hooks/use-dashboard-data"
import { dominantCurrency, revenueSeries } from "../lib/analytics"
import type { RevenueWindow } from "../types/dashboard.types"

const windowSubtitle: Record<RevenueWindow, string> = {
  "30d": "Paiements approuvés par jour",
  "90d": "Paiements approuvés par semaine",
  "12m": "Paiements approuvés par mois",
}

export function RevenueAnalyticsCard({ now }: { now: Date }) {
  const [period, setPeriod] = useState<RevenueWindow>("12m")
  const payments = usePaymentsLast12Months()

  return (
    <AnalyticsCard
      id="revenue"
      title="Évolution des revenus"
      description={windowSubtitle[period]}
      action={<SegmentedControl label="Période du graphique" options={REVENUE_WINDOW_OPTIONS} value={period} onValueChange={setPeriod} />}
      className="lg:flex-[2_1_520px]"
    >
      <QuerySection query={payments} skeletonClassName="h-[270px]">
        {(list) => {
          const currency = dominantCurrency(list)
          const data = revenueSeries(list, period, now, currency)
          const total = data.reduce((sum, point) => sum + point.amount, 0)
          const half = Math.floor(data.length / 2)
          const previous = data.slice(0, half).reduce((s, p) => s + p.amount, 0)
          const recent = data.slice(data.length - half).reduce((s, p) => s + p.amount, 0)
          const change = previous > 0 ? ((recent - previous) / previous) * 100 : null
          return (
            <>
              <div className="-mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="text-[13px] text-muted-foreground">
                  Total sur la période
                  <strong className="ml-1.5 text-[15px] font-extrabold text-ink tabular-nums">{formatCurrency(total, currency)}</strong>
                </p>
                {change !== null ? (
                  <p className="text-[13px] text-muted-foreground" title="Seconde moitié de la période comparée à la première">
                    Tendance
                    <strong className={change >= 0 ? "ml-1.5 font-bold text-success" : "ml-1.5 font-bold text-danger-strong"}>
                      {formatSignedPercent(Number(change.toFixed(1)))}
                    </strong>
                  </p>
                ) : null}
              </div>
              {total === 0 ? (
                <p className="py-16 text-center text-[13px] text-muted-foreground">Aucun paiement approuvé sur la période.</p>
              ) : (
                <RevenueChart data={data} period={period} currency={currency} />
              )}
            </>
          )
        }}
      </QuerySection>
    </AnalyticsCard>
  )
}
