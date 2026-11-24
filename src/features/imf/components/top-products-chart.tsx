"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartTooltipCard, type ChartTooltipRow } from "@/components/charts/chart-tooltip"
import { axisTick, chartAnimation, chartColors } from "@/components/charts/chart-theme"
import { DEFAULT_CURRENCY } from "@/lib/constants/app"
import { formatCompactNumber, formatCurrency, formatNumber } from "@/lib/utils"

import type { ImfTopProduct } from "../types/imf.types"

const ROW_HEIGHT = 36
const MAX_PRODUCTS = 10

function shorten(label: string, max = 16): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

/** Horizontal bars, one per product, ordered by quantity sold. */
export function TopProductsChart({ products }: { products: ImfTopProduct[] }) {
  const data = products.slice(0, MAX_PRODUCTS)
  const height = data.length * ROW_HEIGHT + 32
  const summary = data.map((p) => `${p.name} : ${formatNumber(p.quantity)}`).join(", ")

  return (
    <div className="w-full" style={{ height }} role="img" aria-label={`Quantités vendues par produit. ${summary}.`}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 420, height }}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap="24%">
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis
            type="number"
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: chartColors.axis }}
            allowDecimals={false}
            tickFormatter={(value: number) => formatCompactNumber(value)}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={112}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            interval={0}
            tickFormatter={(value: string) => shorten(value)}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-subtle)" }}
            content={({ active, payload }) => {
              const product = payload?.[0]?.payload as ImfTopProduct | undefined
              if (!active || !product) return null
              const rows: ChartTooltipRow[] = [{ label: "Quantité", value: formatNumber(product.quantity) }]
              if (product.revenue !== null) rows.push({ label: "Revenu", value: formatCurrency(product.revenue, DEFAULT_CURRENCY) })
              return <ChartTooltipCard title={product.name} rows={rows} />
            }}
          />
          <Bar dataKey="quantity" name="Quantité" fill={chartColors.brand} radius={[0, 4, 4, 0]} maxBarSize={20} {...chartAnimation} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
