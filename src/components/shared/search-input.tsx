"use client"

import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder, label = "Rechercher", className }: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex h-10 min-w-0 items-center gap-2 rounded-[10px] border border-input bg-white px-3 focus-within:border-brand focus-within:ring-3 focus-within:ring-ring/25",
        className
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-hover hover:text-ink"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
