"use client"

import { cn } from "@/lib/utils"

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  options: readonly SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
  size?: "default" | "sm"
}

/** Pill toggle group from the prototype ("30 j · 90 j · 12 mois"). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
  size = "default",
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("flex gap-1 rounded-[10px] bg-secondary p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "rounded-[7px] px-3 text-[12.5px] whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              size === "default" ? "h-8" : "h-7",
              selected
                ? "bg-brand font-bold text-white"
                : "font-semibold text-ink-soft hover:bg-white/70 hover:text-ink"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
