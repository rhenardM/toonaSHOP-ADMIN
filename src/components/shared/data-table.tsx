"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { EmptyState } from "./empty-state"
import { ErrorState } from "./error-state"

export interface DataColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  align?: "left" | "right" | "center"
  /** Extra classes for both header and cells (e.g. widths, `hidden lg:table-cell`). */
  className?: string
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  rows: T[] | undefined
  getRowId: (row: T) => string | number
  /** Accessible table name. */
  caption: string
  isLoading?: boolean
  /** Data is being refreshed while previous rows stay visible. */
  isRefreshing?: boolean
  error?: unknown
  onRetry?: () => void
  empty: { icon: LucideIcon; title: string; description?: ReactNode; action?: ReactNode }
  onRowClick?: (row: T) => void
  /** Phones get stacked cards instead of a horizontally scrolling table. */
  renderMobileCard?: (row: T) => ReactNode
  minWidth?: number
  skeletonRows?: number
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" }

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  empty,
  onRowClick,
  renderMobileCard,
  minWidth = 760,
  skeletonRows = 6,
}: DataTableProps<T>) {
  if (error && !rows) {
    return <ErrorState error={error} onRetry={onRetry} className="border-0 py-10" />
  }
  if (!isLoading && rows && rows.length === 0) {
    return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} action={empty.action} />
  }

  return (
    <div className={cn("transition-opacity", isRefreshing && "opacity-60")} aria-busy={isLoading || isRefreshing}>
      <div className={cn("overflow-x-auto", renderMobileCard && "hidden md:block")}>
        <table className="w-full border-collapse text-[13.5px]" style={{ minWidth }}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="text-xs tracking-[0.03em] text-muted-foreground uppercase">
              {columns.map((column, i) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "bg-surface-subtle px-3 py-2.5 font-bold whitespace-nowrap",
                    alignClass[column.align ?? "left"],
                    i === 0 && "rounded-l-lg",
                    i === columns.length - 1 && "rounded-r-lg",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && !rows
              ? Array.from({ length: skeletonRows }, (_, r) => (
                  <tr key={r} className="border-b border-divider">
                    {columns.map((column) => (
                      <td key={column.id} className={cn("px-3 py-[15px]", column.className)}>
                        <Skeleton className="h-4 w-full max-w-[140px] bg-track" />
                      </td>
                    ))}
                  </tr>
                ))
              : (rows ?? []).map((row) => (
                  <tr
                    key={getRowId(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-divider transition-colors last:border-b-0 hover:bg-surface-subtle",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.id} className={cn("px-3 py-[13px] align-middle", alignClass[column.align ?? "left"], column.className)}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {renderMobileCard ? (
        <ul className="flex flex-col gap-2.5 md:hidden">
          {isLoading && !rows
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="h-24 w-full rounded-xl bg-track" />
                </li>
              ))
            : (rows ?? []).map((row) => <li key={getRowId(row)}>{renderMobileCard(row)}</li>)}
        </ul>
      ) : null}
    </div>
  )
}
