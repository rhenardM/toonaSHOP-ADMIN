"use client"

import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { AppButton } from "./app-button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  tone?: "brand" | "danger"
  pending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, tone = "brand", pending, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-ink">{title}</DialogTitle>
          <DialogDescription className="text-[13.5px] leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="-mx-6 -mb-6 rounded-b-xl border-t bg-surface-subtle px-6 py-4">
          <AppButton onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </AppButton>
          <AppButton variant={tone === "danger" ? "danger" : "primary"} pending={pending} onClick={onConfirm}>
            {confirmLabel}
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
