"use client"

import { CircleAlert, CircleCheck, Clock, MessageSquareWarning, Plus, TriangleAlert } from "lucide-react"
import { useMemo, useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { type FilterOption, FilterSelect } from "@/components/shared/filter-select"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SearchInput } from "@/components/shared/search-input"
import { StatGrid, StatTile } from "@/components/shared/stat-tile"
import { StatusPill } from "@/components/shared/status-pill"
import { formatDate, formatNumber, normalizeSearchText } from "@/lib/utils"

import { useClaims } from "../hooks/use-claims"
import { CLAIM_PRIORITIES, CLAIM_STATUSES, claimPriorityMeta, claimStatusMeta, compareClaimsByDate, isOpenClaim } from "../lib/claim-meta"
import type { Claim, ClaimPriority, ClaimStatus } from "../types/claim.types"
import { ClaimDetailSheet } from "./claim-detail-sheet"
import { CreateClaimDialog } from "./create-claim-dialog"

type StatusFilter = ClaimStatus | "all"
type PriorityFilter = ClaimPriority | "all"

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: "all", label: "Tous les statuts" },
  ...CLAIM_STATUSES.map((value) => ({ value, label: claimStatusMeta[value].label })),
]
const PRIORITY_OPTIONS: FilterOption<PriorityFilter>[] = [
  { value: "all", label: "Toutes priorités" },
  ...CLAIM_PRIORITIES.map((value) => ({ value, label: `Priorité ${claimPriorityMeta[value].label.toLowerCase()}` })),
]

function ClaimPills({ claim }: { claim: Claim }) {
  const status = claimStatusMeta[claim.status]
  const priority = claimPriorityMeta[claim.priority]
  return (
    <span className="flex flex-wrap gap-1.5">
      <StatusPill tone={priority.tone}>{priority.label}</StatusPill>
      <StatusPill tone={status.tone}>{status.label}</StatusPill>
    </span>
  )
}

const columns: DataColumn<Claim>[] = [
  {
    id: "title",
    header: "Titre",
    cell: (c) => (
      <>
        <span className="block max-w-[340px] truncate font-bold text-ink">{c.title}</span>
        <span className="block max-w-[340px] truncate text-xs text-muted-foreground">{c.description || `#${c.id}`}</span>
      </>
    ),
  },
  { id: "client", header: "Client", cell: (c) => <span className="block max-w-[200px] truncate text-ink-soft">{c.client || "—"}</span> },
  {
    id: "priority",
    header: "Priorité",
    cell: (c) => <StatusPill tone={claimPriorityMeta[c.priority].tone}>{claimPriorityMeta[c.priority].label}</StatusPill>,
  },
  {
    id: "status",
    header: "Statut",
    cell: (c) => <StatusPill tone={claimStatusMeta[c.status].tone}>{claimStatusMeta[c.status].label}</StatusPill>,
  },
  {
    id: "date",
    header: "Date",
    cell: (c) => <span className="whitespace-nowrap text-ink-soft">{c.createdAt ? formatDate(c.createdAt) : "—"}</span>,
  },
]

export function ClaimsView() {
  const claims = useClaims()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [priority, setPriority] = useState<PriorityFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selected, setSelected] = useState<Claim | null>(null)
  const [creating, setCreating] = useState(false)

  const all = claims.data
  const sorted = useMemo(() => (all ? [...all].sort(compareClaimsByDate) : undefined), [all])

  const stats = useMemo(() => {
    const list = all ?? []
    return {
      open: list.filter((c) => c.status === "pending").length,
      inProgress: list.filter((c) => c.status === "in-progress").length,
      resolved: list.filter((c) => c.status === "resolved" || c.status === "closed").length,
      closed: list.filter((c) => c.status === "closed").length,
      highOpen: list.filter((c) => c.priority === "high" && isOpenClaim(c)).length,
    }
  }, [all])

  const term = normalizeSearchText(search.trim())
  const filtered = useMemo(
    () =>
      sorted?.filter(
        (c) =>
          (status === "all" || c.status === status) &&
          (priority === "all" || c.priority === priority) &&
          (!term || normalizeSearchText(`${c.title} ${c.client} ${c.description}`).includes(term))
      ),
    [sorted, status, priority, term]
  )

  const total = filtered?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const rows = filtered?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const isFiltered = term !== "" || status !== "all" || priority !== "all"
  const loading = claims.isPending

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
  }

  return (
    <PageContainer>
      <PageIntro
        description="Réclamations remontées par les clients : suivi par statut et priorité, détail de chaque demande."
        actions={
          <AppButton variant="primary" icon={<Plus aria-hidden="true" />} onClick={() => setCreating(true)}>
            Nouvelle réclamation
          </AppButton>
        }
      />

      <StatGrid>
        <StatTile label="Ouvertes" value={formatNumber(stats.open)} icon={CircleAlert} tone="warning" loading={loading} />
        <StatTile label="En cours" value={formatNumber(stats.inProgress)} icon={Clock} loading={loading} />
        <StatTile
          label="Résolues"
          value={formatNumber(stats.resolved)}
          icon={CircleCheck}
          tone="success"
          loading={loading}
          hint={stats.closed > 0 ? `dont ${formatNumber(stats.closed)} fermée${stats.closed > 1 ? "s" : ""}` : undefined}
        />
        <StatTile label="Priorité haute" value={formatNumber(stats.highOpen)} icon={TriangleAlert} tone="danger" loading={loading} hint="non résolues" />
      </StatGrid>

      <AnalyticsCard
        id="claims-list"
        title="Toutes les réclamations"
        description={all ? `${formatNumber(total)} réclamation${total > 1 ? "s" : ""}${isFiltered ? ` sur ${formatNumber(all.length)}` : ""}` : "Chargement…"}
        className="gap-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder="Titre, client, description…"
            label="Rechercher une réclamation"
            className="w-full sm:w-[300px]"
          />
          <FilterSelect label="Filtrer par statut" value={status} options={STATUS_OPTIONS} onValueChange={resetPage(setStatus)} className="w-full sm:w-auto" />
          <FilterSelect label="Filtrer par priorité" value={priority} options={PRIORITY_OPTIONS} onValueChange={resetPage(setPriority)} className="w-full sm:w-auto" />
        </div>

        <DataTable
          caption="Liste des réclamations"
          columns={columns}
          rows={rows}
          getRowId={(c) => c.id}
          isLoading={claims.isPending}
          isRefreshing={claims.isFetching && !claims.isPending}
          error={claims.error}
          onRetry={() => claims.refetch()}
          onRowClick={setSelected}
          minWidth={820}
          empty={{
            icon: MessageSquareWarning,
            title: isFiltered ? "Aucun résultat" : "Aucune réclamation",
            description: isFiltered ? "Modifiez la recherche ou les filtres." : "Les réclamations enregistrées apparaîtront ici.",
          }}
          renderMobileCard={(c) => (
            <button
              type="button"
              onClick={() => setSelected(c)}
              className="flex w-full flex-col gap-2 rounded-xl border border-divider p-3.5 text-left hover:bg-surface-subtle"
            >
              <span className="line-clamp-2 font-bold break-words text-ink">{c.title}</span>
              <ClaimPills claim={c} />
              <span className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                {c.client ? <span className="max-w-full truncate">{c.client}</span> : null}
                {c.createdAt ? <span>{formatDate(c.createdAt)}</span> : null}
              </span>
            </button>
          )}
        />
        {total > 0 ? (
          <PaginationBar
            page={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={resetPage(setPageSize)}
            itemLabel="réclamations"
          />
        ) : null}
      </AnalyticsCard>

      <ClaimDetailSheet claim={selected} onOpenChange={(open) => !open && setSelected(null)} />
      <CreateClaimDialog open={creating} onOpenChange={setCreating} />
    </PageContainer>
  )
}
