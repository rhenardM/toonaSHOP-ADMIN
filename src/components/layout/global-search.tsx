"use client"

import { Building2, CornerDownLeft, LoaderCircle, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useState } from "react"

import { StatusPill } from "@/components/shared/status-pill"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { navItems } from "@/config/navigation"
import { COMPANY_SEARCH_MIN_LENGTH } from "@/features/companies/api/companies-service"
import { useCompanySearch } from "@/features/companies/hooks/use-companies"
import { companyStatusMeta, getCompanyStatus } from "@/features/companies/lib/company-status"
import type { CompanyStatus } from "@/features/companies/types/company.types"
import { cn, normalizeSearchText } from "@/lib/utils"

type SearchResult =
  | { type: "page"; id: string; title: string; subtitle: string; href: string; icon: (typeof navItems)[number]["icon"] }
  | { type: "company"; id: string; title: string; subtitle: string; href: string; status: CompanyStatus }

function matchPages(query: string): SearchResult[] {
  const needle = normalizeSearchText(query.trim())
  return navItems
    .filter((item) => {
      if (!needle) return true
      const haystack = normalizeSearchText([item.title, item.description, ...(item.keywords ?? [])].join(" "))
      return haystack.includes(needle)
    })
    .slice(0, needle ? 6 : 5)
    .map((item) => ({
      type: "page",
      id: item.href,
      title: item.title,
      subtitle: item.description,
      href: item.href,
      icon: item.icon,
    }))
}

/** Topbar search trigger + ⌘K palette over pages and companies. */
export function GlobalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-11 min-w-0 flex-[0_1_380px] items-center gap-2.5 rounded-[11px] border bg-surface-subtle px-3.5 text-left text-muted-foreground transition-colors outline-none hover:border-input focus-visible:ring-3 focus-visible:ring-ring/40 md:flex"
      >
        <Search className="size-[17px] shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="flex-1 truncate text-[13.5px]">Rechercher une entreprise, une page…</span>
        <kbd className="rounded-md border border-input bg-white px-1.5 py-0.5 font-sans text-[11px]">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rechercher"
        className="flex size-11 shrink-0 items-center justify-center rounded-[11px] border bg-white text-ink-soft outline-none hover:bg-surface-subtle focus-visible:ring-3 focus-visible:ring-ring/40 md:hidden"
      >
        <Search className="size-[19px]" strokeWidth={1.9} aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Recherche globale</DialogTitle>
          <DialogDescription className="sr-only">
            Recherchez une page de la console ou une entreprise cliente.
          </DialogDescription>
          {/* Mounted only while open, so each opening starts from an empty query. */}
          {open ? <SearchPanel onClose={() => setOpen(false)} /> : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const companies = useCompanySearch(query)

  const searchingCompanies = query.trim().length >= COMPANY_SEARCH_MIN_LENGTH
  const results = useMemo<SearchResult[]>(() => {
    const companyResults: SearchResult[] = searchingCompanies
      ? (companies.data ?? []).map((company) => ({
          type: "company",
          id: `company-${company.id}`,
          title: company.name,
          subtitle: [company.rccm ? `RCCM ${company.rccm}` : null, company.planName ?? company.phone].filter(Boolean).join(" · "),
          href: `/companies/${company.id}`,
          status: getCompanyStatus(company),
        }))
      : []
    return [...matchPages(query), ...companyResults]
  }, [query, searchingCompanies, companies.data])

  const safeIndex = Math.min(activeIndex, Math.max(results.length - 1, 0))

  function select(result: SearchResult) {
    onClose()
    router.push(result.href)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((safeIndex + 1) % Math.max(results.length, 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((safeIndex - 1 + results.length) % Math.max(results.length, 1))
    } else if (event.key === "Enter") {
      const result = results[safeIndex]
      if (result) {
        event.preventDefault()
        select(result)
      }
    }
  }

  const pages = results.filter((r) => r.type === "page")
  const companyResults = results.filter((r) => r.type === "company")

  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="flex items-center gap-2.5 border-b px-4">
        <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
          placeholder="Rechercher une entreprise, une page…"
          aria-label="Rechercher"
          aria-controls="global-search-results"
          aria-activedescendant={results[safeIndex] ? `search-${results[safeIndex].id}` : undefined}
          role="combobox"
          aria-expanded="true"
          className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted-foreground"
        />
        {companies.isFetching ? (
          <LoaderCircle className="size-4 animate-spin text-muted-foreground" aria-label="Recherche en cours" />
        ) : null}
        <kbd className="hidden rounded-md border border-input bg-white px-1.5 py-0.5 text-[11px] text-muted-foreground sm:block">
          Échap
        </kbd>
      </div>

      <div id="global-search-results" role="listbox" aria-label="Résultats" className="overflow-y-auto p-2">
        {pages.length > 0 ? (
          <ResultGroup label="Pages">
            {pages.map((result) => (
              <ResultRow
                key={result.id}
                result={result}
                active={results[safeIndex]?.id === result.id}
                onSelect={select}
                onHover={() => setActiveIndex(results.indexOf(result))}
              />
            ))}
          </ResultGroup>
        ) : null}

        {searchingCompanies ? (
          <ResultGroup label="Entreprises">
            {companyResults.length > 0 ? (
              companyResults.map((result) => (
                <ResultRow
                  key={result.id}
                  result={result}
                  active={results[safeIndex]?.id === result.id}
                  onSelect={select}
                  onHover={() => setActiveIndex(results.indexOf(result))}
                />
              ))
            ) : companies.isError ? (
              <p className="px-3 py-2 text-[13px] text-danger">La recherche d’entreprises a échoué.</p>
            ) : companies.isFetching ? null : (
              <p className="px-3 py-2 text-[13px] text-muted-foreground">Aucune entreprise ne correspond.</p>
            )}
          </ResultGroup>
        ) : (
          <p className="px-3 pt-1 pb-2 text-[12.5px] text-muted-foreground">
            Saisissez au moins {COMPANY_SEARCH_MIN_LENGTH} caractères pour chercher une entreprise.
          </p>
        )}
      </div>
    </div>
  )
}

function ResultGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">{label}</p>
      {children}
    </div>
  )
}

function ResultRow({
  result,
  active,
  onSelect,
  onHover,
}: {
  result: SearchResult
  active: boolean
  onSelect: (result: SearchResult) => void
  onHover: () => void
}) {
  const Icon = result.type === "page" ? result.icon : Building2
  return (
    <div
      id={`search-${result.id}`}
      role="option"
      aria-selected={active}
      onClick={() => onSelect(result)}
      onMouseMove={onHover}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5",
        active ? "bg-brand-soft" : "hover:bg-surface-subtle"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          active ? "bg-white text-brand" : "bg-secondary text-ink-soft"
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{result.title}</span>
        <span className="block truncate text-[12.5px] text-muted-foreground">{result.subtitle}</span>
      </span>
      {result.type === "company" ? (
        <StatusPill tone={companyStatusMeta[result.status].tone}>{companyStatusMeta[result.status].label}</StatusPill>
      ) : null}
      {active ? <CornerDownLeft className="size-4 text-brand" aria-hidden="true" /> : null}
    </div>
  )
}
