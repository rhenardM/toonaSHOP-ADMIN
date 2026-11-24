"use client"

import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { useUserMutations } from "../hooks/use-users"
import type { User } from "../types/user.types"

/** Confirmation before PUT /user/update/{id} with only `isEnable` flipped. */
export function ToggleUserDialog({ user, onOpenChange }: { user: User | null; onOpenChange: (open: boolean) => void }) {
  const { update } = useUserMutations()
  const enabling = user ? !user.isEnabled : false

  return (
    <ConfirmDialog
      open={user !== null}
      onOpenChange={onOpenChange}
      title={enabling ? "Activer le compte ?" : "Désactiver le compte ?"}
      description={
        enabling
          ? `${user?.name} pourra de nouveau se connecter à ToonaSHOP.`
          : `${user?.name} ne pourra plus se connecter à ToonaSHOP tant que son compte reste désactivé.`
      }
      confirmLabel={enabling ? "Activer" : "Désactiver"}
      tone={enabling ? "brand" : "danger"}
      pending={update.isPending}
      onConfirm={() => {
        if (!user) return
        update.mutate(
          { id: user.id, numero: user.phone, nom: user.lastName, prenom: user.firstName, role: user.role, isEnable: enabling },
          {
            onSuccess: () => {
              toast.success(enabling ? "Compte activé" : "Compte désactivé", { description: user.name })
              onOpenChange(false)
            },
            onError: (error) => toast.error("Action impossible", { description: getErrorMessage(error) }),
          }
        )
      }}
    />
  )
}
