import type { IsoDate } from "@/types/domain"

export interface RawPayment {
  id: number | string
  status?: string | null
  transactionId?: string | null
  reference?: string | null
  statusDescription?: string | null
  /** ⚠️ string in the API, not number. */
  amount?: string | number | null
  provider?: string | null
  plan?: string | null
  months?: number | string | null
  orderCurrency?: string | null
  createdAt?: string | null
  group?: {
    id: number | string
    nomEntreprise?: string | null
    email?: string | null
  } | null
}

/** Known statuses (legacy console); unknown values are kept as-is. */
export type PaymentStatus = "approved" | "failed" | "timeout" | "pending"

export interface Payment {
  id: number
  status: string
  transactionId: string | null
  reference: string | null
  statusDescription: string | null
  amount: number
  currency: string
  provider: string
  plan: string | null
  months: number | null
  createdAt: IsoDate | null
  company: { id: number; name: string; email: string | null } | null
}

/** GET /multipay/subscription/stats */
export interface PaymentStats {
  totals: {
    total: number
    totalAmount: number
    approved: number
    failed: number
    timeout: number
  }
  byStatus: { status: string; count: number; amount: number }[]
  byProvider: { provider: string; count: number; amount: number }[]
}
