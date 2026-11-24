import type { ReactNode } from "react"

export interface ChartTooltipRow {
  label: string
  value: ReactNode
  color?: string
}

interface ChartTooltipCardProps {
  title: ReactNode
  rows: ChartTooltipRow[]
}

/** Dark tooltip card used by every chart (prototype: ink background, white value). */
export function ChartTooltipCard({ title, rows }: ChartTooltipCardProps) {
  return (
    <div className="rounded-[10px] bg-ink px-3 py-2 whitespace-nowrap text-white shadow-[0_6px_18px_rgba(15,27,42,0.18)]">
      <p className="text-[11.5px] text-[#C9D3DE]">{title}</p>
      {rows.length === 1 && !rows[0]?.color ? (
        <p className="mt-0.5 text-[15px] font-extrabold">{rows[0]?.value}</p>
      ) : (
        <ul className="mt-1 flex flex-col gap-1">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-2 text-[12.5px]">
              {row.color ? (
                <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: row.color }} />
              ) : null}
              <span className="text-[#C9D3DE]">{row.label}</span>
              <span className="ml-auto pl-3 font-extrabold">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
