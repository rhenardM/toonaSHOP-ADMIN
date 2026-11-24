import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface StatTileProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  tone?: "brand" | "warning" | "danger" | "success"
  hint?: ReactNode
  loading?: boolean
}

const toneClasses = {
  brand: "bg-brand-soft text-brand",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
}

/** Compact summary figure for module pages (lighter than the dashboard KPI card). */
export function StatTile({ label, value, icon: Icon, tone = "brand", hint, loading }: StatTileProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border bg-card p-4">
      {Icon ? (
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-semibold text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-16 bg-track" />
        ) : (
          <p className="text-xl font-extrabold tracking-[-0.02em] text-ink tabular-nums">{value}</p>
        )}
        {hint ? <p className="truncate text-[12px] text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  )
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{children}</div>
}
