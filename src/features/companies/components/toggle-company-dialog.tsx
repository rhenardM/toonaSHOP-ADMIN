"use client"

import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { useCompanyMutations } from "../hooks/use-companies"
import type { Company } from "../types/company.types"

/** Confirmation before POST /admin/group/{id}/active|disable. */
export function ToggleCompanyDialog({ company, onOpenChange }: { company: Company | null; onOpenChange: (open: boolean) => void }) {
  const { setEnabled } = useCompanyMutations()
  const enabling = company ? !company.isEnabled : false

  return (
    <ConfirmDialog
      open={company !== null}
      onOpenChange={onOpenChange}
      title={enabling ? "Activer l’entreprise ?" : "Désactiver l’entreprise ?"}
      description={
        enabling
          ? `${company?.name} et ses utilisateurs retrouveront l’accès à ToonaSHOP.`
          : `${company?.name} et tous ses utilisateurs n’auront plus accès à ToonaSHOP tant que l’entreprise reste désactivée.`
      }
      confirmLabel={enabling ? "Activer" : "Désactiver"}
      tone={enabling ? "brand" : "danger"}
      pending={setEnabled.isPending}
      onConfirm={() => {
        if (!company) return
        setEnabled.mutate(
          { companyId: company.id, enabled: enabling },
          {
            onSuccess: () => {
              toast.success(enabling ? "Entreprise activée" : "Entreprise désactivée", { description: company.name })
              onOpenChange(false)
            },
            onError: (error) => toast.error("Action impossible", { description: getErrorMessage(error) }),
          }
        )
      }}
    />
  )
}
