"use client"

import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { useApproveImf } from "../hooks/use-imf"

interface ApproveImfDialogProps {
  group: { id: number; name: string } | null
  onOpenChange: (open: boolean) => void
}

/** Confirmation before PATCH /admin/imf/group/{id}/approve. */
export function ApproveImfDialog({ group, onOpenChange }: ApproveImfDialogProps) {
  const approve = useApproveImf()

  return (
    <ConfirmDialog
      open={group !== null}
      onOpenChange={onOpenChange}
      title="Approuver comme IMF ?"
      description={`${group?.name ?? "Ce groupe"} (ID ${group?.id ?? "—"}) obtiendra le statut d’institution de microfinance et l’accès aux fonctionnalités IMF.`}
      confirmLabel="Approuver"
      pending={approve.isPending}
      onConfirm={() => {
        if (!group) return
        approve.mutate(group.id, {
          onSuccess: () => {
            toast.success("Groupe approuvé comme IMF", { description: group.name })
            onOpenChange(false)
          },
          onError: (error) => toast.error("Approbation impossible", { description: getErrorMessage(error) }),
        })
      }}
    />
  )
}
