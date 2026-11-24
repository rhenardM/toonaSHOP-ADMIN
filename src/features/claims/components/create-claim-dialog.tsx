"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AppButton } from "@/components/shared/app-button"
import { Field, FormAlert, inputClass, textareaClass } from "@/components/shared/form-controls"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { useCreateClaim } from "../hooks/use-claims"
import { CLAIM_PRIORITIES, claimPriorityMeta } from "../lib/claim-meta"

const claimSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères.").max(150, "150 caractères maximum."),
  client: z.string().trim().min(2, "Indiquez le client concerné.").max(150, "150 caractères maximum."),
  priority: z.enum(["low", "medium", "high"]),
  description: z.string().trim().min(10, "Décrivez la réclamation (10 caractères minimum).").max(2000, "2 000 caractères maximum."),
})
type ClaimValues = z.infer<typeof claimSchema>

const PRIORITY_OPTIONS = CLAIM_PRIORITIES.map((value) => ({ value, label: claimPriorityMeta[value].label }))

export function CreateClaimDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        {open ? <CreateClaimForm onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function CreateClaimForm({ onDone }: { onDone: () => void }) {
  const create = useCreateClaim()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { title: "", client: "", priority: "medium", description: "" },
  })

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: () => {
        toast.success("Réclamation créée", { description: values.title })
        onDone()
      },
    })
  })

  const describedBy = (name: keyof ClaimValues) => (errors[name] ? `claim-${name}-error` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle className="text-lg font-extrabold text-ink">Nouvelle réclamation</DialogTitle>
        <DialogDescription>Enregistrez une réclamation remontée par un client.</DialogDescription>
      </DialogHeader>

      {create.isError ? <FormAlert>{getErrorMessage(create.error)}</FormAlert> : null}

      <Field id="claim-title" label="Titre" error={errors.title?.message}>
        <input id="claim-title" className={inputClass} aria-invalid={errors.title ? true : undefined} aria-describedby={describedBy("title")} {...register("title")} />
      </Field>

      <Field id="claim-client" label="Client" error={errors.client?.message}>
        <input
          id="claim-client"
          className={inputClass}
          placeholder="Nom de l’entreprise ou du client"
          aria-invalid={errors.client ? true : undefined}
          aria-describedby={describedBy("client")}
          {...register("client")}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink-soft">Priorité</span>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <SegmentedControl label="Priorité" options={PRIORITY_OPTIONS} value={field.value} onValueChange={field.onChange} className="w-fit" />
          )}
        />
      </div>

      <Field id="claim-description" label="Description" error={errors.description?.message}>
        <textarea
          id="claim-description"
          className={textareaClass}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describedBy("description")}
          {...register("description")}
        />
      </Field>

      <DialogFooter className="-mx-6 -mb-6 rounded-b-xl border-t bg-surface-subtle px-6 py-4">
        <AppButton onClick={onDone} disabled={create.isPending}>
          Annuler
        </AppButton>
        <AppButton type="submit" variant="primary" pending={create.isPending}>
          Créer la réclamation
        </AppButton>
      </DialogFooter>
    </form>
  )
}
