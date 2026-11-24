"use client"

import type { ReactNode } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { ChartTooltipCard } from "@/components/charts/chart-tooltip"
import { chartAnimation } from "@/components/charts/chart-theme"

export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutSlice[]
  /** Accessible summary of the chart. */
  ariaLabel: string
  center: ReactNode
  formatValue: (slice: DonutSlice, total: number) => string
  size?: number
}

/** Ring chart with a centred headline (payment health, subscription mix). */
export function DonutChart({ data, ariaLabel, center, formatValue, size = 168 }: DonutChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: size, height: size }}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="76%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="#fff"
            strokeWidth={2}
            {...chartAnimation}
          >
            {data.map((slice) => (
              <Cell key={slice.key} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ zIndex: 10 }}
            content={({ active, payload }) => {
              const entry = payload?.[0]
              const slice = entry?.payload as DonutSlice | undefined
              if (!active || !slice) return null
              return (
                <ChartTooltipCard
                  title={slice.label}
                  rows={[{ label: slice.label, value: formatValue(slice, total) }]}
                />
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {center}
      </div>
    </div>
  )
}
