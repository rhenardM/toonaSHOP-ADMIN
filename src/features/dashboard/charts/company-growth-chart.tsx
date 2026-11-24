"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartTooltipCard } from "@/components/charts/chart-tooltip"
import { axisTick, chartAnimation, chartColors } from "@/components/charts/chart-theme"
import { formatMonthTick, formatMonthYear, formatNumber } from "@/lib/utils"

import type { CompanyGrowthPoint } from "../types/dashboard.types"

export function CompanyGrowthChart({ data }: { data: CompanyGrowthPoint[] }) {
  const total = data.reduce((sum, p) => sum + p.signups, 0)
  return (
    <div className="h-[220px] w-full" role="img" aria-label={`${total} nouvelles entreprises sur ${data.length} mois.`}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 520, height: 220 }}>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => formatMonthTick(value)}
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: chartColors.axis }}
            tickMargin={10}
            interval="preserveStartEnd"
            minTickGap={6}
          />
          <YAxis width={32} tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} tickCount={5} />
          <Tooltip
            cursor={{ fill: "var(--surface-subtle)" }}
            content={({ active, payload, label }) => {
              const point = payload?.[0]
              if (!active || !point || typeof label !== "string") return null
              return <ChartTooltipCard title={formatMonthYear(label)} rows={[{ label: "Inscriptions", value: formatNumber(Number(point.value)) }]} />
            }}
          />
          <Bar dataKey="signups" name="Inscriptions" fill={chartColors.brand} radius={[4, 4, 0, 0]} maxBarSize={28} {...chartAnimation} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
