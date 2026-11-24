"use client"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { QuerySection } from "@/components/shared/query-section"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"

import { usePaymentsLast12Months } from "../hooks/use-dashboard-data"
import { dominantCurrency, providerBreakdown } from "../lib/analytics"
import type { DateRangePreset } from "../types/dashboard.types"

interface ProviderBreakdownCardProps {
  range: DateRangePreset
  rangeLabel: string
  now: Date
}

export function ProviderBreakdownCard({ range, rangeLabel, now }: ProviderBreakdownCardProps) {
  const payments = usePaymentsLast12Months()

  return (
    <AnalyticsCard
      id="providers"
      title="Paiements par opérateur"
      description={`Montant approuvé et nombre de transactions · ${rangeLabel.toLowerCase()}`}
      className="lg:flex-[1_1_340px]"
    >
      <QuerySection query={payments} skeletonClassName="h-[200px]">
        {(list) => {
          const currency = dominantCurrency(list)
          const providers = providerBreakdown(list, range, now, currency)
          const max = Math.max(0, ...providers.map((p) => p.amount))
          const total = providers.reduce((sum, p) => sum + p.amount, 0)
          if (providers.length === 0) {
            return <p className="py-10 text-center text-[13px] text-muted-foreground">Aucun paiement sur la période.</p>
          }
          return (
            <ul className="flex flex-col gap-4">
              {providers.map((provider) => {
                const share = total > 0 ? provider.amount / total : 0
                return (
                  <li key={provider.provider} className="flex flex-col gap-[7px]" title={`${provider.provider} : ${formatPercent(share)} du montant approuvé`}>
                    <div className="flex justify-between gap-2 text-[13.5px]">
                      <span className="font-semibold text-ink">{provider.provider}</span>
                      <span className="text-right">
                        <strong className="font-bold text-ink tabular-nums">{formatCurrency(provider.amount, currency)}</strong>{" "}
                        <span className="text-muted-foreground tabular-nums">· {formatNumber(provider.count)}</span>
                      </span>
                    </div>
                    <div
                      role="meter"
                      aria-label={`Part de ${provider.provider}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(share * 100)}
                      className="h-2.5 overflow-hidden rounded-full bg-track"
                    >
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
                        style={{ width: `${max > 0 ? (provider.amount / max) * 100 : 0}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )
        }}
      </QuerySection>
    </AnalyticsCard>
  )
}
