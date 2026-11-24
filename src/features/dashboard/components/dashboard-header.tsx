"use client"

import { RefreshCw } from "lucide-react"

import { useSession } from "@/features/auth/hooks/use-session"
import { cn, formatLongDate } from "@/lib/utils"

import type { DateRangePreset } from "../types/dashboard.types"
import { DateRangeFilter } from "./date-range-filter"

interface DashboardHeaderProps {
  now: Date
  range: DateRangePreset
  onRangeChange: (range: DateRangePreset) => void
  onRefresh: () => void
  refreshing: boolean
}

export function DashboardHeader({ now, range, onRangeChange, onRefresh, refreshing }: DashboardHeaderProps) {
  const { data: user } = useSession()
  const firstName = user?.name.split(/\s+/)[0]

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-extrabold tracking-[-0.01em] text-ink">{firstName ? `Bonjour ${firstName},` : "Bonjour,"}</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{formatLongDate(now)} · voici l’état de la plateforme</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DateRangeFilter value={range} onValueChange={onRangeChange} />
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Actualiser le tableau de bord"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-input bg-white px-3 text-[13px] font-semibold text-ink-soft transition-colors outline-none hover:bg-surface-subtle focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-70"
        >
          <RefreshCw className={cn("size-[15px]", refreshing && "animate-spin")} aria-hidden="true" />
          <span className="hidden sm:inline">{refreshing ? "Actualisation…" : "Actualiser"}</span>
        </button>
      </div>
    </div>
  )
}
