"use client"

import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { usePlanMutations } from "../hooks/use-plans"
import type { Plan } from "../types/plan.types"

/** Confirmation before POST /admin/plans/{id}/deactivate. */
export function DeactivatePlanDialog({ plan, onOpenChange }: { plan: Plan | null; onOpenChange: (open: boolean) => void }) {
  const { deactivate } = usePlanMutations()

  return (
    <ConfirmDialog
      open={plan !== null}
      onOpenChange={onOpenChange}
      title="Désactiver le plan ?"
      description={`Le plan ${plan?.name ?? ""} ne pourra plus être choisi pour une nouvelle souscription ou une prolongation.`}
      confirmLabel="Désactiver"
      tone="danger"
      pending={deactivate.isPending}
      onConfirm={() => {
        if (!plan) return
        deactivate.mutate(plan.id, {
          onSuccess: () => {
            toast.success("Plan désactivé", { description: plan.name })
            onOpenChange(false)
          },
          onError: (error) => toast.error("Désactivation impossible", { description: getErrorMessage(error) }),
        })
      }}
    />
  )
}
