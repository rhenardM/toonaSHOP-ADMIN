"use client"

import { TriangleAlert } from "lucide-react"
import Link from "next/link"

import { ChartLegendList } from "@/components/charts/chart-legend-list"
import { AnalyticsCard } from "@/components/shared/analytics-card"
import { QuerySection } from "@/components/shared/query-section"
import { formatNumber, formatPercent } from "@/lib/utils"

import { DonutChart, type DonutSlice } from "../charts/donut-chart"
import { usePaymentsLast12Months } from "../hooks/use-dashboard-data"
import { paymentHealth } from "../lib/analytics"
import type { DateRangePreset } from "../types/dashboard.types"

interface PaymentHealthCardProps {
  range: DateRangePreset
  rangeLabel: string
  now: Date
}

export function PaymentHealthCard({ range, rangeLabel, now }: PaymentHealthCardProps) {
  const payments = usePaymentsLast12Months()
  const health = payments.data ? paymentHealth(payments.data, range, now) : null

  return (
    <AnalyticsCard
      id="payment-health"
      title="Santé des paiements"
      description={health ? `${formatNumber(health.total)} transactions · ${rangeLabel.toLowerCase()}` : rangeLabel}
      action={
        <Link href="/payments" className="inline-flex min-h-8 items-center text-[13px] font-bold text-brand hover:text-brand-strong">
          Détails
        </Link>
      }
      className="lg:flex-[1_1_320px]"
    >
      <QuerySection query={payments} skeletonClassName="h-[240px]">
        {() => {
          if (!health || health.total === 0) {
            return <p className="py-10 text-center text-[13px] text-muted-foreground">Aucune transaction sur la période.</p>
          }
          const slices: DonutSlice[] = [
            { key: "approved", label: "Approuvés", value: health.approved, color: "var(--brand)" },
            { key: "failed", label: "Échoués", value: health.failed, color: "var(--danger)" },
            { key: "timeout", label: "Expirés (timeout)", value: health.timeout, color: "var(--orange)" },
            ...(health.pending > 0 ? [{ key: "pending", label: "En attente", value: health.pending, color: "var(--axis)" }] : []),
          ]
          const ratio = (value: number) => value / health.total
          const unsuccessful = health.failed + health.timeout
          return (
            <>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <DonutChart
                  data={slices}
                  ariaLabel={slices.map((s) => `${formatPercent(ratio(s.value))} ${s.label.toLowerCase()}`).join(", ")}
                  formatValue={(slice) => `${formatNumber(slice.value)} · ${formatPercent(ratio(slice.value))}`}
                  center={
                    <>
                      <span className="text-[26px] font-extrabold tracking-[-0.02em] text-ink">{formatPercent(ratio(health.approved))}</span>
                      <span className="text-xs text-muted-foreground">de succès</span>
                    </>
                  }
                />
                <ChartLegendList
                  className="min-w-[170px] flex-[1_1_170px]"
                  items={slices.map((s) => ({ key: s.key, label: s.label, color: s.color, value: formatNumber(s.value) }))}
                />
              </div>
              {unsuccessful > 0 ? (
                <div className="flex items-start gap-2.5 rounded-xl bg-warning-soft px-3.5 py-3 text-[13px] leading-[1.45] text-warning-strong">
                  <TriangleAlert className="mt-px size-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span>
                    {formatNumber(unsuccessful)} paiements non aboutis : {formatNumber(health.companiesToFollowUp)} entreprises sont à relancer.
                  </span>
                </div>
              ) : null}
            </>
          )
        }}
      </QuerySection>
    </AnalyticsCard>
  )
}
