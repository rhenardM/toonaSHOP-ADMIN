"use client"

import { ChartColumnBig, Landmark } from "lucide-react"
import { useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { InitialsTile } from "@/components/shared/initials-tile"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { formatDate, formatNumber } from "@/lib/utils"

import { useApprovedImf } from "../hooks/use-imf"
import type { ImfGroup } from "../types/imf.types"
import { ImfAnalyticsSheet } from "./imf-analytics-sheet"
import { ImfContactCell } from "./imf-contact-cell"

function ClientCounts({ group }: { group: ImfGroup }) {
  if (group.activeClients === null && group.inactiveClients === null) return <span className="text-muted-foreground">—</span>
  return (
    <span className="whitespace-nowrap tabular-nums">
      <span className="font-semibold text-success">{formatNumber(group.activeClients ?? 0)}</span>
      <span className="text-muted-foreground"> / {formatNumber(group.inactiveClients ?? 0)}</span>
    </span>
  )
}

export function ImfApprovedView() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selected, setSelected] = useState<ImfGroup | null>(null)
  const approved = useApprovedImf({ page, pageSize })
  const result = approved.data

  const analyticsButton = (group: ImfGroup) => (
    <AppButton
      variant="brandOutline"
      size="sm"
      icon={<ChartColumnBig aria-hidden="true" />}
      onClick={(event) => {
        event.stopPropagation()
        setSelected(group)
      }}
      aria-label={`Analytique de ${group.name}`}
    >
      Analytique
    </AppButton>
  )

  const columns: DataColumn<ImfGroup>[] = [
    {
      id: "name",
      header: "IMF",
      cell: (g) => (
        <span className="flex items-center gap-3">
          <InitialsTile name={g.name} />
          <span className="min-w-0">
            <span className="block font-bold text-ink">{g.name}</span>
            <span className="block text-xs text-muted-foreground">#{g.id}</span>
          </span>
        </span>
      ),
    },
    { id: "contact", header: "Contact", cell: (g) => <ImfContactCell group={g} /> },
    {
      id: "address",
      header: "Adresse",
      className: "hidden xl:table-cell",
      cell: (g) => <span className="block max-w-[200px] truncate text-ink-soft">{g.address ?? "—"}</span>,
    },
    { id: "plan", header: "Plan", cell: (g) => g.planName ?? "—" },
    {
      id: "approved",
      header: "Approuvé le",
      cell: (g) => <span className="whitespace-nowrap text-ink-soft">{g.approvedAt ? formatDate(g.approvedAt) : "—"}</span>,
    },
    { id: "clients", header: "Clients act. / inact.", align: "right", cell: (g) => <ClientCounts group={g} /> },
    { id: "actions", header: "", align: "right", cell: analyticsButton },
  ]

  return (
    <PageContainer>
      <PageIntro description="Institutions de microfinance validées : coordonnées, clients et indicateurs de ventes." />

      <AnalyticsCard
        id="imf-approved"
        title="IMF approuvées"
        description={result ? `${formatNumber(result.total)} institution${result.total > 1 ? "s" : ""}` : "Chargement…"}
        className="gap-4"
      >
        <DataTable
          caption="IMF approuvées"
          columns={columns}
          rows={result?.items}
          getRowId={(g) => g.id}
          isLoading={approved.isPending}
          isRefreshing={approved.isPlaceholderData}
          error={approved.error}
          onRetry={() => approved.refetch()}
          onRowClick={setSelected}
          minWidth={900}
          empty={{ icon: Landmark, title: "Aucune IMF approuvée", description: "Les groupes approuvés depuis « En attente » ou « Valider un groupe » apparaîtront ici." }}
          renderMobileCard={(g) => (
            <div className="flex flex-col gap-3 rounded-xl border border-divider p-3.5">
              <div className="flex items-start gap-3">
                <InitialsTile name={g.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{g.name}</p>
                  <p className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                    {g.planName ? <span>Plan {g.planName}</span> : null}
                    {g.approvedAt ? <span>Approuvé le {formatDate(g.approvedAt)}</span> : null}
                  </p>
                  {g.phone ? <p className="text-[12.5px] text-muted-foreground">{g.phone}</p> : null}
                  {g.email ? <p className="truncate text-[12.5px] text-muted-foreground">{g.email}</p> : null}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] text-muted-foreground">
                  Clients <ClientCounts group={g} />
                </span>
                {analyticsButton(g)}
              </div>
            </div>
          )}
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
            itemLabel="IMF"
          />
        ) : null}
      </AnalyticsCard>

      <ImfAnalyticsSheet group={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </PageContainer>
  )
}
