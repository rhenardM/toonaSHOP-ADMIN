"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AppButton } from "@/components/shared/app-button"
import { FilterSelect } from "@/components/shared/filter-select"
import { FormAlert } from "@/components/shared/form-controls"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePlans } from "@/features/plans/hooks/use-plans"
import { getErrorMessage } from "@/lib/api/errors"
import { formatDate } from "@/lib/utils"

import { useCompanyMutations } from "../hooks/use-companies"
import type { Company } from "../types/company.types"

const MONTH_OPTIONS = [
  { value: "1", label: "1 mois" },
  { value: "3", label: "3 mois" },
  { value: "6", label: "6 mois" },
  { value: "12", label: "12 mois" },
] as const

const extendSchema = z.object({
  months: z.enum(["1", "3", "6", "12"]),
  plan: z.string().min(1, "Choisissez un plan."),
})
type ExtendValues = z.infer<typeof extendSchema>

interface ExtendSubscriptionDialogProps {
  company: Pick<Company, "id" | "name" | "planName" | "subscriptionEnd"> | null
  onOpenChange: (open: boolean) => void
}

export function ExtendSubscriptionDialog({ company, onOpenChange }: ExtendSubscriptionDialogProps) {
  return (
    <Dialog open={company !== null} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        {company ? <ExtendForm key={company.id} company={company} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ExtendForm({ company, onDone }: { company: NonNullable<ExtendSubscriptionDialogProps["company"]>; onDone: () => void }) {
  const plans = usePlans()
  const { extend } = useCompanyMutations()
  const activePlans = (plans.data ?? []).filter((p) => p.isActive)
  const currentPlan = activePlans.find((p) => p.name.toLowerCase() === company.planName?.toLowerCase())

  const { control, handleSubmit } = useForm<ExtendValues>({
    resolver: zodResolver(extendSchema),
    values: { months: "1", plan: currentPlan?.code ?? activePlans[0]?.code ?? "" },
    resetOptions: { keepDirtyValues: true },
  })

  const onSubmit = handleSubmit((values) => {
    extend.mutate(
      { companyId: company.id, months: Number(values.months), plan: values.plan },
      {
        onSuccess: () => {
          toast.success(`Abonnement prolongé de ${values.months} mois`, { description: company.name })
          onDone()
        },
      }
    )
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="text-lg font-extrabold text-ink">Prolonger l’abonnement</DialogTitle>
        <DialogDescription>
          {company.name}
          {company.planName ? ` · Plan ${company.planName}` : ""}
          {company.subscriptionEnd ? `, expire le ${formatDate(company.subscriptionEnd)}` : ""}.
        </DialogDescription>
      </DialogHeader>

      {extend.isError ? <FormAlert>{getErrorMessage(extend.error)}</FormAlert> : null}

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-ink-soft">Durée</span>
        <Controller
          control={control}
          name="months"
          render={({ field }) => (
            <SegmentedControl label="Durée de prolongation" options={MONTH_OPTIONS} value={field.value} onValueChange={field.onChange} className="w-fit" />
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="extend-plan" className="text-[13px] font-semibold text-ink-soft">
          Plan
        </label>
        {plans.isPending ? (
          <Skeleton className="h-10 w-full bg-track" />
        ) : plans.isError ? (
          <FormAlert>Impossible de charger les plans : {getErrorMessage(plans.error)}</FormAlert>
        ) : (
          <Controller
            control={control}
            name="plan"
            render={({ field, fieldState }) => (
              <>
                <FilterSelect
                  id="extend-plan"
                  label="Plan"
                  value={field.value}
                  options={activePlans.map((p) => ({ value: p.code, label: p.name }))}
                  onValueChange={field.onChange}
                  className="w-full font-medium"
                />
                {fieldState.error ? <p className="text-[12.5px] text-danger">{fieldState.error.message}</p> : null}
              </>
            )}
          />
        )}
      </div>

      <DialogFooter className="-mx-6 -mb-6 rounded-b-xl border-t bg-surface-subtle px-6 py-4">
        <AppButton onClick={onDone} disabled={extend.isPending}>
          Annuler
        </AppButton>
        <AppButton type="submit" variant="primary" pending={extend.isPending} disabled={plans.isPending || activePlans.length === 0}>
          Confirmer la prolongation
        </AppButton>
      </DialogFooter>
    </form>
  )
}
