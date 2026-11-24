"use client"

import { useState } from "react"

import { ChartLegendList } from "@/components/charts/chart-legend-list"
import { chartColors } from "@/components/charts/chart-theme"
import { AnalyticsCard } from "@/components/shared/analytics-card"
import { QuerySection } from "@/components/shared/query-section"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { useCompanyDirectory } from "@/features/companies/hooks/use-companies"
import { companyStatusMeta } from "@/features/companies/lib/company-status"
import { formatNumber, formatPercent } from "@/lib/utils"

import { DonutChart, type DonutSlice } from "../charts/donut-chart"
import { planShares, statusShares } from "../lib/analytics"

type View = "plan" | "status"

/** Max categorical hues (validated palette); extra plans fold into "Autres". */
const MAX_SLICES = chartColors.categorical.length

function toSlices(entries: { key: string; label: string; value: number }[]): DonutSlice[] {
  const head = entries.slice(0, MAX_SLICES - (entries.length > MAX_SLICES ? 1 : 0))
  const rest = entries.slice(head.length)
  const folded = rest.length > 0 ? [...head, { key: "other", label: "Autres", value: rest.reduce((s, e) => s + e.value, 0) }] : head
  return folded.map((entry, i) => ({ ...entry, color: chartColors.categorical[i] ?? chartColors.categorical[0] }))
}

export function SubscriptionDistributionCard({ now }: { now: Date }) {
  const [view, setView] = useState<View>("plan")
  const directory = useCompanyDirectory()

  return (
    <AnalyticsCard
      id="subscriptions-mix"
      title="Répartition des abonnements"
      description={view === "plan" ? "Abonnements en cours par plan" : "Entreprises par état d’abonnement"}
      action={
        <SegmentedControl
          label="Répartition"
          size="sm"
          options={[
            { value: "plan", label: "Par plan" },
            { value: "status", label: "Par état" },
          ]}
          value={view}
          onValueChange={setView}
        />
      }
      className="lg:flex-[1_1_340px]"
    >
      <QuerySection query={directory} skeletonClassName="h-[180px]">
        {(companies) => {
          const slices =
            view === "plan"
              ? toSlices(planShares(companies, now).map((s) => ({ key: s.plan, label: s.plan, value: s.companies })))
              : toSlices(
                  statusShares(companies, now)
                    .filter((s) => s.companies > 0)
                    .map((s) => ({ key: s.status, label: companyStatusMeta[s.status].label, value: s.companies }))
                )
          const total = slices.reduce((sum, s) => sum + s.value, 0)
          const share = (value: number) => (total > 0 ? value / total : 0)
          if (total === 0) return <p className="py-10 text-center text-[13px] text-muted-foreground">Aucun abonnement à afficher.</p>
          return (
            <div className="flex flex-wrap items-center justify-center gap-6">
              <DonutChart
                data={slices}
                size={152}
                ariaLabel={slices.map((s) => `${s.label} : ${formatNumber(s.value)}`).join(", ")}
                formatValue={(slice) => `${formatNumber(slice.value)} · ${formatPercent(share(slice.value))}`}
                center={
                  <>
                    <span className="text-2xl font-extrabold tracking-[-0.02em] text-ink">{formatNumber(total)}</span>
                    <span className="text-xs text-muted-foreground">{view === "plan" ? "en cours" : "entreprises"}</span>
                  </>
                }
              />
              <ChartLegendList
                className="min-w-[170px] flex-[1_1_170px]"
                items={slices.map((s) => ({ key: s.key, label: s.label, color: s.color, value: formatNumber(s.value), detail: formatPercent(share(s.value)) }))}
              />
            </div>
          )
        }}
      </QuerySection>
    </AnalyticsCard>
  )
}
