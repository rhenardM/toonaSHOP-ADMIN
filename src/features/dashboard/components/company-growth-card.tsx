"use client"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { QuerySection } from "@/components/shared/query-section"
import { useCompanyDirectory } from "@/features/companies/hooks/use-companies"
import { formatNumber } from "@/lib/utils"

import { CompanyGrowthChart } from "../charts/company-growth-chart"
import { companyGrowth, hasCreationDates } from "../lib/analytics"

export function CompanyGrowthCard({ now }: { now: Date }) {
  const directory = useCompanyDirectory()

  return (
    <AnalyticsCard
      id="company-growth"
      title="Croissance des entreprises"
      description="Nouvelles inscriptions par mois · 12 derniers mois"
      className="lg:flex-[2_1_520px]"
    >
      <QuerySection query={directory} skeletonClassName="h-[270px]">
        {(companies) => {
          if (!hasCreationDates(companies)) {
            return (
              <p className="py-16 text-center text-[13px] text-muted-foreground">
                L’API ne fournit pas la date d’inscription des entreprises : ce graphique s’affichera dès qu’elle sera exposée.
              </p>
            )
          }
          const data = companyGrowth(companies, now)
          const signups = data.reduce((sum, p) => sum + p.signups, 0)
          const last = data[data.length - 1]?.signups ?? 0
          const stats = [
            { label: "Inscriptions (12 mois)", value: formatNumber(signups) },
            { label: "Ce mois-ci", value: formatNumber(last) },
            { label: "Moyenne mensuelle", value: formatNumber(Math.round(signups / Math.max(data.length, 1))) },
          ]
          return (
            <>
              <dl className="flex flex-wrap gap-x-8 gap-y-2">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[12.5px] text-muted-foreground">{stat.label}</dt>
                    <dd className="text-xl font-extrabold tracking-[-0.02em] text-ink tabular-nums">{stat.value}</dd>
                  </div>
                ))}
              </dl>
              <CompanyGrowthChart data={data} />
            </>
          )
        }}
      </QuerySection>
    </AnalyticsCard>
  )
}
