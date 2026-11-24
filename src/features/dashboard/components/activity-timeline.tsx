"use client"

import { BadgeCheck, Building2, CircleX, History, Landmark, type LucideIcon, Mail, MessageSquareWarning } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { EmptyState } from "@/components/shared/empty-state"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { useRecentCompanies } from "@/features/companies/hooks/use-companies"
import { usePendingImf } from "@/features/imf/hooks/use-imf"
import { useContactMessages } from "@/features/messages/hooks/use-contact-messages"
import { cn, formatShortDate, formatTime } from "@/lib/utils"

import { useAllClaims, usePaymentsLast12Months } from "../hooks/use-dashboard-data"
import { buildActivities } from "../lib/analytics"
import type { ActivityCategory, ActivityKind } from "../types/dashboard.types"

type Filter = "all" | ActivityCategory

const FILTERS = [
  { value: "all", label: "Tout" },
  { value: "payments", label: "Paiements" },
  { value: "companies", label: "Entreprises" },
  { value: "support", label: "Support" },
] as const satisfies readonly { value: Filter; label: string }[]

const kindMeta: Record<ActivityKind, { icon: LucideIcon; className: string }> = {
  "payment-approved": { icon: BadgeCheck, className: "bg-brand-soft text-brand" },
  "payment-failed": { icon: CircleX, className: "bg-danger-soft text-danger" },
  "company-created": { icon: Building2, className: "bg-success-soft text-success" },
  "imf-request": { icon: Landmark, className: "bg-warning-soft text-warning" },
  "claim-opened": { icon: MessageSquareWarning, className: "bg-danger-soft text-danger" },
  "message-received": { icon: Mail, className: "bg-brand-soft text-brand" },
}

const IMF_PREVIEW = { page: 1, pageSize: 10 }

export function ActivityTimeline() {
  const [filter, setFilter] = useState<Filter>("all")
  const payments = usePaymentsLast12Months()
  const companies = useRecentCompanies(10)
  const claims = useAllClaims()
  const messages = useContactMessages()
  const imf = usePendingImf(IMF_PREVIEW)

  const sources = [payments, companies, claims, messages, imf]
  const loading = sources.every((q) => q.isPending)
  const activities = buildActivities(
    {
      payments: payments.data,
      newCompanies: companies.data,
      claims: claims.data,
      messages: messages.data,
      imfPending: imf.data?.items,
    },
    filter === "all" ? 8 : 50
  )
  const visible = (filter === "all" ? activities : activities.filter((a) => a.category === filter)).slice(0, 8)

  return (
    <AnalyticsCard id="activity" title="Activité récente" description="Derniers événements sur la plateforme" className="gap-3.5 lg:flex-[2_1_520px]">
      <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
        <SegmentedControl label="Filtrer l’activité" size="sm" options={FILTERS} value={filter} onValueChange={setFilter} className="w-fit" />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 bg-track" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={History} title="Aucune activité" description="Aucun événement récent pour ce filtre." />
      ) : (
        <ol className="relative flex flex-col">
          {visible.map((activity, index) => {
            const meta = kindMeta[activity.kind]
            const Icon = meta.icon
            const last = index === visible.length - 1
            return (
              <li key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!last ? <span aria-hidden="true" className="absolute top-9 bottom-0 left-[15px] w-px bg-border" /> : null}
                <span className={cn("relative flex size-8 shrink-0 items-center justify-center rounded-full", meta.className)}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pt-1">
                  <div className="min-w-0">
                    <Link href={activity.href} className="text-[13.5px] font-bold text-ink hover:text-brand">
                      {activity.title}
                    </Link>
                    <p className="truncate text-[12.5px] text-muted-foreground">{activity.description}</p>
                  </div>
                  <time dateTime={activity.occurredAt} className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
                    {formatShortDate(activity.occurredAt)} · {formatTime(activity.occurredAt)}
                  </time>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </AnalyticsCard>
  )
}
