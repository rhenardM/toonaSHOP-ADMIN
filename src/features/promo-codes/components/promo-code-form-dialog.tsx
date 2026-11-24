"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { endOfDay, format, parseISO, startOfDay } from "date-fns"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AppButton } from "@/components/shared/app-button"
import { Field, FormAlert, inputClass, textareaClass } from "@/components/shared/form-controls"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlans } from "@/features/plans/hooks/use-plans"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { usePromoCodeMutations } from "../hooks/use-promo-codes"
import type { DiscountType, PromoCode, PromoCodeInput } from "../types/promo-code.types"

const DISCOUNT_OPTIONS = [
  { value: "percentage", label: "Pourcentage" },
  { value: "fixed", label: "Montant fixe" },
] as const satisfies readonly { value: DiscountType; label: string }[]

const promoSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "3 caractères minimum.")
      .max(30, "30 caractères maximum.")
      .regex(/^[A-Z0-9]+$/, "Lettres majuscules et chiffres uniquement, sans espace."),
    description: z.string().trim().max(300, "300 caractères maximum."),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number({ error: "Valeur requise." }).positive("La remise doit être supérieure à 0."),
    maxUsageCount: z.number({ error: "Valeur requise." }).int("Nombre entier attendu.").min(0, "0 minimum (illimité)."),
    allowedPlanTypes: z.array(z.number()),
    validFrom: z.string().min(1, "Date de début requise."),
    validUntil: z.string().min(1, "Date de fin requise."),
    isActive: z.boolean(),
  })
  .refine((v) => v.discountType !== "percentage" || v.discountValue <= 100, {
    path: ["discountValue"],
    message: "Un pourcentage ne peut pas dépasser 100.",
  })
  .refine((v) => !v.validFrom || !v.validUntil || v.validUntil > v.validFrom, {
    path: ["validUntil"],
    message: "La date de fin doit être postérieure à la date de début.",
  })
type PromoFormInput = z.input<typeof promoSchema>
type PromoFormValues = z.output<typeof promoSchema>

const EMPTY_VALUES: PromoFormInput = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  maxUsageCount: 0,
  allowedPlanTypes: [],
  validFrom: "",
  validUntil: "",
  isActive: true,
}

/** ISO date-time → value of an `<input type="date">` (local day). */
function toDateInput(iso: string | null): string {
  return iso ? format(parseISO(iso), "yyyy-MM-dd") : ""
}

function toFormValues(promo: PromoCode): PromoFormInput {
  return {
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    maxUsageCount: promo.maxUsageCount,
    allowedPlanTypes: promo.allowedPlanTypes,
    validFrom: toDateInput(promo.validFrom),
    validUntil: toDateInput(promo.validUntil),
    isActive: promo.isActive,
  }
}

/** The code is valid from the start of its first day to the end of its last day (local time). */
function toInput(values: PromoFormValues): PromoCodeInput {
  return {
    ...values,
    validFrom: startOfDay(parseISO(values.validFrom)).toISOString(),
    validUntil: endOfDay(parseISO(values.validUntil)).toISOString(),
  }
}

/** `null` closes the dialog; `{}` creates a code; `{ promo }` edits it. */
export type PromoEditorTarget = { promo?: PromoCode } | null

export function PromoCodeFormDialog({ target, onOpenChange }: { target: PromoEditorTarget; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {target ? <PromoCodeForm key={target.promo?.id ?? "new"} promo={target.promo} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function PromoCodeForm({ promo, onDone }: { promo?: PromoCode; onDone: () => void }) {
  const plans = usePlans(true)
  const { create, update } = usePromoCodeMutations()
  const mutation = promo ? update : create

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PromoFormInput, unknown, PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: promo ? toFormValues(promo) : EMPTY_VALUES,
  })
  const discountType = useWatch({ control, name: "discountType" })

  const onSubmit = handleSubmit((values) => {
    const input = toInput(values)
    const onSuccess = () => {
      toast.success(promo ? "Code promo mis à jour" : "Code promo créé", { description: input.code })
      onDone()
    }
    if (promo) update.mutate({ id: promo.id, input }, { onSuccess })
    else create.mutate(input, { onSuccess })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="px-6 pt-6 pb-4">
        <DialogTitle className="text-lg font-extrabold text-ink">{promo ? `Modifier ${promo.code}` : "Nouveau code promo"}</DialogTitle>
        <DialogDescription>Remise appliquée lors de la souscription d’un abonnement.</DialogDescription>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
        {mutation.isError ? <FormAlert>{getErrorMessage(mutation.error)}</FormAlert> : null}

        <Field id="promo-code" label="Code" error={errors.code?.message}>
          <input
            id="promo-code"
            className={cn(inputClass, "font-mono tracking-wider uppercase")}
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? "promo-code-error" : undefined}
            placeholder="BIENVENUE2026"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            {...register("code", { setValueAs: (value: string) => value.toUpperCase() })}
          />
        </Field>

        <Field id="promo-description" label="Description" error={errors.description?.message}>
          <textarea
            id="promo-description"
            rows={2}
            className={cn(textareaClass, "min-h-[72px]")}
            aria-invalid={!!errors.description}
            placeholder="Offre de lancement pour les nouvelles entreprises"
            {...register("description")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-soft">Type de remise</span>
            <Controller
              control={control}
              name="discountType"
              render={({ field }) => (
                <SegmentedControl label="Type de remise" options={DISCOUNT_OPTIONS} value={field.value} onValueChange={field.onChange} className="h-11 w-fit items-center" />
              )}
            />
          </div>
          <Field id="promo-value" label={discountType === "percentage" ? "Remise (%)" : "Montant de la remise"} error={errors.discountValue?.message}>
            <input
              id="promo-value"
              type="number"
              inputMode="decimal"
              min={0}
              max={discountType === "percentage" ? 100 : undefined}
              step="any"
              className={cn(inputClass, "tabular-nums")}
              aria-invalid={!!errors.discountValue}
              {...register("discountValue", { valueAsNumber: true })}
            />
          </Field>
        </div>

        <Field id="promo-max-usage" label="Utilisations maximum" error={errors.maxUsageCount?.message}>
          <input
            id="promo-max-usage"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            className={cn(inputClass, "tabular-nums sm:max-w-[200px]")}
            aria-invalid={!!errors.maxUsageCount}
            aria-describedby="promo-max-usage-hint"
            {...register("maxUsageCount", { valueAsNumber: true })}
          />
          <p id="promo-max-usage-hint" className="text-[12.5px] text-muted-foreground">
            0 = utilisations illimitées.
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="promo-from" label="Valable du" error={errors.validFrom?.message}>
            <input id="promo-from" type="date" className={inputClass} aria-invalid={!!errors.validFrom} {...register("validFrom")} />
          </Field>
          <Field id="promo-until" label="Jusqu’au (inclus)" error={errors.validUntil?.message}>
            <input id="promo-until" type="date" className={inputClass} aria-invalid={!!errors.validUntil} {...register("validUntil")} />
          </Field>
        </div>

        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="mb-1.5 text-[13px] font-semibold text-ink-soft">Plans autorisés</legend>
          <p className="-mt-1 text-[12.5px] text-muted-foreground">Aucun plan coché = valable pour tous les plans.</p>
          {plans.isPending ? (
            <Skeleton className="h-20 w-full bg-track" />
          ) : plans.isError ? (
            <FormAlert>Impossible de charger les plans : {getErrorMessage(plans.error)}</FormAlert>
          ) : (
            <Controller
              control={control}
              name="allowedPlanTypes"
              render={({ field }) => {
                const selected = new Set(field.value)
                // Inactive plans stay listed only if the code already targets them.
                const options = plans.data.filter((plan) => plan.isActive || selected.has(plan.id))
                return options.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">Aucun plan actif.</p>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {options.map((plan) => (
                      <li key={plan.id}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-input bg-white px-3 py-2.5 has-checked:border-brand has-checked:bg-brand-soft/60">
                          <input
                            type="checkbox"
                            className="size-4 shrink-0 accent-brand"
                            checked={selected.has(plan.id)}
                            onChange={(event) =>
                              field.onChange(event.target.checked ? [...field.value, plan.id] : field.value.filter((id) => id !== plan.id))
                            }
                          />
                          <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">{plan.name}</span>
                          {!plan.isActive ? <span className="text-[11.5px] text-muted-foreground">désactivé</span> : null}
                        </label>
                      </li>
                    ))}
                  </ul>
                )
              }}
            />
          )}
        </fieldset>

        <label className="flex items-start gap-3 rounded-xl border border-divider bg-surface-subtle p-3.5">
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-brand" {...register("isActive")} />
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">Code actif</span>
            <span className="block text-[12.5px] text-muted-foreground">Un code inactif est refusé même pendant sa période de validité.</span>
          </span>
        </label>
      </div>

      <DialogFooter className="m-0 rounded-b-xl border-t bg-surface-subtle px-6 py-4">
        <AppButton onClick={onDone} disabled={mutation.isPending}>
          Annuler
        </AppButton>
        <AppButton type="submit" variant="primary" pending={mutation.isPending}>
          {promo ? "Enregistrer" : "Créer le code"}
        </AppButton>
      </DialogFooter>
    </form>
  )
}
