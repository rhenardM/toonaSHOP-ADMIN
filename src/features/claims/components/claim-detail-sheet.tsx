"use client"

import { Info } from "lucide-react"
import type { ReactNode } from "react"

import { StatusPill } from "@/components/shared/status-pill"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatDate, formatTime } from "@/lib/utils"

import { claimPriorityMeta, claimStatusMeta } from "../lib/claim-meta"
import type { Claim } from "../types/claim.types"

interface ClaimDetailSheetProps {
  claim: Claim | null
  onOpenChange: (open: boolean) => void
}

function formatDateTime(value: string): string {
  return `${formatDate(value)} à ${formatTime(value)}`
}

/** Read-only detail: the API has no endpoint to change a claim's status (spec §5.9). */
export function ClaimDetailSheet({ claim, onOpenChange }: ClaimDetailSheetProps) {
  return (
    <Sheet open={claim !== null} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        {claim ? (
          <>
            <SheetHeader className="gap-2 border-b border-divider p-5 pr-12">
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={claimStatusMeta[claim.status].tone}>{claimStatusMeta[claim.status].label}</StatusPill>
                <StatusPill tone={claimPriorityMeta[claim.priority].tone}>Priorité {claimPriorityMeta[claim.priority].label.toLowerCase()}</StatusPill>
              </div>
              <SheetTitle className="text-lg font-extrabold break-words text-ink">{claim.title}</SheetTitle>
              <SheetDescription>Réclamation #{claim.id}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Client" value={claim.client || "—"} />
                <Detail label="Créée le" value={claim.createdAt ? formatDateTime(claim.createdAt) : "—"} />
                <Detail label="Résolue le" value={claim.resolvedAt ? formatDateTime(claim.resolvedAt) : "—"} />
              </dl>

              <section aria-labelledby="claim-description-title" className="flex flex-col gap-2">
                <h3 id="claim-description-title" className="text-[13px] font-bold text-ink-soft">
                  Description
                </h3>
                <p className="rounded-xl bg-surface-subtle p-4 text-[13.5px] leading-relaxed break-words whitespace-pre-line text-ink">
                  {claim.description || "Aucune description fournie."}
                </p>
              </section>

              <p className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                Le changement de statut n’est pas encore disponible : l’API ToonaSHOP ne propose pas d’endpoint pour mettre à jour une réclamation.
              </p>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd className="text-[13.5px] font-semibold break-words text-ink">{value}</dd>
    </div>
  )
}
