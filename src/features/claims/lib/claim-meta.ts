import type { PillTone } from "@/lib/constants/status"

import type { Claim, ClaimPriority, ClaimStatus } from "../types/claim.types"

export const claimStatusMeta: Record<ClaimStatus, { label: string; tone: PillTone }> = {
  pending: { label: "Ouverte", tone: "warning" },
  "in-progress": { label: "En cours", tone: "brand" },
  resolved: { label: "Résolue", tone: "success" },
  closed: { label: "Fermée", tone: "neutral" },
}

export const claimPriorityMeta: Record<ClaimPriority, { label: string; tone: PillTone }> = {
  low: { label: "Basse", tone: "neutral" },
  medium: { label: "Moyenne", tone: "warning" },
  high: { label: "Haute", tone: "danger" },
}

export const CLAIM_STATUSES = Object.keys(claimStatusMeta) as ClaimStatus[]
export const CLAIM_PRIORITIES = Object.keys(claimPriorityMeta) as ClaimPriority[]

/** Still awaiting treatment (same rule as the dashboard alerts). */
export function isOpenClaim(claim: Pick<Claim, "status">): boolean {
  return claim.status === "pending" || claim.status === "in-progress"
}

/** Most recent first; undated claims last. */
export function compareClaimsByDate(a: Claim, b: Claim): number {
  return (b.createdAt ? Date.parse(b.createdAt) : 0) - (a.createdAt ? Date.parse(a.createdAt) : 0)
}
