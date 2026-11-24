import type { ReactNode } from "react"

import type { PillTone } from "@/lib/constants/status"
import { cn } from "@/lib/utils"

const toneClasses: Record<PillTone, string> = {
  brand: "bg-brand-soft text-brand-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger-strong",
  neutral: "bg-track text-ink-soft",
  solid: "bg-brand text-white",
}

interface StatusPillProps {
  tone: PillTone
  children: ReactNode
  className?: string
}

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-[5px] rounded-full px-2.5 py-1 text-xs leading-none font-bold whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
