import type { IsoDate } from "@/types/domain"

export type ClaimStatus = "pending" | "in-progress" | "resolved" | "closed"
export type ClaimPriority = "low" | "medium" | "high"

export interface Claim {
  id: number
  title: string
  description: string
  status: ClaimStatus
  priority: ClaimPriority
  client: string
  createdAt: IsoDate | null
  resolvedAt: IsoDate | null
}

/** Body of POST /reclamation/create. */
export interface ClaimInput {
  title: string
  description: string
  priority: ClaimPriority
  client: string
}
