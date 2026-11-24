"use client"

import { Building2, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SearchInput } from "@/components/shared/search-input"
import { StatusPill } from "@/components/shared/status-pill"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api/errors"
import { formatDate, formatNumber } from "@/lib/utils"

import { COMPANY_SEARCH_MIN_LENGTH, fetchAllCompanies } from "../api/companies-service"
import { useCompanies } from "../hooks/use-companies"
import { exportCompaniesCsv } from "../lib/company-export"
import { companyStatusMeta, getCompanyStatus } from "../lib/company-status"
import type { Company } from "../types/company.types"
import { CompanyActionsMenu } from "./company-actions-menu"
import { ExtendSubscriptionDialog } from "./extend-subscription-dialog"
import { ToggleCompanyDialog } from "./toggle-company-dialog"

export function CompaniesListView() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [extending, setExtending] = useState<Company | null>(null)
  const [toggling, setToggling] = useState<Company | null>(null)
  const [exporting, setExporting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)
  const effectiveSearch = debouncedSearch.trim().length >= COMPANY_SEARCH_MIN_LENGTH ? debouncedSearch.trim() : ""
  const companies = useCompanies({ page, pageSize, search: effectiveSearch })

  async function exportAll() {
    setExporting(true)
    try {
      const all = await fetchAllCompanies()
      exportCompaniesCsv(all, "entreprises.csv")
      toast.success("Export prêt", { description: `${formatNumber(all.length)} entreprises exportées en CSV.` })
    } catch (error) {
      toast.error("Export impossible", { description: getErrorMessage(error) })
    } finally {
      setExporting(false)
    }
  }

  const columns: DataColumn<Company>[] = [
    {
      id: "name",
      header: "Entreprise",
      cell: (c) => (
        <>
          <Link href={`/companies/${c.id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-ink hover:text-brand">
            {c.name}
          </Link>
          <span className="block text-xs text-muted-foreground">{c.rccm ? `RCCM ${c.rccm}` : `#${c.id}`}</span>
        </>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: (c) => (
        <span className="text-ink-soft">
          <span className="block whitespace-nowrap">{c.phone ?? "—"}</span>
          {c.email ? <span className="block max-w-[220px] truncate text-xs text-muted-foreground">{c.email}</span> : null}
        </span>
      ),
    },
    { id: "plan", header: "Plan", cell: (c) => c.planName ?? "—" },
    { id: "users", header: "Util.", align: "right", cell: (c) => <span className="tabular-nums">{formatNumber(c.usersCount)}</span> },
    { id: "pos", header: "PDV", align: "right", cell: (c) => <span className="tabular-nums">{formatNumber(c.pointsOfSaleCount)}</span>, className: "hidden xl:table-cell" },
    {
      id: "end",
      header: "Fin d’abonnement",
      cell: (c) => <span className="whitespace-nowrap text-ink-soft">{c.subscriptionEnd ? formatDate(c.subscriptionEnd) : "—"}</span>,
    },
    {
      id: "status",
      header: "Statut",
      cell: (c) => {
        const meta = companyStatusMeta[getCompanyStatus(c)]
        return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      },
    },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (c) => <CompanyActionsMenu company={c} onExtend={setExtending} onToggleEnabled={setToggling} />,
    },
  ]

  const result = companies.data

  return (
    <PageContainer>
      <PageIntro
        description="Entreprises clientes de la plateforme : abonnement, activation et accès à leur fiche."
        actions={
          <AppButton icon={<Download aria-hidden="true" />} pending={exporting} onClick={exportAll}>
            Exporter tout
          </AppButton>
        }
      />

      <AnalyticsCard
        id="companies-list"
        title="Toutes les entreprises"
        description={result ? `${formatNumber(result.total)} entreprise${result.total > 1 ? "s" : ""}${effectiveSearch ? ` pour « ${effectiveSearch} »` : ""}` : "Chargement…"}
        action={
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Nom, RCCM, téléphone…"
            label="Rechercher une entreprise"
            className="w-full sm:w-[300px]"
          />
        }
        className="gap-4"
      >
        <DataTable
          caption="Liste des entreprises"
          columns={columns}
          rows={result?.items}
          getRowId={(c) => c.id}
          isLoading={companies.isPending}
          isRefreshing={companies.isPlaceholderData}
          error={companies.error}
          onRetry={() => companies.refetch()}
          onRowClick={(c) => router.push(`/companies/${c.id}`)}
          minWidth={900}
          empty={{
            icon: Building2,
            title: effectiveSearch ? "Aucun résultat" : "Aucune entreprise",
            description: effectiveSearch ? "Essayez un autre nom ou numéro RCCM." : "Les entreprises inscrites apparaîtront ici.",
          }}
          renderMobileCard={(c) => {
            const meta = companyStatusMeta[getCompanyStatus(c)]
            return (
              <div className="flex items-start gap-2 rounded-xl border border-divider p-3.5">
                <Link href={`/companies/${c.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate font-bold text-ink">{c.name}</span>
                    <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                  </span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                    {c.planName ? <span>Plan {c.planName}</span> : null}
                    <span>{formatNumber(c.usersCount)} util.</span>
                    {c.subscriptionEnd ? <span>Fin {formatDate(c.subscriptionEnd)}</span> : null}
                  </span>
                  {c.phone ? <span className="text-[12.5px] text-muted-foreground">{c.phone}</span> : null}
                </Link>
                <CompanyActionsMenu company={c} onExtend={setExtending} onToggleEnabled={setToggling} />
              </div>
            )
          }}
        />
        {result && result.total > 0 ? (
          <PaginationBar
            page={page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            itemLabel="entreprises"
          />
        ) : null}
      </AnalyticsCard>

      <ExtendSubscriptionDialog company={extending} onOpenChange={(open) => !open && setExtending(null)} />
      <ToggleCompanyDialog company={toggling} onOpenChange={(open) => !open && setToggling(null)} />
    </PageContainer>
  )
}
