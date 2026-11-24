"use client"

import { RefreshCw, TriangleAlert } from "lucide-react"

import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  error: unknown
  title?: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

/** Explicit failure surface: data errors are shown, never replaced by fallback data. */
export function ErrorState({ error, title = "Impossible de charger les données", onRetry, retrying, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card px-6 py-12 text-center",
        className
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-danger-soft text-danger">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[15px] font-extrabold text-ink">{title}</p>
        <p className="mt-1 max-w-md text-[13px] text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-input bg-white px-3.5 text-[13px] font-semibold text-ink-soft hover:bg-surface-subtle disabled:opacity-60"
        >
          <RefreshCw className={cn("size-[15px]", retrying && "animate-spin")} aria-hidden="true" />
          Réessayer
        </button>
      ) : null}
    </div>
  )
}
