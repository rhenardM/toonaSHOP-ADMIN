"use client"

import { Banknote, CircleCheck, CircleX, Download, Info, Receipt, WalletCards } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { ErrorState } from "@/components/shared/error-state"
import { FilterSelect } from "@/components/shared/filter-select"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SearchInput } from "@/components/shared/search-input"
import { StatGrid, StatTile } from "@/components/shared/stat-tile"
import { StatusPill } from "@/components/shared/status-pill"
import { ExtendSubscriptionDialog } from "@/features/companies/components/extend-subscription-dialog"
import type { Company } from "@/features/companies/types/company.types"
import { usePaymentsLast12Months } from "@/features/dashboard/hooks/use-dashboard-data"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api/errors"
import { formatCurrency, formatDate, formatNumber, formatPercent, formatTime } from "@/lib/utils"

import { fetchPaymentsSince } from "../api/payments-service"
import { usePayments, usePaymentStats } from "../hooks/use-payments"
import { exportPaymentsCsv } from "../lib/payment-export"
import { ALL, collectProviders, filterPayments, hasActiveFilters } from "../lib/payment-filters"
import { PAYMENT_STATUS_OPTIONS, paymentStatusMeta } from "../lib/payment-status"
import type { Payment } from "../types/payment.types"
import { paymentColumns } from "./payment-columns"
import { hasCompany, PaymentActionsMenu, type PaymentWithCompany } from "./payment-actions-menu"

type ExtendTarget = Pick<Company, "id" | "name" | "planName" | "subscriptionEnd">

const STATUS_OPTIONS = [{ value: ALL, label: "Tous les statuts" }, ...PAYMENT_STATUS_OPTIONS]

export function PaymentsView() {
  const router = useRouter()
  const [status, setStatus] = useState<string>(ALL)
  const [provider, setProvider] = useState<string>(ALL)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [extending, setExtending] = useState<ExtendTarget | null>(null)
  const [exporting, setExporting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)
  const filters = { status, provider, search: debouncedSearch }
  const filtering = hasActiveFilters(filters)

  const stats = usePaymentStats()
  // Source of every filtered view (no server-side filters): only loaded once a filter is used.
  const recent = usePaymentsLast12Months(filtering)
  const paged = usePayments({ page, pageSize }, !filtering)

  const filtered = filtering && recent.data ? filterPayments(recent.data, filters) : undefined
  const clientTotalPages = filtered ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1
  const rows = filtering ? filtered?.slice((page - 1) * pageSize, page * pageSize) : paged.data?.items
  const total = filtering ? (filtered?.length ?? 0) : (paged.data?.total ?? 0)
  const totalPages = filtering ? clientTotalPages : (paged.data?.totalPages ?? 1)
  const activeQuery = filtering ? recent : paged

  const providerOptions = [
    { value: ALL, label: "Tous les opérateurs" },
    ...collectProviders(stats.data?.byProvider.map((p) => p.provider) ?? [], recent.data?.map((p) => p.provider) ?? []).map((p) => ({ value: p, label: p })),
  ]

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  function openExtend(payment: PaymentWithCompany) {
    setExtending({
      id: payment.company.id,
      name: payment.company.name,
      planName: payment.plan,
      subscriptionEnd: null,
    })
  }

  async function exportCsv() {
    if (filtered) {
      exportPaymentsCsv(filtered, "paiements-filtres.csv")
      toast.success("Export prêt", {
        description: `${formatNumber(filtered.length)} paiements exportés en CSV.`,
      })
      return
    }
    setExporting(true)
    try {
      const all = await fetchPaymentsSince(new Date(0))
      exportPaymentsCsv(all, "paiements.csv")
      toast.success("Export prêt", {
        description: `${formatNumber(all.length)} paiements exportés en CSV.`,
      })
    } catch (error) {
      toast.error("Export impossible", { description: getErrorMessage(error) })
    } finally {
      setExporting(false)
    }
  }

  const columns: DataColumn<Payment>[] = [
    ...paymentColumns({ showCompany: true }),
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (p) => (hasCompany(p) ? <PaymentActionsMenu payment={p} onExtend={openExtend} /> : null),
    },
  ]

  const totals = stats.data?.totals
  const failedTotal = totals ? totals.failed + totals.timeout : 0

  return (
    <PageContainer>
      <PageIntro
        description="Historique des paiements d’abonnement reçus via les opérateurs mobile money et carte."
        actions={
          <AppButton icon={<Download aria-hidden="true" />} pending={exporting} disabled={filtering && !filtered} onClick={exportCsv}>
            {filtering ? "Exporter la sélection" : "Exporter tout"}
          </AppButton>
        }
      />

      {stats.isError ? (
        <ErrorState error={stats.error} title="Statistiques de paiement indisponibles" onRetry={() => stats.refetch()} retrying={stats.isFetching} className="py-8" />
      ) : (
        <StatGrid>
          <StatTile label="Transactions" icon={Receipt} loading={stats.isPending} value={totals ? formatNumber(totals.total) : "—"} />
          <StatTile label="Montant total" icon={Banknote} loading={stats.isPending} value={totals ? formatCurrency(totals.totalAmount) : "—"} />
          <StatTile
            label="Approuvés"
            icon={CircleCheck}
            tone="success"
            loading={stats.isPending}
            value={totals ? formatNumber(totals.approved) : "—"}
            hint={totals && totals.total > 0 ? `${formatPercent(totals.approved / totals.total)} des transactions` : undefined}
          />
          <StatTile
            label="Échoués + timeout"
            icon={CircleX}
            tone="danger"
            loading={stats.isPending}
            value={totals ? formatNumber(failedTotal) : "—"}
            hint={totals ? `${formatNumber(totals.failed)} échoués · ${formatNumber(totals.timeout)} timeout` : undefined}
          />
        </StatGrid>
      )}

      <AnalyticsCard
        id="payments-list"
        title="Historique des paiements"
        description={activeQuery.data ? `${formatNumber(total)} paiement${total > 1 ? "s" : ""}${filtering ? " correspondant aux filtres" : ""}` : "Chargement…"}
        className="gap-4"
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={search}
            onChange={resetPage(setSearch)}
            placeholder="Référence, transaction, entreprise…"
            label="Rechercher un paiement"
            className="w-full sm:w-[300px]"
          />
          <FilterSelect label="Filtrer par statut" value={status} options={STATUS_OPTIONS} onValueChange={resetPage(setStatus)} className="w-full sm:w-auto" />
          <FilterSelect label="Filtrer par opérateur" value={provider} options={providerOptions} onValueChange={resetPage(setProvider)} className="w-full sm:w-auto" />
        </div>

        {filtering ? (
          <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-[12.5px] text-ink-soft">
            <Info className="mt-px size-4 shrink-0 text-brand" aria-hidden="true" />
            Les filtres portent sur les paiements des 12 derniers mois : l’API ne permet pas encore de filtrer côté serveur.
          </p>
        ) : null}

        <DataTable
          caption="Historique des paiements"
          columns={columns}
          rows={rows}
          getRowId={(p) => p.id}
          isLoading={activeQuery.isPending}
          isRefreshing={!filtering && paged.isPlaceholderData}
          error={activeQuery.error}
          onRetry={() => activeQuery.refetch()}
          onRowClick={(p) => {
            if (p.company) router.push(`/companies/${p.company.id}`)
          }}
          minWidth={980}
          empty={{
            icon: WalletCards,
            title: filtering ? "Aucun paiement trouvé" : "Aucun paiement",
            description: filtering ? "Aucun paiement des 12 derniers mois ne correspond à ces filtres." : "Les paiements d’abonnement apparaîtront ici.",
          }}
          renderMobileCard={(p) => <PaymentMobileCard payment={p} onExtend={openExtend} />}
        />
        {activeQuery.data && total > 0 ? (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={resetPage(setPageSize)}
            itemLabel="paiements"
          />
        ) : null}
      </AnalyticsCard>

      <ExtendSubscriptionDialog company={extending} onOpenChange={(open) => !open && setExtending(null)} />
    </PageContainer>
  )
}

function PaymentMobileCard({ payment: p, onExtend }: { payment: Payment; onExtend: (payment: PaymentWithCompany) => void }) {
  const meta = paymentStatusMeta(p.status)
  const body = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate font-bold text-ink">{p.company?.name ?? "Sans entreprise"}</span>
        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      </span>
      <span className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
        <strong className="font-bold text-ink tabular-nums">{formatCurrency(p.amount, p.currency)}</strong>
        <span>{p.provider}</span>
        {p.plan ? (
          <span>
            Plan {p.plan}
            {p.months ? ` · ${p.months} mois` : ""}
          </span>
        ) : null}
      </span>
      <span className="truncate text-[12px] text-muted-foreground">
        {p.createdAt ? `${formatDate(p.createdAt)} ${formatTime(p.createdAt)}` : "Date inconnue"}
        {p.reference ? ` · ${p.reference}` : ""}
      </span>
    </>
  )
  return (
    <div className="flex items-start gap-2 rounded-xl border border-divider p-3.5">
      {hasCompany(p) ? (
        <>
          <Link href={`/companies/${p.company.id}`} className="flex min-w-0 flex-1 flex-col gap-1.5">
            {body}
          </Link>
          <PaymentActionsMenu payment={p} onExtend={onExtend} />
        </>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">{body}</div>
      )}
    </div>
  )
}
