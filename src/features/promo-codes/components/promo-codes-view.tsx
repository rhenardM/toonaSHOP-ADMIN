"use client"

import { Check, Copy, MoreHorizontal, Pencil, Plus, PowerOff, TicketPercent } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { FilterSelect } from "@/components/shared/filter-select"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { SearchInput } from "@/components/shared/search-input"
import { StatusPill } from "@/components/shared/status-pill"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePlans } from "@/features/plans/hooks/use-plans"
import type { Plan } from "@/features/plans/types/plan.types"
import { cn, formatDate, formatNumber } from "@/lib/utils"

import { usePromoCodes } from "../hooks/use-promo-codes"
import { formatDiscount, getPromoCodeStatus, promoStatusMeta } from "../lib/promo-code-status"
import type { PromoCode, PromoCodeStatus } from "../types/promo-code.types"
import { DeactivatePromoCodeDialog } from "./deactivate-promo-code-dialog"
import { type PromoEditorTarget, PromoCodeFormDialog } from "./promo-code-form-dialog"

type StatusFilter = "all" | PromoCodeStatus

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "Actifs" },
  { value: "expired", label: "Expirés" },
  { value: "exhausted", label: "Épuisés" },
  { value: "inactive", label: "Inactifs" },
] as const satisfies readonly { value: StatusFilter; label: string }[]

/** Server-side `isActive` param for a status filter; the exact status is then refined client-side. */
function isActiveParam(filter: StatusFilter): boolean | undefined {
  if (filter === "all") return undefined
  return filter !== "inactive"
}

interface PromoRow {
  promo: PromoCode
  status: PromoCodeStatus
}

export function PromoCodesView() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [editor, setEditor] = useState<PromoEditorTarget>(null)
  const [deactivating, setDeactivating] = useState<PromoCode | null>(null)

  const promos = usePromoCodes(isActiveParam(statusFilter))
  const plans = usePlans(true)
  const plansById = new Map((plans.data ?? []).map((plan) => [plan.id, plan]))

  const term = search.trim().toLowerCase()
  // Statuses depend on the current time: only computed once data exists (never during prerender).
  const rows: PromoRow[] | undefined = promos.data
    ?.map((promo) => ({ promo, status: getPromoCodeStatus(promo) }))
    .filter(({ promo, status }) => {
      if (statusFilter !== "all" && status !== statusFilter) return false
      return !term || promo.code.toLowerCase().includes(term) || promo.description.toLowerCase().includes(term)
    })
  const filtered = term !== "" || statusFilter !== "all"

  const actions = (row: PromoRow) => (
    <PromoActionsMenu promo={row.promo} onEdit={(promo) => setEditor({ promo })} onDeactivate={setDeactivating} />
  )

  const columns: DataColumn<PromoRow>[] = [
    {
      id: "code",
      header: "Code",
      cell: ({ promo }) => (
        <span className="flex items-center gap-1">
          <span className="font-mono text-[13px] font-bold tracking-wide text-ink">{promo.code}</span>
          <CopyCodeButton code={promo.code} />
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: ({ promo }) => <span className="line-clamp-2 max-w-[240px] text-ink-soft">{promo.description || "—"}</span>,
      className: "hidden xl:table-cell",
    },
    {
      id: "discount",
      header: "Remise",
      align: "right",
      cell: ({ promo }) => <span className="font-bold whitespace-nowrap text-ink tabular-nums">{formatDiscount(promo, plansById)}</span>,
    },
    { id: "usage", header: "Utilisation", cell: ({ promo }) => <UsageMeter promo={promo} /> },
    { id: "plans", header: "Plans autorisés", cell: ({ promo }) => <AllowedPlans ids={promo.allowedPlanTypes} plansById={plansById} /> },
    { id: "validity", header: "Validité", cell: ({ promo }) => <Validity promo={promo} /> },
    {
      id: "status",
      header: "Statut",
      cell: ({ status }) => <StatusPill tone={promoStatusMeta[status].tone}>{promoStatusMeta[status].label}</StatusPill>,
    },
    { id: "actions", header: "", align: "right", className: "w-12", cell: actions },
  ]

  return (
    <PageContainer>
      <PageIntro
        description="Codes de réduction appliqués aux abonnements : remise, quotas d’utilisation, plans concernés et période de validité."
        actions={
          <AppButton variant="primary" icon={<Plus aria-hidden="true" />} onClick={() => setEditor({})}>
            Nouveau code promo
          </AppButton>
        }
      />

      <AnalyticsCard
        id="promo-codes-list"
        title="Codes promo"
        description={
          rows ? `${formatNumber(rows.length)} code${rows.length > 1 ? "s" : ""}${filtered ? " correspondant aux filtres" : ""}` : "Chargement…"
        }
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Code, description…" label="Rechercher un code promo" className="w-full sm:w-[240px]" />
            <FilterSelect label="Filtrer par statut" value={statusFilter} options={STATUS_OPTIONS} onValueChange={setStatusFilter} className="w-full sm:w-auto" />
          </div>
        }
        className="gap-4"
      >
        <DataTable
          caption="Liste des codes promo"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.promo.id}
          isLoading={promos.isPending}
          isRefreshing={promos.isPlaceholderData}
          error={promos.error}
          onRetry={() => promos.refetch()}
          minWidth={900}
          empty={{
            icon: TicketPercent,
            title: filtered ? "Aucun résultat" : "Aucun code promo",
            description: filtered ? "Modifiez la recherche ou le filtre de statut." : "Créez un premier code pour proposer une remise sur les abonnements.",
          }}
          renderMobileCard={(row) => {
            const { promo, status } = row
            return (
              <div className="flex flex-col gap-3 rounded-xl border border-divider p-3.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="flex items-center gap-1">
                      <span className="truncate font-mono text-[14px] font-bold tracking-wide text-ink">{promo.code}</span>
                      <CopyCodeButton code={promo.code} />
                    </span>
                    {promo.description ? <p className="line-clamp-2 text-[12.5px] text-muted-foreground">{promo.description}</p> : null}
                  </div>
                  <StatusPill tone={promoStatusMeta[status].tone}>{promoStatusMeta[status].label}</StatusPill>
                  {actions(row)}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <span className="text-[15px] font-extrabold text-ink tabular-nums">{formatDiscount(promo, plansById)}</span>
                  <Validity promo={promo} />
                </div>
                <UsageMeter promo={promo} />
                <AllowedPlans ids={promo.allowedPlanTypes} plansById={plansById} />
              </div>
            )
          }}
        />
      </AnalyticsCard>

      <PromoCodeFormDialog target={editor} onOpenChange={(open) => !open && setEditor(null)} />
      <DeactivatePromoCodeDialog promo={deactivating} onOpenChange={(open) => !open && setDeactivating(null)} />
    </PageContainer>
  )
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Code copié", { description: code })
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Copie impossible", { description: "Le presse-papiers n’est pas accessible depuis ce navigateur." })
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copier le code ${code}`}
      title="Copier le code"
      className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
    </button>
  )
}

function UsageMeter({ promo }: { promo: PromoCode }) {
  const unlimited = promo.maxUsageCount === 0
  const ratio = unlimited ? 0 : Math.min(promo.usageCount / promo.maxUsageCount, 1)
  return (
    <div className="flex min-w-[120px] flex-col gap-1.5">
      <span className="text-[12.5px] text-ink-soft tabular-nums">
        <span className="font-bold text-ink">{formatNumber(promo.usageCount)}</span>
        {unlimited ? " · illimité" : ` / ${formatNumber(promo.maxUsageCount)}`}
      </span>
      {unlimited ? null : (
        <div
          role="progressbar"
          aria-label={`Utilisations du code ${promo.code}`}
          aria-valuemin={0}
          aria-valuemax={promo.maxUsageCount}
          aria-valuenow={Math.min(promo.usageCount, promo.maxUsageCount)}
          className="h-1.5 w-full overflow-hidden rounded-full bg-track"
        >
          <div
            className={cn("h-full rounded-full", ratio >= 1 ? "bg-warning" : ratio >= 0.8 ? "bg-orange" : "bg-brand")}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

function AllowedPlans({ ids, plansById }: { ids: number[]; plansById: Map<number, Plan> }) {
  if (ids.length === 0) return <span className="text-[12.5px] text-muted-foreground">Tous les plans</span>
  return (
    <span className="flex max-w-[240px] flex-wrap gap-1">
      {ids.map((id) => (
        <span key={id} className="rounded-md bg-secondary px-1.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap text-ink-soft">
          {plansById.get(id)?.name ?? `Plan #${id}`}
        </span>
      ))}
    </span>
  )
}

function Validity({ promo }: { promo: PromoCode }) {
  return (
    <span className="text-[12.5px] whitespace-nowrap text-ink-soft tabular-nums">
      {promo.validFrom ? formatDate(promo.validFrom) : "—"} → {promo.validUntil ? formatDate(promo.validUntil) : "—"}
    </span>
  )
}

interface PromoActionsMenuProps {
  promo: PromoCode
  onEdit: (promo: PromoCode) => void
  onDeactivate: (promo: PromoCode) => void
}

function PromoActionsMenu({ promo, onEdit, onDeactivate }: PromoActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions pour le code ${promo.code}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-[9px] text-ink-soft outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-hover"
      >
        <MoreHorizontal className="size-[18px]" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5">
        <DropdownMenuItem onClick={() => onEdit(promo)} className="gap-2 px-2 py-2">
          <Pencil aria-hidden="true" />
          Modifier
        </DropdownMenuItem>
        {promo.isActive ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDeactivate(promo)} className="gap-2 px-2 py-2">
              <PowerOff aria-hidden="true" />
              Désactiver le code
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
