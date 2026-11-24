/**
 * Shared Recharts styling, aligned with the prototype: recessive grid,
 * muted 11.5px ticks, brand-coloured marks. Colours reference CSS tokens.
 */
export const chartColors = {
  brand: "var(--brand)",
  grid: "var(--grid)",
  axis: "var(--axis)",
  ink: "var(--ink)",
  /** Categorical order — validated for contrast & colour-vision deficiency. */
  categorical: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"],
} as const

export const axisTick = { fontSize: 11.5, fill: "var(--muted-foreground)" } as const

export const chartAnimation = { animationDuration: 500, animationEasing: "ease-out" } as const
