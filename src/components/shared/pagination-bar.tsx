"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { formatNumber } from "@/lib/utils"

import { FilterSelect } from "./filter-select"

export const PAGE_SIZE_OPTIONS = ["10", "20", "50"] as const

interface PaginationBarProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  itemLabel?: string
}

export function PaginationBar({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange, itemLabel = "éléments" }: PaginationBarProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const navButton =
    "flex size-9 items-center justify-center rounded-[9px] border border-input bg-white text-ink-soft hover:bg-surface-subtle disabled:pointer-events-none disabled:opacity-40"

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-3.5">
      <p className="text-[12.5px] text-muted-foreground tabular-nums">
        {formatNumber(from)}–{formatNumber(to)} sur {formatNumber(total)} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange ? (
          <FilterSelect
            label="Éléments par page"
            value={String(pageSize) as (typeof PAGE_SIZE_OPTIONS)[number]}
            options={PAGE_SIZE_OPTIONS.map((v) => ({ value: v, label: `${v} / page` }))}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            className="h-9 min-w-[110px]"
          />
        ) : null}
        <button type="button" className={navButton} onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Page précédente">
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <span className="min-w-[72px] text-center text-[12.5px] font-semibold text-ink-soft tabular-nums">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <button type="button" className={navButton} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Page suivante">
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
