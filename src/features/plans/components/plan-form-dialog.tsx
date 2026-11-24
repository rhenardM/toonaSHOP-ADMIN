"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { useFieldArray, useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AppButton } from "@/components/shared/app-button"
import { Field, FormAlert, inputClass, textareaClass } from "@/components/shared/form-controls"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/api/errors"
import { DEFAULT_CURRENCY } from "@/lib/constants/app"
import { cn } from "@/lib/utils"

import { usePlanMutations } from "../hooks/use-plans"
import { UNLIMITED } from "../lib/plan-format"
import type { Plan, PlanInput } from "../types/plan.types"

const amount = z.number({ error: "Montant requis." }).min(0, "Le montant ne peut pas être négatif.")
const limit = z
  .number({ error: "Valeur requise." })
  .int("Nombre entier attendu.")
  .min(UNLIMITED, "Utilisez −1 pour illimité.")

const planSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis.").max(80, "80 caractères maximum."),
  code: z
    .string()
    .trim()
    .min(1, "Le code est requis.")
    .max(40, "40 caractères maximum.")
    .regex(/^[A-Za-z0-9_-]+$/, "Lettres, chiffres, tirets et underscores uniquement."),
  description: z.string().trim().max(500, "500 caractères maximum."),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, "Code ISO à 3 lettres (ex. USD)."),
  monthlyPrice: amount,
  semesterPrice: amount,
  annualPrice: amount,
  maxUsers: limit,
  maxPointOfSales: limit,
  maxWarehouses: limit,
  maxLocations: limit,
  features: z.array(z.object({ value: z.string().trim().max(160, "160 caractères maximum.") })),
  isActive: z.boolean(),
})
type PlanFormInput = z.input<typeof planSchema>
type PlanFormValues = z.output<typeof planSchema>
type NumericField = "monthlyPrice" | "semesterPrice" | "annualPrice" | "maxUsers" | "maxPointOfSales" | "maxWarehouses" | "maxLocations"

const EMPTY_VALUES: PlanFormInput = {
  name: "",
  code: "",
  description: "",
  currency: DEFAULT_CURRENCY,
  monthlyPrice: 0,
  semesterPrice: 0,
  annualPrice: 0,
  maxUsers: 0,
  maxPointOfSales: 0,
  maxWarehouses: 0,
  maxLocations: 0,
  features: [{ value: "" }],
  isActive: true,
}

function toFormValues(plan: Plan): PlanFormInput {
  return {
    name: plan.name,
    code: plan.code,
    description: plan.description,
    currency: plan.currency,
    monthlyPrice: plan.monthlyPrice,
    semesterPrice: plan.semesterPrice,
    annualPrice: plan.annualPrice,
    maxUsers: plan.maxUsers,
    maxPointOfSales: plan.maxPointOfSales,
    maxWarehouses: plan.maxWarehouses,
    maxLocations: plan.maxLocations,
    features: plan.features.length > 0 ? plan.features.map((value) => ({ value })) : [{ value: "" }],
    isActive: plan.isActive,
  }
}

function toInput(values: PlanFormValues): PlanInput {
  return { ...values, features: values.features.map((f) => f.value).filter(Boolean) }
}

/** `null` closes the dialog; `{}` creates a plan; `{ plan }` edits it. */
export type PlanEditorTarget = { plan?: Plan } | null

export function PlanFormDialog({ target, onOpenChange }: { target: PlanEditorTarget; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {target ? <PlanForm key={target.plan?.id ?? "new"} plan={target.plan} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function PlanForm({ plan, onDone }: { plan?: Plan; onDone: () => void }) {
  const { create, update } = usePlanMutations()
  const mutation = plan ? update : create

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormInput, unknown, PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? toFormValues(plan) : EMPTY_VALUES,
  })
  const features = useFieldArray({ control, name: "features" })
  const currency = useWatch({ control, name: "currency" })

  const onSubmit = handleSubmit((values) => {
    const input = toInput(values)
    const onSuccess = () => {
      toast.success(plan ? "Plan mis à jour" : "Plan créé", { description: input.name })
      onDone()
    }
    if (plan) update.mutate({ id: plan.id, input }, { onSuccess })
    else create.mutate(input, { onSuccess })
  })

  const numberProps = (name: NumericField) => register(name, { valueAsNumber: true })

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="px-6 pt-6 pb-4">
        <DialogTitle className="text-lg font-extrabold text-ink">{plan ? `Modifier le plan ${plan.name}` : "Nouveau plan"}</DialogTitle>
        <DialogDescription>Tarifs, limites et fonctionnalités proposés aux entreprises clientes.</DialogDescription>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6">
        {mutation.isError ? <FormAlert>{getErrorMessage(mutation.error)}</FormAlert> : null}

        <FormSection title="Identité">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="plan-name" label="Nom" error={errors.name?.message}>
              <input id="plan-name" className={inputClass} aria-invalid={!!errors.name} placeholder="Pro" {...register("name")} />
            </Field>
            <Field id="plan-code" label="Code" error={errors.code?.message}>
              <input
                id="plan-code"
                className={cn(inputClass, "font-mono")}
                aria-invalid={!!errors.code}
                placeholder="PRO"
                autoCapitalize="characters"
                {...register("code")}
              />
            </Field>
          </div>
          <Field id="plan-description" label="Description" error={errors.description?.message}>
            <textarea
              id="plan-description"
              rows={3}
              className={cn(textareaClass, "min-h-[84px]")}
              aria-invalid={!!errors.description}
              placeholder="À qui s’adresse ce plan ?"
              {...register("description")}
            />
          </Field>
        </FormSection>

        <FormSection title="Tarification">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field id="plan-currency" label="Devise" error={errors.currency?.message}>
              <input
                id="plan-currency"
                className={cn(inputClass, "uppercase")}
                aria-invalid={!!errors.currency}
                maxLength={3}
                autoCapitalize="characters"
                {...register("currency", { setValueAs: (value: string) => value.toUpperCase() })}
              />
            </Field>
            <PriceField id="plan-monthly" label="Mensuel" currency={currency} error={errors.monthlyPrice?.message} registration={numberProps("monthlyPrice")} />
            <PriceField id="plan-semester" label="Semestriel" currency={currency} error={errors.semesterPrice?.message} registration={numberProps("semesterPrice")} />
            <PriceField id="plan-annual" label="Annuel" currency={currency} error={errors.annualPrice?.message} registration={numberProps("annualPrice")} />
          </div>
        </FormSection>

        <FormSection title="Limites" hint="Saisissez −1 pour une limite illimitée.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <LimitField id="plan-users" label="Utilisateurs" error={errors.maxUsers?.message} registration={numberProps("maxUsers")} />
            <LimitField id="plan-pos" label="Points de vente" error={errors.maxPointOfSales?.message} registration={numberProps("maxPointOfSales")} />
            <LimitField id="plan-warehouses" label="Entrepôts" error={errors.maxWarehouses?.message} registration={numberProps("maxWarehouses")} />
            <LimitField id="plan-locations" label="Emplacements" error={errors.maxLocations?.message} registration={numberProps("maxLocations")} />
          </div>
        </FormSection>

        <FormSection title="Fonctionnalités" hint="Une ligne par fonctionnalité ; les lignes vides sont ignorées.">
          <ul className="flex flex-col gap-2">
            {features.fields.map((item, index) => {
              const error = errors.features?.[index]?.value?.message
              return (
                <li key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      className={cn(inputClass, "h-10")}
                      aria-label={`Fonctionnalité ${index + 1}`}
                      aria-invalid={!!error}
                      placeholder="Ex. Rapports avancés"
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return
                        event.preventDefault()
                        features.insert(index + 1, { value: "" })
                      }}
                      {...register(`features.${index}.value`)}
                    />
                    <AppButton
                      size="icon"
                      variant="ghost"
                      aria-label={`Retirer la fonctionnalité ${index + 1}`}
                      onClick={() => features.remove(index)}
                      icon={<Trash2 aria-hidden="true" />}
                    />
                  </div>
                  {error ? <p className="text-[12.5px] text-danger">{error}</p> : null}
                </li>
              )
            })}
          </ul>
          <AppButton size="sm" variant="brandOutline" className="w-fit" icon={<Plus aria-hidden="true" />} onClick={() => features.append({ value: "" })}>
            Ajouter une fonctionnalité
          </AppButton>
        </FormSection>

        <label className="flex items-start gap-3 rounded-xl border border-divider bg-surface-subtle p-3.5">
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-brand" {...register("isActive")} />
          <span>
            <span className="block text-[13.5px] font-semibold text-ink">Plan actif</span>
            <span className="block text-[12.5px] text-muted-foreground">Un plan actif peut être choisi lors d’une souscription ou d’une prolongation.</span>
          </span>
        </label>
      </div>

      <DialogFooter className="m-0 rounded-b-xl border-t bg-surface-subtle px-6 py-4">
        <AppButton onClick={onDone} disabled={mutation.isPending}>
          Annuler
        </AppButton>
        <AppButton type="submit" variant="primary" pending={mutation.isPending}>
          {plan ? "Enregistrer" : "Créer le plan"}
        </AppButton>
      </DialogFooter>
    </form>
  )
}

function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 text-[12px] font-bold tracking-[0.06em] text-muted-foreground uppercase">{title}</legend>
      {hint ? <p className="-mt-2 text-[12.5px] text-muted-foreground">{hint}</p> : null}
      {children}
    </fieldset>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  error?: string
  registration: UseFormRegisterReturn
}

function PriceField({ currency, ...props }: NumberFieldProps & { currency: string }) {
  return (
    <Field id={props.id} label={props.label} error={props.error}>
      <div className="relative">
        <input
          id={props.id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          className={cn(inputClass, "pr-12 tabular-nums")}
          aria-invalid={!!props.error}
          {...props.registration}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[12px] font-semibold text-muted-foreground uppercase">
          {currency}
        </span>
      </div>
    </Field>
  )
}

function LimitField(props: NumberFieldProps) {
  return (
    <Field id={props.id} label={props.label} error={props.error}>
      <input
        id={props.id}
        type="number"
        inputMode="numeric"
        min={UNLIMITED}
        step={1}
        className={cn(inputClass, "tabular-nums")}
        aria-invalid={!!props.error}
        {...props.registration}
      />
    </Field>
  )
}
