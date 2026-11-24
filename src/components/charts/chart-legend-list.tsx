import { cn } from "@/lib/utils"

export interface LegendItem {
  key: string
  label: string
  color: string
  value: string
  /** Secondary value, e.g. a share. */
  detail?: string
}

/** Legend with values, as in the prototype's payment-health card (identity never by colour alone). */
export function ChartLegendList({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-2.5">
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: item.color }} />
          <span className="flex-1 text-ink-soft">{item.label}</span>
          {item.detail ? <span className="text-[12.5px] text-muted-foreground">{item.detail}</span> : null}
          <strong className="min-w-[3ch] text-right font-bold text-ink tabular-nums">{item.value}</strong>
        </li>
      ))}
    </ul>
  )
}
