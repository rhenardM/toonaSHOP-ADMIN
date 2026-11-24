"use client"

import { BadgeCheck, Landmark } from "lucide-react"
import { useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { InitialsTile } from "@/components/shared/initials-tile"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { formatDate, formatNumber } from "@/lib/utils"

import { usePendingImf } from "../hooks/use-imf"
import type { ImfGroup } from "../types/imf.types"
import { ApproveImfDialog } from "./approve-imf-dialog"
import { ImfContactCell } from "./imf-contact-cell"

export function ImfPendingView() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [approving, setApproving] = useState<ImfGroup | null>(null)
  const pending = usePendingImf({ page, pageSize })
  const result = pending.data

  const approveButton = (group: ImfGroup) => (
    <AppButton variant="primary" size="sm" icon={<BadgeCheck aria-hidden="true" />} onClick={() => setApproving(group)} aria-label={`Approuver ${group.name}`}>
      Approuver
    </AppButton>
  )

  const columns: DataColumn<ImfGroup>[] = [
    {
      id: "name",
      header: "Groupe",
      cell: (g) => (
        <span className="flex items-center gap-3">
          <InitialsTile name={g.name} tone="warning" />
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
      cell: (g) => <span className="block max-w-[220px] truncate text-ink-soft">{g.address ?? "—"}</span>,
    },
    { id: "plan", header: "Plan", cell: (g) => g.planName ?? "—" },
    {
      id: "requested",
      header: "Demandé le",
      cell: (g) => <span className="whitespace-nowrap text-ink-soft">{g.createdAt ? formatDate(g.createdAt) : "—"}</span>,
    },
    { id: "actions", header: "", align: "right", cell: approveButton },
  ]

  return (
    <PageContainer>
      <PageIntro description="Groupes ayant demandé le statut d’institution de microfinance. Vérifiez chaque demande avant de l’approuver." />

      <AnalyticsCard
        id="imf-pending"
        title="Demandes en attente"
        description={result ? `${formatNumber(result.total)} demande${result.total > 1 ? "s" : ""} à traiter` : "Chargement…"}
        className="gap-4"
      >
        <DataTable
          caption="Demandes IMF en attente"
          columns={columns}
          rows={result?.items}
          getRowId={(g) => g.id}
          isLoading={pending.isPending}
          isRefreshing={pending.isPlaceholderData}
          error={pending.error}
          onRetry={() => pending.refetch()}
          minWidth={860}
          empty={{ icon: Landmark, title: "Aucune demande en attente", description: "Les nouvelles demandes de statut IMF apparaîtront ici." }}
          renderMobileCard={(g) => (
            <div className="flex flex-col gap-3 rounded-xl border border-divider p-3.5">
              <div className="flex items-start gap-3">
                <InitialsTile name={g.name} tone="warning" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{g.name}</p>
                  <p className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                    {g.planName ? <span>Plan {g.planName}</span> : null}
                    {g.createdAt ? <span>Demandé le {formatDate(g.createdAt)}</span> : null}
                  </p>
                  {g.phone ? <p className="text-[12.5px] text-muted-foreground">{g.phone}</p> : null}
                  {g.email ? <p className="truncate text-[12.5px] text-muted-foreground">{g.email}</p> : null}
                  {g.address ? <p className="truncate text-[12.5px] text-muted-foreground">{g.address}</p> : null}
                </div>
              </div>
              <div className="flex justify-end">{approveButton(g)}</div>
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
            itemLabel="demandes"
          />
        ) : null}
      </AnalyticsCard>

      <ApproveImfDialog group={approving} onOpenChange={(open) => !open && setApproving(null)} />
    </PageContainer>
  )
}
