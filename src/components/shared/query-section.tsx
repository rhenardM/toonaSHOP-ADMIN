"use client"

import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

interface QueryLike<T> {
  data: T | undefined
  isPending: boolean
  isError: boolean
  error: unknown
  isFetching?: boolean
  refetch: () => unknown
}

interface QuerySectionProps<T> {
  query: QueryLike<T>
  children: (data: T) => ReactNode
  /** Height of the loading placeholder. */
  skeletonClassName?: string
}

/** Renders a card body for one query: skeleton, inline error with retry, or content. */
export function QuerySection<T>({ query, children, skeletonClassName = "h-[220px]" }: QuerySectionProps<T>) {
  if (query.isPending) return <Skeleton className={cn("w-full bg-track", skeletonClassName)} aria-busy="true" />
  if (query.isError && query.data === undefined) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center gap-2 rounded-xl bg-danger-soft/50 px-4 py-8 text-center">
        <p className="text-[13px] font-bold text-danger-strong">Données indisponibles</p>
        <p className="max-w-sm text-[12.5px] text-muted-foreground">{getErrorMessage(query.error)}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-1 rounded-lg px-3 py-1.5 text-[12.5px] font-bold text-brand hover:bg-brand-soft"
        >
          Réessayer
        </button>
      </div>
    )
  }
  return <>{query.data === undefined ? null : children(query.data)}</>
}
