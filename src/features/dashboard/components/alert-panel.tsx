"use client"

import { ArrowRight, CircleAlert, Info, ShieldCheck, TriangleAlert } from "lucide-react"
import Link from "next/link"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusPill } from "@/components/shared/status-pill"
import { Skeleton } from "@/components/ui/skeleton"
import { useExpiringCompanies } from "@/features/companies/hooks/use-companies"
import { usePendingImfCount } from "@/features/imf/hooks/use-imf"
import { useUnreadMessages } from "@/features/messages/hooks/use-unread-messages"
import { cn } from "@/lib/utils"

import { useAllClaims, usePaymentsLast12Months } from "../hooks/use-dashboard-data"
import { buildAlerts, paymentHealth } from "../lib/analytics"
import type { AlertSeverity, DateRangePreset } from "../types/dashboard.types"

const severityMeta: Record<AlertSeverity, { icon: typeof Info; label: string; className: string }> = {
  critical: { icon: CircleAlert, label: "Urgent", className: "bg-danger-soft text-danger" },
  warning: { icon: TriangleAlert, label: "À surveiller", className: "bg-warning-soft text-warning" },
  info: { icon: Info, label: "Information", className: "bg-brand-soft text-brand" },
}

export function AlertPanel({ range, now }: { range: DateRangePreset; now: Date }) {
  const expiring = useExpiringCompanies()
  const imf = usePendingImfCount()
  const claims = useAllClaims()
  const messages = useUnreadMessages()
  const payments = usePaymentsLast12Months()

  const sources = [expiring, imf, claims, messages, payments]
  const loading = sources.some((q) => q.isPending)
  const failed = sources.filter((q) => q.isError).length

  const alerts = buildAlerts({
    expiring: expiring.data,
    imfPendingCount: imf.data,
    claims: claims.data,
    unreadMessages: messages.data ? messages.unread : undefined,
    health: payments.data ? paymentHealth(payments.data, range, now) : undefined,
    now,
  })
  const urgent = alerts.filter((a) => a.severity === "critical").length

  return (
    <AnalyticsCard
      id="alerts"
      title="Points d’attention"
      description="Actions qui demandent une intervention"
      action={urgent > 0 ? <StatusPill tone="danger">{urgent} urgent{urgent > 1 ? "s" : ""}</StatusPill> : null}
      className="gap-3.5 lg:flex-[1_1_340px]"
    >
      {loading && alerts.length === 0 ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[84px] rounded-xl bg-track" />
          ))}
        </div>
      ) : alerts.length === 0 && failed === 0 ? (
        <EmptyState icon={ShieldCheck} title="Rien à signaler" description="Aucune action n’est requise pour le moment." />
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => {
            const meta = severityMeta[alert.severity]
            const Icon = meta.icon
            return (
              <li key={alert.id}>
                <Link href={alert.href} className="group flex items-start gap-3 rounded-xl border border-divider p-3 transition-colors hover:border-border hover:bg-surface-subtle">
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", meta.className)}>
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="sr-only">{meta.label}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-bold text-ink">{alert.title}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] leading-snug text-muted-foreground">{alert.description}</span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-brand">
                      {alert.actionLabel}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {failed > 0 ? (
        <p className="text-[12px] text-muted-foreground">
          {failed} source{failed > 1 ? "s" : ""} de données indisponible{failed > 1 ? "s" : ""} : la liste peut être incomplète.
        </p>
      ) : null}
    </AnalyticsCard>
  )
}
