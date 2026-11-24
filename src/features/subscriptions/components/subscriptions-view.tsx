"use client"

import { CalendarClock, CalendarPlus, CalendarX2, CircleCheck, Download, Eye, PowerOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton, AppLinkButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SearchInput } from "@/components/shared/search-input"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { StatGrid, StatTile } from "@/components/shared/stat-tile"
import { StatusPill } from "@/components/shared/status-pill"
import { ExtendSubscriptionDialog } from "@/features/companies/components/extend-subscription-dialog"
import { useCompanyDirectory } from "@/features/companies/hooks/use-companies"
import { companyStatusMeta, EXPIRING_SOON_DAYS } from "@/features/companies/lib/company-status"
import type { Company } from "@/features/companies/types/company.types"
import type { PillTone } from "@/lib/constants/status"
import { daysUntil, formatDate, formatNumber } from "@/lib/utils"

import { exportSubscriptionsCsv } from "../lib/subscription-export"
import { countSubscriptions, filterSubscriptions, SEGMENT_LABELS, type SubscriptionRow, type SubscriptionSegment, toSubscriptionRows } from "../lib/subscription-filters"

const SEGMENTS: readonly SubscriptionSegment[] = ["expiring", "expired", "active", "disabled", "all"]

const EMPTY_COPY: Record<SubscriptionSegment, string> = {
  expiring: `Aucun abonnement n’arrive à échéance dans les ${EXPIRING_SOON_DAYS} prochains jours.`,
  expired: "Aucun abonnement expiré.",
  active: "Aucun abonnement actif.",
  disabled: "Aucune entreprise désactivée.",
  all: "Les abonnements des entreprises apparaîtront ici.",
}

function remainingPill(days: number): { tone: PillTone; label: string } {
  if (days < 0) return { tone: "danger", label: `Expiré depuis ${-days} j` }
  if (days === 0) return { tone: "danger", label: "Expire aujourd’hui" }
  if (days <= EXPIRING_SOON_DAYS)
    return {
      tone: "warning",
      label: `${days} j restant${days > 1 ? "s" : ""}`,
    }
  return { tone: "neutral", label: `${formatNumber(days)} j restants` }
}

/** Reads the current time: rendered behind Suspense by its page. */
export function SubscriptionsView() {
  const router = useRouter()
  const [now] = useState(() => new Date())
  const [segment, setSegment] = useState<SubscriptionSegment>("expiring")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [extending, setExtending] = useState<Company | null>(null)

  const directory = useCompanyDirectory()
  const allRows = directory.data ? toSubscriptionRows(directory.data, now) : undefined
  const counts = allRows ? countSubscriptions(allRows) : undefined
  const filtered = allRows ? filterSubscriptions(allRows, segment, search) : undefined
  const total = filtered?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rows = filtered?.slice((page - 1) * pageSize, page * pageSize)

  const segmentOptions = SEGMENTS.map((value) => ({
    value,
    label: counts ? `${SEGMENT_LABELS[value]} · ${formatNumber(counts[value])}` : SEGMENT_LABELS[value],
  }))

  function exportCsv() {
    if (!filtered) return
    exportSubscriptionsCsv(filtered, now, `abonnements-${segment}.csv`)
    toast.success("Export prêt", {
      description: `${formatNumber(filtered.length)} abonnements exportés en CSV.`,
    })
  }

  const columns: DataColumn<SubscriptionRow>[] = [
    {
      id: "company",
      header: "Entreprise",
      cell: ({ company: c }) => (
        <>
          <Link href={`/companies/${c.id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-ink hover:text-brand">
            {c.name}
          </Link>
          <span className="block text-xs text-muted-foreground">{c.email ?? c.phone ?? `#${c.id}`}</span>
        </>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      cell: ({ company: c, trial }) => (
        <span className="flex flex-wrap items-center gap-1.5">
          {c.planName ?? <span className="text-muted-foreground">—</span>}
          {trial ? <StatusPill tone="brand">Essai</StatusPill> : null}
        </span>
      ),
    },
    {
      id: "end",
      header: "Fin d’abonnement",
      cell: ({ company: c }) => {
        if (!c.subscriptionEnd) return <span className="text-muted-foreground">Non renseignée</span>
        const pill = remainingPill(daysUntil(c.subscriptionEnd, now))
        return (
          <span className="flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap text-ink-soft">{formatDate(c.subscriptionEnd)}</span>
            <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
          </span>
        )
      },
    },
    {
      id: "status",
      header: "Statut",
      cell: ({ status }) => <StatusPill tone={companyStatusMeta[status].tone}>{companyStatusMeta[status].label}</StatusPill>,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      cell: ({ company: c }) => <RowActions company={c} onExtend={setExtending} />,
    },
  ]

  return (
    <PageContainer>
      <PageIntro
        description="Suivi des échéances d’abonnement des entreprises clientes, calculé à partir de l’annuaire des entreprises."
        actions={
          <AppButton icon={<Download aria-hidden="true" />} disabled={!filtered || filtered.length === 0} onClick={exportCsv}>
            Exporter la sélection
          </AppButton>
        }
      />

      <StatGrid>
        <StatTile
          label="Actifs"
          icon={CircleCheck}
          tone="success"
          loading={directory.isPending}
          value={counts ? formatNumber(counts.active) : "—"}
          hint={counts && counts.trialActive > 0 ? `dont ${formatNumber(counts.trialActive)} en essai` : undefined}
        />
        <StatTile
          label={`Expirent sous ${EXPIRING_SOON_DAYS} jours`}
          icon={CalendarClock}
          tone="warning"
          loading={directory.isPending}
          value={counts ? formatNumber(counts.expiring) : "—"}
        />
        <StatTile label="Expirés" icon={CalendarX2} tone="danger" loading={directory.isPending} value={counts ? formatNumber(counts.expired) : "—"} />
        <StatTile label="Désactivés" icon={PowerOff} tone="brand" loading={directory.isPending} value={counts ? formatNumber(counts.disabled) : "—"} />
      </StatGrid>

      <AnalyticsCard
        id="subscriptions-list"
        title="Abonnements"
        description={filtered ? `${formatNumber(total)} abonnement${total > 1 ? "s" : ""} · ${SEGMENT_LABELS[segment].toLowerCase()}` : "Chargement…"}
        className="gap-4"
      >
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <SegmentedControl
              label="Filtrer par état d’abonnement"
              options={segmentOptions}
              value={segment}
              onValueChange={(value) => {
                setSegment(value)
                setPage(1)
              }}
              className="w-max"
            />
          </div>
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Entreprise, plan, téléphone…"
            label="Rechercher un abonnement"
            className="w-full lg:w-[280px]"
          />
        </div>

        <DataTable
          caption="Abonnements des entreprises"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.company.id}
          isLoading={directory.isPending}
          error={directory.error}
          onRetry={() => directory.refetch()}
          onRowClick={(row) => router.push(`/companies/${row.company.id}`)}
          minWidth={880}
          empty={{
            icon: CalendarClock,
            title: search.trim() ? "Aucun résultat" : "Aucun abonnement",
            description: search.trim() ? "Essayez un autre nom ou un autre filtre." : EMPTY_COPY[segment],
          }}
          renderMobileCard={({ company: c, status, trial }) => {
            const meta = companyStatusMeta[status]
            const pill = c.subscriptionEnd ? remainingPill(daysUntil(c.subscriptionEnd, now)) : null
            return (
              <div className="flex flex-col gap-3 rounded-xl border border-divider p-3.5">
                <Link href={`/companies/${c.id}`} className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0 truncate font-bold text-ink">{c.name}</span>
                    <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                    <span>{trial ? "Essai" : c.planName ? `Plan ${c.planName}` : "Plan non précisé"}</span>
                    <span>{c.subscriptionEnd ? `Fin ${formatDate(c.subscriptionEnd)}` : "Fin non renseignée"}</span>
                    {pill ? <StatusPill tone={pill.tone}>{pill.label}</StatusPill> : null}
                  </span>
                </Link>
                <AppButton variant="brandOutline" size="sm" icon={<CalendarPlus aria-hidden="true" />} onClick={() => setExtending(c)} className="w-full">
                  Prolonger
                </AppButton>
              </div>
            )
          }}
        />
        {filtered && total > 0 ? (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            itemLabel="abonnements"
          />
        ) : null}
      </AnalyticsCard>

      <ExtendSubscriptionDialog company={extending} onOpenChange={(open) => !open && setExtending(null)} />
    </PageContainer>
  )
}

function RowActions({ company, onExtend }: { company: Company; onExtend: (company: Company) => void }) {
  return (
    <span className="flex justify-end gap-1.5">
      <AppButton
        variant="brandOutline"
        size="sm"
        icon={<CalendarPlus aria-hidden="true" />}
        onClick={(event) => {
          event.stopPropagation()
          onExtend(company)
        }}
        aria-label={`Prolonger l’abonnement de ${company.name}`}
      >
        Prolonger
      </AppButton>
      <AppLinkButton
        href={`/companies/${company.id}`}
        onClick={(event) => event.stopPropagation()}
        variant="ghost"
        size="icon"
        aria-label={`Ouvrir la fiche de ${company.name}`}
        title="Ouvrir la fiche"
      >
        <Eye aria-hidden="true" />
      </AppLinkButton>
    </span>
  )
}
