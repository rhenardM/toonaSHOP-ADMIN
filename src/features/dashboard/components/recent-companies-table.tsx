"use client"

import { Building2, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton, AppLinkButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { StatusPill } from "@/components/shared/status-pill"
import { useRecentCompanies } from "@/features/companies/hooks/use-companies"
import { exportCompaniesCsv } from "@/features/companies/lib/company-export"
import { companyStatusMeta, getCompanyStatus } from "@/features/companies/lib/company-status"
import type { Company } from "@/features/companies/types/company.types"
import { formatDate, formatNumber } from "@/lib/utils"

const columns: DataColumn<Company>[] = [
  {
    id: "name",
    header: "Entreprise",
    cell: (c) => (
      <>
        <Link href={`/companies/${c.id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-ink hover:text-brand">
          {c.name}
        </Link>
        {c.rccm ? <span className="block text-xs text-muted-foreground">RCCM {c.rccm}</span> : null}
      </>
    ),
  },
  { id: "contact", header: "Contact", cell: (c) => <span className="whitespace-nowrap text-ink-soft">{c.phone ?? "—"}</span> },
  { id: "plan", header: "Plan", cell: (c) => c.planName ?? "—" },
  { id: "users", header: "Util.", align: "right", cell: (c) => <span className="tabular-nums">{formatNumber(c.usersCount)}</span> },
  { id: "pos", header: "Points de vente", align: "right", cell: (c) => <span className="tabular-nums">{formatNumber(c.pointsOfSaleCount)}</span> },
  {
    id: "status",
    header: "Statut",
    cell: (c) => {
      const meta = companyStatusMeta[getCompanyStatus(c)]
      return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
    },
  },
  {
    id: "created",
    header: "Inscrite le",
    cell: (c) => <span className="whitespace-nowrap text-ink-soft">{c.createdAt ? formatDate(c.createdAt) : "—"}</span>,
  },
]

export function RecentCompaniesTable() {
  const router = useRouter()
  const recent = useRecentCompanies(5)
  const companies = recent.data

  return (
    <AnalyticsCard
      id="new-companies"
      title="Nouvelles entreprises"
      description="Les dernières inscriptions"
      action={
        <div className="flex flex-wrap gap-2">
          <AppButton
            icon={<Download aria-hidden="true" />}
            disabled={!companies?.length}
            onClick={() => {
              if (!companies) return
              exportCompaniesCsv(companies, "nouvelles-entreprises.csv")
              toast.success("Export prêt", { description: `${companies.length} entreprises exportées en CSV.` })
            }}
          >
            Exporter
          </AppButton>
          <AppLinkButton href="/companies" variant="primary">
            Voir toutes les entreprises
          </AppLinkButton>
        </div>
      }
      className="gap-3.5"
    >
      <DataTable
        caption="Nouvelles entreprises"
        columns={columns}
        rows={companies}
        getRowId={(c) => c.id}
        isLoading={recent.isPending}
        error={recent.error}
        onRetry={() => recent.refetch()}
        onRowClick={(c) => router.push(`/companies/${c.id}`)}
        skeletonRows={5}
        empty={{ icon: Building2, title: "Aucune inscription récente", description: "Les nouvelles entreprises apparaîtront ici." }}
        renderMobileCard={(c) => {
          const meta = companyStatusMeta[getCompanyStatus(c)]
          return (
            <Link href={`/companies/${c.id}`} className="flex flex-col gap-2 rounded-xl border border-divider p-3.5 transition-colors hover:bg-surface-subtle">
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-bold text-ink">{c.name}</span>
                  {c.rccm ? <span className="block truncate text-xs text-muted-foreground">RCCM {c.rccm}</span> : null}
                </span>
                <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
              </span>
              <span className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-soft">
                {c.planName ? <span>Plan {c.planName}</span> : null}
                <span>{formatNumber(c.usersCount)} util.</span>
                <span>{formatNumber(c.pointsOfSaleCount)} PDV</span>
                {c.createdAt ? <span>{formatDate(c.createdAt)}</span> : null}
              </span>
            </Link>
          )
        }}
      />
    </AnalyticsCard>
  )
}
