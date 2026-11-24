import { DEFAULT_CURRENCY } from "@/lib/constants/app"
import { toIsoDate, toNumber, toOptionalNumber, toOptionalText, toText } from "@/lib/api/normalize"

import type { Payment, PaymentStats, RawPayment } from "../types/payment.types"

export function toPayment(raw: RawPayment): Payment {
  return {
    id: toNumber(raw.id),
    status: toText(raw.status).toLowerCase() || "unknown",
    transactionId: toOptionalText(raw.transactionId),
    reference: toOptionalText(raw.reference),
    statusDescription: toOptionalText(raw.statusDescription),
    amount: toNumber(raw.amount),
    currency: toText(raw.orderCurrency) || DEFAULT_CURRENCY,
    provider: toText(raw.provider) || "Inconnu",
    plan: toOptionalText(raw.plan),
    months: toOptionalNumber(raw.months),
    createdAt: toIsoDate(raw.createdAt),
    company: raw.group
      ? {
          id: toNumber(raw.group.id),
          name: toText(raw.group.nomEntreprise) || `#${raw.group.id}`,
          email: toOptionalText(raw.group.email),
        }
      : null,
  }
}

interface RawPaymentStats {
  totals?: {
    total?: number | string
    total_amount?: number | string
    approved_count?: number | string
    failed_count?: number | string
    timeout_count?: number | string
  }
  by_status?: {
    status: string
    count: number | string
    amount: number | string
  }[]
  by_provider?: {
    provider: string
    count: number | string
    amount: number | string
  }[]
}

export function toPaymentStats(raw: RawPaymentStats | null | undefined): PaymentStats {
  return {
    totals: {
      total: toNumber(raw?.totals?.total),
      totalAmount: toNumber(raw?.totals?.total_amount),
      approved: toNumber(raw?.totals?.approved_count),
      failed: toNumber(raw?.totals?.failed_count),
      timeout: toNumber(raw?.totals?.timeout_count),
    },
    byStatus: (raw?.by_status ?? []).map((s) => ({
      status: toText(s.status).toLowerCase(),
      count: toNumber(s.count),
      amount: toNumber(s.amount),
    })),
    byProvider: (raw?.by_provider ?? []).map((p) => ({
      provider: toText(p.provider) || "Inconnu",
      count: toNumber(p.count),
      amount: toNumber(p.amount),
    })),
  }
}

export type { RawPaymentStats }
