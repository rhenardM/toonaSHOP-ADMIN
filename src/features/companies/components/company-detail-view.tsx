"use client"

import { ArrowLeft, Building2, CalendarPlus, CreditCard, Mail, Phone, Power, PowerOff, Store, Users, Warehouse } from "lucide-react"
import { type ReactNode, useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton, AppLinkButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { ErrorState } from "@/components/shared/error-state"
import { InitialsTile } from "@/components/shared/initials-tile"
import { PageContainer } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { StatTile, StatGrid } from "@/components/shared/stat-tile"
import { StatusPill } from "@/components/shared/status-pill"
import { Skeleton } from "@/components/ui/skeleton"
import { paymentColumns } from "@/features/payments/components/payment-columns"
import { roleLabels } from "@/lib/auth/session-user"
import { DEFAULT_CURRENCY } from "@/lib/constants/app"
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils"

import { useCompany, useCompanyPayments, useCompanyUsers } from "../hooks/use-companies"
import { companyStatusMeta, getCompanyStatus } from "../lib/company-status"
import type { Company, CompanyUser } from "../types/company.types"
import { ExtendSubscriptionDialog } from "./extend-subscription-dialog"
import { ToggleCompanyDialog } from "./toggle-company-dialog"

type Tab = "users" | "payments"

export function CompanyDetailView({ companyId }: { companyId: number }) {
  const company = useCompany(companyId)
  const [extending, setExtending] = useState<Company | null>(null)
  const [toggling, setToggling] = useState<Company | null>(null)
  const [tab, setTab] = useState<Tab>("users")

  const back = (
    <AppLinkButton href="/companies" variant="ghost" size="sm" icon={<ArrowLeft aria-hidden="true" />} className="-ml-2 w-fit">
      Toutes les entreprises
    </AppLinkButton>
  )

  if (company.isPending) {
    return (
      <PageContainer>
        {back}
        <Skeleton className="h-[160px] rounded-2xl bg-card" />
        <Skeleton className="h-[400px] rounded-2xl bg-card" />
      </PageContainer>
    )
  }
  if (company.isError) {
    return (
      <PageContainer>
        {back}
        <ErrorState error={company.error} title="Entreprise introuvable" onRetry={() => company.refetch()} retrying={company.isFetching} />
      </PageContainer>
    )
  }

  const c = company.data
  const status = companyStatusMeta[getCompanyStatus(c)]

  return (
    <PageContainer>
      {back}

      <section className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:p-6" aria-labelledby="company-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <InitialsTile name={c.name} className="size-12 rounded-xl text-[15px]" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 id="company-title" className="text-xl font-extrabold tracking-[-0.01em] text-ink">
                  {c.name}
                </h2>
                <StatusPill tone={status.tone}>{status.label}</StatusPill>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {[c.rccm ? `RCCM ${c.rccm}` : null, `ID ${c.id}`, c.createdAt ? `inscrite le ${formatDate(c.createdAt)}` : null].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppButton variant={c.isEnabled ? "dangerOutline" : "outline"} icon={c.isEnabled ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />} onClick={() => setToggling(c)}>
              {c.isEnabled ? "Désactiver" : "Activer"}
            </AppButton>
            <AppButton variant="primary" icon={<CalendarPlus aria-hidden="true" />} onClick={() => setExtending(c)}>
              Prolonger l’abonnement
            </AppButton>
          </div>
        </div>

        <dl className="grid gap-x-6 gap-y-4 border-t border-divider pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Detail icon={<Phone aria-hidden="true" />} label="Téléphone" value={c.phone ? <a href={`tel:${c.phone}`} className="hover:text-brand">{c.phone}</a> : "—"} />
          <Detail icon={<Mail aria-hidden="true" />} label="Email" value={c.email ? <a href={`mailto:${c.email}`} className="break-all hover:text-brand">{c.email}</a> : "—"} />
          <Detail icon={<CreditCard aria-hidden="true" />} label="Plan" value={c.planName ?? "—"} />
          <Detail
            icon={<CalendarPlus aria-hidden="true" />}
            label="Fin d’abonnement"
            value={c.subscriptionEnd ? formatDate(c.subscriptionEnd) : "—"}
          />
        </dl>
      </section>

      <StatGrid>
        <StatTile label="Utilisateurs" value={formatNumber(c.usersCount)} icon={Users} />
        <StatTile label="Points de vente" value={formatNumber(c.pointsOfSaleCount)} icon={Store} />
        <StatTile label="Entrepôts" value={formatNumber(c.warehousesCount)} icon={Warehouse} />
        <StatTile
          label="Revenu généré"
          value={c.totalRevenue !== null ? formatCurrency(c.totalRevenue, DEFAULT_CURRENCY) : "—"}
          icon={Building2}
          tone="success"
        />
      </StatGrid>

      <AnalyticsCard
        id="company-activity"
        title={tab === "users" ? "Utilisateurs" : "Paiements"}
        description={tab === "users" ? "Comptes créés dans cette entreprise" : "Historique des paiements d’abonnement"}
        action={
          <SegmentedControl
            label="Section"
            options={[
              { value: "users", label: "Utilisateurs" },
              { value: "payments", label: "Paiements" },
            ]}
            value={tab}
            onValueChange={setTab}
          />
        }
        className="gap-4"
      >
        {tab === "users" ? <CompanyUsersTable companyId={c.id} /> : <CompanyPaymentsTable companyId={c.id} />}
      </AnalyticsCard>

      <ExtendSubscriptionDialog company={extending} onOpenChange={(open) => !open && setExtending(null)} />
      <ToggleCompanyDialog company={toggling} onOpenChange={(open) => !open && setToggling(null)} />
    </PageContainer>
  )
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-ink-soft [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[12px] text-muted-foreground">{label}</dt>
        <dd className="text-[13.5px] font-semibold text-ink">{value}</dd>
      </div>
    </div>
  )
}

const userColumns: DataColumn<CompanyUser>[] = [
  { id: "name", header: "Nom", cell: (u) => <span className="font-bold text-ink">{u.name}</span> },
  { id: "phone", header: "Téléphone", cell: (u) => <span className="whitespace-nowrap text-ink-soft">{u.phone ?? "—"}</span> },
  {
    id: "role",
    header: "Rôle",
    cell: (u) => (
      <span className="flex flex-wrap gap-1">
        {roleLabels(u.roles).map((label) => (
          <StatusPill key={label} tone="neutral">
            {label}
          </StatusPill>
        ))}
      </span>
    ),
  },
  { id: "site", header: "Affectation", cell: (u) => <span className="text-ink-soft">{[u.pointOfSale, u.warehouse].filter(Boolean).join(" · ") || "—"}</span> },
  { id: "created", header: "Créé le", cell: (u) => <span className="whitespace-nowrap text-ink-soft">{u.createdAt ? formatDate(u.createdAt) : "—"}</span> },
]

function CompanyUsersTable({ companyId }: { companyId: number }) {
  const [page, setPage] = useState(1)
  const users = useCompanyUsers(companyId, { page, pageSize: 10 })
  return (
    <>
      <DataTable
        caption="Utilisateurs de l’entreprise"
        columns={userColumns}
        rows={users.data?.items}
        getRowId={(u) => u.id}
        isLoading={users.isPending}
        isRefreshing={users.isPlaceholderData}
        error={users.error}
        onRetry={() => users.refetch()}
        minWidth={680}
        empty={{ icon: Users, title: "Aucun utilisateur", description: "Cette entreprise n’a encore créé aucun compte." }}
      />
      {users.data && users.data.total > 0 ? (
        <PaginationBar page={page} totalPages={users.data.totalPages} total={users.data.total} pageSize={10} onPageChange={setPage} itemLabel="utilisateurs" />
      ) : null}
    </>
  )
}

function CompanyPaymentsTable({ companyId }: { companyId: number }) {
  const [page, setPage] = useState(1)
  const payments = useCompanyPayments(companyId, { page, pageSize: 10 })
  return (
    <>
      <DataTable
        caption="Paiements de l’entreprise"
        columns={paymentColumns({ showCompany: false })}
        rows={payments.data?.items}
        getRowId={(p) => p.id}
        isLoading={payments.isPending}
        isRefreshing={payments.isPlaceholderData}
        error={payments.error}
        onRetry={() => payments.refetch()}
        minWidth={760}
        empty={{ icon: CreditCard, title: "Aucun paiement", description: "Aucun paiement enregistré pour cette entreprise." }}
      />
      {payments.data && payments.data.total > 0 ? (
        <PaginationBar page={page} totalPages={payments.data.totalPages} total={payments.data.total} pageSize={10} onPageChange={setPage} itemLabel="paiements" />
      ) : null}
    </>
  )
}
