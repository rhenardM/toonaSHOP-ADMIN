import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface AnalyticsCardProps {
  /** Used to link the heading to the section for assistive tech. */
  id: string
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Standard dashboard section: white surface, 16px radius, 22px padding (prototype spec). */
export function AnalyticsCard({ id, title, description, action, children, className }: AnalyticsCardProps) {
  const titleId = `${id}-title`
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-col gap-[18px] rounded-2xl border bg-card p-4 sm:p-[22px]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-[17px] leading-snug font-extrabold text-ink">
            {title}
          </h2>
          {description ? <p className="mt-[3px] text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
