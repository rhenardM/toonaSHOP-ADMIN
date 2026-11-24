"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AppButton } from "@/components/shared/app-button"
import { FilterSelect } from "@/components/shared/filter-select"
import { Field, FormAlert, inputClass, PasswordInput } from "@/components/shared/form-controls"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { useUserMutations } from "../hooks/use-users"
import { nextRoles, roleOptions } from "../lib/user-roles"
import type { User } from "../types/user.types"

const PASSWORD_MIN_LENGTH = 6

const STATUS_OPTIONS = [
  { value: "enabled", label: "Actif" },
  { value: "disabled", label: "Désactivé" },
] as const

const baseSchema = z.object({
  prenom: z.string().trim().min(1, "Le prénom est requis."),
  nom: z.string().trim().min(1, "Le nom est requis."),
  numero: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s]{5,}$/, "Numéro de téléphone invalide."),
  role: z.string().regex(/^ROLE_[A-Z0-9_]+$/, "Choisissez un rôle."),
  status: z.enum(["enabled", "disabled"]),
})

const createSchema = baseSchema.extend({
  password: z.string().min(PASSWORD_MIN_LENGTH, `Au moins ${PASSWORD_MIN_LENGTH} caractères.`),
})

const editSchema = baseSchema.extend({
  password: z
    .string()
    .refine((value) => value === "" || value.length >= PASSWORD_MIN_LENGTH, `Au moins ${PASSWORD_MIN_LENGTH} caractères.`),
})

type UserFormValues = z.infer<typeof createSchema>

/** `"new"` opens the creation form, a user opens the edit form, `null` closes the dialog. */
export type UserFormTarget = User | "new" | null

interface UserFormDialogProps {
  target: UserFormTarget
  onOpenChange: (open: boolean) => void
  /** Loaded users: their roles (e.g. ROLE_VENDEUR) are offered in the role select. */
  knownUsers: readonly User[]
}

export function UserFormDialog({ target, onOpenChange, knownUsers }: UserFormDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-6 sm:max-w-lg">
        {target ? (
          <UserForm key={target === "new" ? "new" : target.id} user={target === "new" ? null : target} knownUsers={knownUsers} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UserForm({ user, knownUsers, onDone }: { user: User | null; knownUsers: readonly User[]; onDone: () => void }) {
  const options = roleOptions(knownUsers, user?.roles)
  const { create, update } = useUserMutations()
  const mutation = user ? update : create
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(user ? editSchema : createSchema),
    defaultValues: {
      prenom: user?.firstName ?? "",
      nom: user?.lastName ?? "",
      numero: user?.phone ?? "",
      role: user?.role ?? "ROLE_USER",
      status: user && !user.isEnabled ? "disabled" : "enabled",
      password: "",
    },
  })

  const onSubmit = handleSubmit((values) => {
    const fullName = `${values.prenom} ${values.nom}`
    if (user) {
      update.mutate(
        {
          id: user.id,
          numero: values.numero,
          nom: values.nom,
          prenom: values.prenom,
          // Keeps the account's other roles; only the main role can change here.
          roles: nextRoles(user.roles, user.role, values.role),
          password: values.password || undefined,
          isEnable: values.status === "enabled",
        },
        {
          onSuccess: () => {
            toast.success("Utilisateur modifié", { description: fullName })
            onDone()
          },
        }
      )
    } else {
      create.mutate(
        { numero: values.numero, password: values.password, nom: values.nom, prenom: values.prenom, role: values.role },
        {
          onSuccess: () => {
            toast.success("Utilisateur créé", { description: fullName })
            onDone()
          },
        }
      )
    }
  })

  const fieldProps = (name: keyof UserFormValues) => ({
    id: `user-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `user-${name}-error` : undefined,
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <DialogHeader>
        <DialogTitle className="text-lg font-extrabold text-ink">{user ? "Modifier l’utilisateur" : "Nouvel utilisateur"}</DialogTitle>
        <DialogDescription>
          {user ? user.name : "Le compte est créé dans le groupe de l’administrateur connecté."}
        </DialogDescription>
      </DialogHeader>

      {mutation.isError ? <FormAlert>{getErrorMessage(mutation.error)}</FormAlert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="user-prenom" label="Prénom" error={errors.prenom?.message}>
          <input {...register("prenom")} {...fieldProps("prenom")} autoComplete="given-name" className={inputClass} />
        </Field>
        <Field id="user-nom" label="Nom" error={errors.nom?.message}>
          <input {...register("nom")} {...fieldProps("nom")} autoComplete="family-name" className={inputClass} />
        </Field>
      </div>

      <Field id="user-numero" label="Téléphone (identifiant de connexion)" error={errors.numero?.message}>
        <input {...register("numero")} {...fieldProps("numero")} type="tel" inputMode="tel" autoComplete="tel" placeholder="+243…" className={inputClass} />
      </Field>

      <Field id="user-role" label="Rôle" error={errors.role?.message}>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <FilterSelect id="user-role" label="Rôle" value={field.value} options={options} onValueChange={field.onChange} className="h-11 w-full font-medium" />
          )}
        />
      </Field>

      <Field
        id="user-password"
        label={user ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}
        error={errors.password?.message}
      >
        <PasswordInput
          {...register("password")}
          {...fieldProps("password")}
          autoComplete="new-password"
          placeholder={user ? "Laisser vide pour conserver l’actuel" : undefined}
        />
      </Field>

      {user ? (
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-ink-soft">Statut du compte</span>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SegmentedControl label="Statut du compte" options={STATUS_OPTIONS} value={field.value} onValueChange={field.onChange} className="w-fit" />
            )}
          />
        </div>
      ) : null}

      <DialogFooter className="-mx-6 -mb-6 rounded-b-xl border-t bg-surface-subtle px-6 py-4">
        <AppButton onClick={onDone} disabled={mutation.isPending}>
          Annuler
        </AppButton>
        <AppButton type="submit" variant="primary" pending={mutation.isPending}>
          {user ? "Enregistrer" : "Créer l’utilisateur"}
        </AppButton>
      </DialogFooter>
    </form>
  )
}
