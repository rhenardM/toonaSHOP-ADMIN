import { cn, getInitials } from "@/lib/utils"

interface InitialsTileProps {
  name: string
  tone?: "brand" | "warning"
  className?: string
}

/** Rounded square with an entity's initials (companies, IMF…). */
export function InitialsTile({ name, tone = "brand", className }: InitialsTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-[38px] shrink-0 items-center justify-center rounded-[10px] text-[13px] font-extrabold",
        tone === "brand" ? "bg-brand-soft text-brand-strong" : "bg-warning-soft text-warning",
        className
      )}
    >
      {getInitials(name)}
    </span>
  )
}
