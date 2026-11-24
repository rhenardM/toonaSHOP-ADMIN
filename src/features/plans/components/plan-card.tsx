"use client"

import { Check, MapPin, MoreHorizontal, Pencil, PowerOff, Store, Users, Warehouse, type LucideIcon } from "lucide-react"

import { StatusPill } from "@/components/shared/status-pill"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, formatCurrency } from "@/lib/utils"

import { formatLimit, periodSaving } from "../lib/plan-format"
import type { Plan } from "../types/plan.types"

interface PlanCardProps {
  plan: Plan
  onEdit: (plan: Plan) => void
  onDeactivate: (plan: Plan) => void
}

export function PlanCard({ plan, onEdit, onDeactivate }: PlanCardProps) {
  const titleId = `plan-${plan.id}-title`
  const limits: { icon: LucideIcon; label: string; value: number }[] = [
    { icon: Users, label: "Utilisateurs", value: plan.maxUsers },
    { icon: Store, label: "Points de vente", value: plan.maxPointOfSales },
    { icon: Warehouse, label: "Entrepôts", value: plan.maxWarehouses },
    { icon: MapPin, label: "Emplacements", value: plan.maxLocations },
  ]

  return (
    <article
      aria-labelledby={titleId}
      className={cn("flex min-w-0 flex-col rounded-2xl border bg-card", !plan.isActive && "border-dashed bg-surface-subtle")}
    >
      <header className="flex items-start gap-3 p-5 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={titleId} className="truncate text-[17px] leading-snug font-extrabold text-ink">
              {plan.name}
            </h3>
            <StatusPill tone={plan.isActive ? "success" : "neutral"}>{plan.isActive ? "Actif" : "Désactivé"}</StatusPill>
          </div>
          <p className="mt-1 font-mono text-[12px] text-muted-foreground">{plan.code}</p>
        </div>
        <PlanActionsMenu plan={plan} onEdit={onEdit} onDeactivate={onDeactivate} />
      </header>

      <div className="flex flex-1 flex-col gap-5 px-5 pb-5">
        {plan.description ? <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-soft">{plan.description}</p> : null}

        <div className="rounded-xl bg-brand-soft/60 p-4">
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-[26px] leading-none font-extrabold tracking-[-0.02em] text-ink tabular-nums">
              {formatCurrency(plan.monthlyPrice, plan.currency)}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">/ mois</span>
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-brand/15 pt-3">
            <PeriodPrice label="Semestre" price={plan.semesterPrice} currency={plan.currency} saving={periodSaving(plan.semesterPrice, plan.monthlyPrice, 6)} />
            <PeriodPrice label="Année" price={plan.annualPrice} currency={plan.currency} saving={periodSaving(plan.annualPrice, plan.monthlyPrice, 12)} />
          </dl>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-3">
          {limits.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-ink-soft">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="truncate text-[11.5px] text-muted-foreground">{label}</dt>
                <dd className="text-[13.5px] font-bold text-ink tabular-nums">{formatLimit(value)}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="border-t border-divider pt-4">
          <p className="text-[12px] font-bold tracking-[0.06em] text-muted-foreground uppercase">Fonctionnalités</p>
          {plan.features.length > 0 ? (
            <ul className="mt-2.5 flex flex-col gap-2">
              {plan.features.map((feature, index) => (
                <li key={`${index}-${feature}`} className="flex items-start gap-2 text-[13px] text-ink-soft">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="min-w-0 break-words">{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">Aucune fonctionnalité renseignée.</p>
          )}
        </div>
      </div>
    </article>
  )
}

function PeriodPrice({ label, price, currency, saving }: { label: string; price: number; currency: string; saving: number | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11.5px] font-semibold text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="text-[14px] font-bold text-ink tabular-nums">{formatCurrency(price, currency)}</span>
        {saving ? <span className="text-[11.5px] font-bold text-success">−{saving} %</span> : null}
      </dd>
    </div>
  )
}

function PlanActionsMenu({ plan, onEdit, onDeactivate }: PlanCardProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions pour le plan ${plan.name}`}
        className="-mt-1 -mr-1.5 flex size-9 shrink-0 items-center justify-center rounded-[9px] text-ink-soft outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-hover"
      >
        <MoreHorizontal className="size-[18px]" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5">
        <DropdownMenuItem onClick={() => onEdit(plan)} className="gap-2 px-2 py-2">
          <Pencil aria-hidden="true" />
          Modifier
        </DropdownMenuItem>
        {plan.isActive ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDeactivate(plan)} className="gap-2 px-2 py-2">
              <PowerOff aria-hidden="true" />
              Désactiver le plan
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
