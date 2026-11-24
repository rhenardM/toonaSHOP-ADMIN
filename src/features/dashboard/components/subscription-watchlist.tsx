"use client"

import { CalendarCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { EmptyState } from "@/components/shared/empty-state"
import { InitialsTile } from "@/components/shared/initials-tile"
import { QuerySection } from "@/components/shared/query-section"
import { StatusPill } from "@/components/shared/status-pill"
import { ExtendSubscriptionDialog } from "@/features/companies/components/extend-subscription-dialog"
import { useExpiringCompanies } from "@/features/companies/hooks/use-companies"
import { isTrial } from "@/features/companies/lib/company-status"
import type { Company } from "@/features/companies/types/company.types"
import type { PillTone } from "@/lib/constants/status"
import { daysUntil, formatShortDate } from "@/lib/utils"

const VISIBLE = 5

function urgencyTone(days: number): PillTone {
  if (days <= 5) return "danger"
  if (days <= 7) return "warning"
  return "neutral"
}

export function SubscriptionWatchlist({ now }: { now: Date }) {
  const [extending, setExtending] = useState<Company | null>(null)
  const expiring = useExpiringCompanies()

  return (
    <AnalyticsCard
      id="expiring"
      title="Abonnements qui expirent bientôt"
      description={expiring.data ? `${expiring.data.length} abonnement${expiring.data.length > 1 ? "s" : ""} à renouveler` : "Échéances proches"}
      action={
        <Link href="/subscriptions" className="inline-flex min-h-8 items-center text-[13px] font-bold text-brand hover:text-brand-strong">
          Tout voir
        </Link>
      }
      className="gap-3.5 lg:flex-[2_1_520px]"
    >
      <QuerySection query={expiring} skeletonClassName="h-[260px]">
        {(companies) =>
          companies.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="Aucun abonnement à renouveler" description="Aucune échéance proche n’est signalée par l’API." />
          ) : (
            <ul className="flex flex-col">
              {companies.slice(0, VISIBLE).map((company) => {
                const days = company.subscriptionEnd ? daysUntil(company.subscriptionEnd, now) : null
                const trial = isTrial(company)
                return (
                  <li key={company.id} className="flex flex-wrap items-center gap-3 rounded-lg border-t border-divider px-2 py-3 transition-colors hover:bg-surface-subtle">
                    <InitialsTile name={company.name} tone={trial ? "warning" : "brand"} />
                    <div className="min-w-0 flex-[1_1_180px]">
                      <Link href={`/companies/${company.id}`} className="block truncate font-bold text-ink hover:text-brand">
                        {company.name}
                      </Link>
                      <p className="mt-px text-[12.5px] text-muted-foreground">
                        {trial ? "Essai" : company.planName ? `Plan ${company.planName}` : "Plan non précisé"}
                        {company.subscriptionEnd ? ` · expire le ${formatShortDate(company.subscriptionEnd)}` : ""}
                      </p>
                    </div>
                    {days !== null ? (
                      <StatusPill tone={urgencyTone(days)}>
                        {days < 0 ? "Expiré" : days === 0 ? "Aujourd’hui" : `${days} jour${days > 1 ? "s" : ""}`}
                      </StatusPill>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setExtending(company)}
                      className="h-9 rounded-[9px] border border-brand bg-white px-3.5 text-[13px] font-bold text-brand-strong transition-colors outline-none hover:bg-brand-soft focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      Prolonger
                    </button>
                  </li>
                )
              })}
            </ul>
          )
        }
      </QuerySection>
      <ExtendSubscriptionDialog company={extending} onOpenChange={(open) => !open && setExtending(null)} />
    </AnalyticsCard>
  )
}
