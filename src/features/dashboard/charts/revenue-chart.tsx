"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartTooltipCard } from "@/components/charts/chart-tooltip"
import { axisTick, chartAnimation, chartColors } from "@/components/charts/chart-theme"
import {
  formatCurrency,
  formatMonthTick,
  formatMonthYear,
  formatNumber,
  formatShortDate,
} from "@/lib/utils"

import type { RevenuePoint, RevenueWindow } from "../types/dashboard.types"

interface RevenueChartProps {
  data: RevenuePoint[]
  period: RevenueWindow
  currency: string
}

function tickLabel(date: string, period: RevenueWindow): string {
  return period === "12m" ? formatMonthTick(date) : formatShortDate(date)
}

function tooltipTitle(date: string, period: RevenueWindow): string {
  if (period === "12m") return formatMonthYear(date)
  if (period === "90d") return `Semaine au ${formatShortDate(date)}`
  return formatShortDate(date)
}

export function RevenueChart({ data, period, currency }: RevenueChartProps) {
  return (
    <div className="h-[240px] w-full" role="img" aria-label={describe(data, period, currency)}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 240 }}>
        <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={chartColors.brand} stopOpacity={0.18} />
              <stop offset="1" stopColor={chartColors.brand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => tickLabel(value, period)}
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: chartColors.axis }}
            tickMargin={10}
            minTickGap={period === "12m" ? 8 : 24}
            interval="preserveStartEnd"
          />
          <YAxis
            width={48}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            tickCount={5}
            allowDecimals={false}
            tickFormatter={(value: number) => formatNumber(value)}
            domain={[0, "auto"]}
          />
          <Tooltip
            defaultIndex={period === "12m" ? Math.max(data.length - 2, 0) : undefined}
            cursor={{ stroke: chartColors.ink, strokeWidth: 1, strokeDasharray: "4 4" }}
            content={({ active, payload, label }) => {
              const point = payload?.[0]
              if (!active || !point || typeof label !== "string") return null
              return (
                <ChartTooltipCard
                  title={tooltipTitle(label, period)}
                  rows={[{ label: "Encaissé", value: formatCurrency(Number(point.value), currency) }]}
                />
              )
            }}
          />
          <Area
            type="linear"
            dataKey="amount"
            name="Encaissé"
            stroke={chartColors.brand}
            strokeWidth={2.5}
            strokeLinejoin="round"
            fill="url(#revenue-fill)"
            activeDot={{ r: 6, fill: "#fff", stroke: chartColors.brand, strokeWidth: 3 }}
            dot={false}
            {...chartAnimation}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function describe(data: RevenuePoint[], period: RevenueWindow, currency: string): string {
  const first = data[0]
  const last = data[data.length - 1]
  if (!first || !last) return "Aucune donnée de revenus"
  return `Revenus de ${tooltipTitle(first.date, period)} à ${tooltipTitle(last.date, period)}, de ${formatCurrency(first.amount, currency)} à ${formatCurrency(last.amount, currency)}`
}
