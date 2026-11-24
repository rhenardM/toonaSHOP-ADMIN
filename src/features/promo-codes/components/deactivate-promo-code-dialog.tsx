"use client"

import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { usePromoCodeMutations } from "../hooks/use-promo-codes"
import type { PromoCode } from "../types/promo-code.types"

/** Confirmation before POST /admin/promo-codes/{id}/deactivate. */
export function DeactivatePromoCodeDialog({ promo, onOpenChange }: { promo: PromoCode | null; onOpenChange: (open: boolean) => void }) {
  const { deactivate } = usePromoCodeMutations()

  return (
    <ConfirmDialog
      open={promo !== null}
      onOpenChange={onOpenChange}
      title="Désactiver le code promo ?"
      description={`Le code ${promo?.code ?? ""} sera refusé lors des prochaines souscriptions.`}
      confirmLabel="Désactiver"
      tone="danger"
      pending={deactivate.isPending}
      onConfirm={() => {
        if (!promo) return
        deactivate.mutate(promo.id, {
          onSuccess: () => {
            toast.success("Code promo désactivé", { description: promo.code })
            onOpenChange(false)
          },
          onError: (error) => toast.error("Désactivation impossible", { description: getErrorMessage(error) }),
        })
      }}
    />
  )
}
