"use client"

import { Layers, Plus } from "lucide-react"
import { useState } from "react"

import { AppButton } from "@/components/shared/app-button"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatNumber } from "@/lib/utils"

import { usePlans } from "../hooks/use-plans"
import type { Plan } from "../types/plan.types"
import { DeactivatePlanDialog } from "./deactivate-plan-dialog"
import { PlanCard } from "./plan-card"
import { type PlanEditorTarget, PlanFormDialog } from "./plan-form-dialog"

/** Active plans first, then by monthly price. */
function sortPlans(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.monthlyPrice - b.monthlyPrice)
}

export function PlansView() {
  const [includeInactive, setIncludeInactive] = useState(false)
  const [editor, setEditor] = useState<PlanEditorTarget>(null)
  const [deactivating, setDeactivating] = useState<Plan | null>(null)
  const plans = usePlans(includeInactive)
  const items = plans.data ? sortPlans(plans.data) : undefined
  const activeCount = items?.filter((p) => p.isActive).length ?? 0

  return (
    <PageContainer>
      <PageIntro
        description="Offres d’abonnement proposées aux entreprises : tarifs par période, limites et fonctionnalités incluses."
        actions={
          <AppButton variant="primary" icon={<Plus aria-hidden="true" />} onClick={() => setEditor({})}>
            Nouveau plan
          </AppButton>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          {items
            ? `${formatNumber(activeCount)} plan${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}${
                includeInactive ? ` · ${formatNumber(items.length - activeCount)} désactivé${items.length - activeCount > 1 ? "s" : ""}` : ""
              }`
            : "Chargement…"}
        </p>
        <SwitchField label="Afficher les plans désactivés" checked={includeInactive} onCheckedChange={setIncludeInactive} />
      </div>

      {plans.isError && !items ? (
        <ErrorState error={plans.error} onRetry={() => plans.refetch()} retrying={plans.isFetching} />
      ) : !items ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[480px] rounded-2xl bg-card" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Aucun plan"
          description={includeInactive ? "Aucun plan n’a encore été créé." : "Aucun plan actif. Affichez les plans désactivés ou créez-en un."}
          action={
            <AppButton variant="primary" icon={<Plus aria-hidden="true" />} onClick={() => setEditor({})}>
              Nouveau plan
            </AppButton>
          }
          className="rounded-2xl border bg-card py-14"
        />
      ) : (
        <div
          className={cn("grid items-start gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3", plans.isPlaceholderData && "opacity-60")}
          aria-busy={plans.isPlaceholderData}
        >
          {items.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onEdit={(p) => setEditor({ plan: p })} onDeactivate={setDeactivating} />
          ))}
        </div>
      )}

      <PlanFormDialog target={editor} onOpenChange={(open) => !open && setEditor(null)} />
      <DeactivatePlanDialog plan={deactivating} onOpenChange={(open) => !open && setDeactivating(null)} />
    </PageContainer>
  )
}

function SwitchField({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="group inline-flex items-center gap-2.5 rounded-[10px] px-1 py-1 text-[13px] font-semibold text-ink-soft outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-track group-hover:bg-axis"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-4"
          )}
        />
      </span>
      {label}
    </button>
  )
}
