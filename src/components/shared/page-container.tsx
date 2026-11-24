import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Content frame used by every page under the dashboard shell. */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5 md:px-6 lg:px-8 lg:pt-7 lg:pb-10", className)}>
      {children}
    </div>
  )
}

/** Intro row of a module page: short description on the left, actions on the right. */
export function PageIntro({ description, actions }: { description: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <p className="max-w-2xl text-[13.5px] text-muted-foreground">{description}</p>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
