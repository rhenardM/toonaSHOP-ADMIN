import { Building2, CircleCheck, Clock, DollarSign, type LucideIcon, TrendingDown, TrendingUp, Users } from "lucide-react"

import { StatusPill } from "@/components/shared/status-pill"
import { cn, formatNumber, formatSignedPercent } from "@/lib/utils"

import type { KpiId, KpiMetric } from "../types/dashboard.types"

const kpiIcons: Record<KpiId, LucideIcon> = {
  companies: Building2,
  users: Users,
  activeSubscriptions: CircleCheck,
  trials: Clock,
  revenue: DollarSign,
}

export function KpiStatCard({ metric, className }: { metric: KpiMetric; className?: string }) {
  const Icon = kpiIcons[metric.id]
  const warning = metric.tone === "warning"
  const trend = metric.trendPct
  const up = (trend ?? 0) >= 0
  const TrendIcon = up ? TrendingUp : TrendingDown
  const history = metric.history
  const peak = Math.max(...(history ?? [1]))

  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5 rounded-2xl border bg-card p-4 sm:p-[18px]", className)}>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-[34px] shrink-0 items-center justify-center rounded-[10px]",
            warning ? "bg-warning-soft text-warning" : "bg-brand-soft text-brand"
          )}
        >
          <Icon className="size-[17px]" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="leading-snug font-semibold text-ink-soft">{metric.label}</span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl leading-tight font-extrabold tracking-[-0.02em] text-ink tabular-nums sm:text-[28px]">
            {metric.value === null ? "—" : formatNumber(metric.value)}
            {metric.currency ? (
              <span className="ml-1.5 text-[15px] font-bold text-muted-foreground">{metric.currency}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{metric.caption}</p>
        </div>
        {history ? (
          <div aria-hidden="true" className="hidden h-10 shrink-0 items-end gap-1 sm:flex">
            {history.map((value, index) => {
              const last = index === history.length - 1
              return (
                <span
                  key={index}
                  className={cn(
                    "w-[7px] rounded-[3px]",
                    warning ? (last ? "bg-orange" : "bg-orange-muted") : last ? "bg-brand" : "bg-brand-muted"
                  )}
                  style={{ height: `${(value / peak) * 100}%` }}
                />
              )
            })}
          </div>
        ) : null}
      </div>

      {trend !== undefined ? (
        <StatusPill tone={up ? "success" : "danger"} className="self-start px-[9px] py-[3px] leading-normal">
          <TrendIcon className="size-[13px]" strokeWidth={2.4} aria-hidden="true" />
          {formatSignedPercent(trend)} ce mois
        </StatusPill>
      ) : null}
    </div>
  )
}
