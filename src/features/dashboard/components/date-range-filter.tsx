"use client"

import { CalendarDays } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { DATE_RANGE_OPTIONS } from "../constants"
import type { DateRangePreset } from "../types/dashboard.types"

interface DateRangeFilterProps {
  value: DateRangePreset
  onValueChange: (value: DateRangePreset) => void
}

const items = DATE_RANGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))

/** Analysis period for the payment analytics. */
export function DateRangeFilter({ value, onValueChange }: DateRangeFilterProps) {
  return (
    <Select items={items} value={value} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger
        aria-label="Période d’analyse"
        className="h-10 min-w-[190px] gap-2 rounded-[10px] border-input bg-white px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface-subtle"
      >
        <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
