"use client"

import { UserPlus, Users } from "lucide-react"
import { useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { StatusPill } from "@/components/shared/status-pill"
import { roleLabel } from "@/lib/auth/session-user"
import { formatNumber } from "@/lib/utils"

import { useUsers } from "../hooks/use-users"
import type { User } from "../types/user.types"
import { ToggleUserDialog } from "./toggle-user-dialog"
import { UserActionsMenu } from "./user-actions-menu"
import { UserFormDialog, type UserFormTarget } from "./user-form-dialog"

function assignment(user: User): string | null {
  return [user.pointOfSale ? `PDV ${user.pointOfSale}` : null, user.warehouse ? `Entrepôt ${user.warehouse}` : null].filter(Boolean).join(" · ") || null
}

function EnabledPill({ user }: { user: User }) {
  return <StatusPill tone={user.isEnabled ? "success" : "neutral"}>{user.isEnabled ? "Actif" : "Désactivé"}</StatusPill>
}

export function UsersListView() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [formTarget, setFormTarget] = useState<UserFormTarget>(null)
  const [toggling, setToggling] = useState<User | null>(null)

  const users = useUsers({ page, pageSize })
  const result = users.data

  const columns: DataColumn<User>[] = [
    {
      id: "name",
      header: "Nom",
      cell: (u) => (
        <>
          <span className="block font-bold text-ink">{u.name}</span>
          <span className="block text-xs text-muted-foreground">#{u.id}</span>
        </>
      ),
    },
    { id: "phone", header: "Téléphone", cell: (u) => <span className="whitespace-nowrap text-ink-soft">{u.phone || "—"}</span> },
    {
      id: "email",
      header: "Email",
      className: "hidden lg:table-cell",
      cell: (u) => <span className="block max-w-[220px] truncate text-ink-soft">{u.email ?? "—"}</span>,
    },
    { id: "role", header: "Rôle", cell: (u) => <StatusPill tone="brand">{roleLabel(u.roles)}</StatusPill> },
    { id: "site", header: "Affectation", cell: (u) => <span className="text-ink-soft">{assignment(u) ?? "—"}</span> },
    { id: "status", header: "Statut", cell: (u) => <EnabledPill user={u} /> },
    {
      id: "actions",
      header: "",
      align: "right",
      className: "w-12",
      cell: (u) => <UserActionsMenu user={u} onEdit={setFormTarget} onToggleEnabled={setToggling} />,
    },
  ]

  return (
    <PageContainer>
      <PageIntro
        description="Comptes du groupe de l’administrateur connecté (et non de toute la plateforme). Les utilisateurs d’une entreprise cliente se consultent depuis sa fiche."
        actions={
          <AppButton variant="primary" icon={<UserPlus aria-hidden="true" />} onClick={() => setFormTarget("new")}>
            Nouvel utilisateur
          </AppButton>
        }
      />

      <AnalyticsCard
        id="users-list"
        title="Utilisateurs du groupe"
        description={result ? `${formatNumber(result.total)} utilisateur${result.total > 1 ? "s" : ""}` : "Chargement…"}
        className="gap-4"
      >
        <DataTable
          caption="Utilisateurs du groupe"
          columns={columns}
          rows={result?.items}
          getRowId={(u) => u.id}
          isLoading={users.isPending}
          isRefreshing={users.isPlaceholderData}
          error={users.error}
          onRetry={() => users.refetch()}
          onRowClick={setFormTarget}
          minWidth={820}
          empty={{
            icon: Users,
            title: "Aucun utilisateur",
            description: "Créez un premier compte pour votre équipe.",
            action: (
              <AppButton variant="primary" icon={<UserPlus aria-hidden="true" />} onClick={() => setFormTarget("new")}>
                Nouvel utilisateur
              </AppButton>
            ),
          }}
          renderMobileCard={(u) => (
            <div className="flex items-start gap-2 rounded-xl border border-divider p-3.5">
              <button type="button" onClick={() => setFormTarget(u)} className="flex min-w-0 flex-1 flex-col gap-1.5 text-left">
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate font-bold text-ink">{u.name}</span>
                  <EnabledPill user={u} />
                </span>
                <span className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                  <span>{roleLabel(u.roles)}</span>
                  {u.phone ? <span>{u.phone}</span> : null}
                </span>
                {assignment(u) ? <span className="text-[12.5px] text-muted-foreground">{assignment(u)}</span> : null}
                {u.email ? <span className="truncate text-[12.5px] text-muted-foreground">{u.email}</span> : null}
              </button>
              <UserActionsMenu user={u} onEdit={setFormTarget} onToggleEnabled={setToggling} />
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
            itemLabel="utilisateurs"
          />
        ) : null}
      </AnalyticsCard>

      <UserFormDialog target={formTarget} onOpenChange={(open) => !open && setFormTarget(null)} />
      <ToggleUserDialog user={toggling} onOpenChange={(open) => !open && setToggling(null)} />
    </PageContainer>
  )
}
