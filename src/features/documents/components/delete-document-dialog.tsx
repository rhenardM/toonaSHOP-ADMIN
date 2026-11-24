"use client"

import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getErrorMessage } from "@/lib/api/errors"

import { useDocumentMutations } from "../hooks/use-documents"
import type { LibraryDocument } from "../types/document.types"

/** Confirmation before DELETE /api/admin/documents/{id}. */
export function DeleteDocumentDialog({ document, onOpenChange }: { document: LibraryDocument | null; onOpenChange: (open: boolean) => void }) {
  const { remove } = useDocumentMutations()

  return (
    <ConfirmDialog
      open={document !== null}
      onOpenChange={onOpenChange}
      title="Supprimer le document ?"
      description={`« ${document?.title} » ne sera plus téléchargeable sur le site. Cette action est définitive.`}
      confirmLabel="Supprimer"
      tone="danger"
      pending={remove.isPending}
      onConfirm={() => {
        if (!document) return
        remove.mutate(document.id, {
          onSuccess: () => {
            toast.success("Document supprimé", { description: document.title })
            onOpenChange(false)
          },
          onError: (error) => toast.error("Suppression impossible", { description: getErrorMessage(error) }),
        })
      }}
    />
  )
}
