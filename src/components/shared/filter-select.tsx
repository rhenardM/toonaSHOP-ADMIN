"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterOption<T extends string> {
  value: T
  label: string
}

interface FilterSelectProps<T extends string> {
  label: string
  value: T
  options: readonly FilterOption<T>[]
  onValueChange: (value: T) => void
  className?: string
  id?: string
}

/** Labelled select styled like the prototype's inputs (filters and form fields). */
export function FilterSelect<T extends string>({ label, value, options, onValueChange, className, id }: FilterSelectProps<T>) {
  return (
    <Select items={options.map((o) => ({ value: o.value, label: o.label }))} value={value} onValueChange={(next) => next !== null && onValueChange(next as T)}>
      <SelectTrigger
        id={id}
        aria-label={label}
        className={cn("h-10 min-w-[150px] rounded-[10px] border-input bg-white px-3 text-[13px] font-semibold text-ink-soft hover:bg-surface-subtle", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
