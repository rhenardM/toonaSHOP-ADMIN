import Link from "next/link"

import type { DataColumn } from "@/components/shared/data-table"
import { StatusPill } from "@/components/shared/status-pill"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"

import { paymentStatusMeta } from "../lib/payment-status"
import type { Payment } from "../types/payment.types"

/** Shared payment columns (payments page, company detail). */
export function paymentColumns({ showCompany }: { showCompany: boolean }): DataColumn<Payment>[] {
  const columns: DataColumn<Payment>[] = [
    {
      id: "date",
      header: "Date",
      cell: (p) =>
        p.createdAt ? (
          <span className="whitespace-nowrap text-ink-soft">
            {formatDate(p.createdAt)}
            <span className="block text-xs text-muted-foreground">{formatTime(p.createdAt)}</span>
          </span>
        ) : (
          "—"
        ),
    },
  ]
  if (showCompany) {
    columns.push({
      id: "company",
      header: "Entreprise",
      cell: (p) =>
        p.company ? (
          <Link href={`/companies/${p.company.id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-ink hover:text-brand">
            {p.company.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    })
  }
  columns.push(
    {
      id: "reference",
      header: "Référence",
      cell: (p) => (
        <span className="font-mono text-[12.5px] text-ink-soft">
          {p.reference ?? "—"}
          {p.transactionId ? <span className="block text-[11.5px] text-muted-foreground">{p.transactionId}</span> : null}
        </span>
      ),
    },
    { id: "provider", header: "Opérateur", cell: (p) => p.provider },
    {
      id: "plan",
      header: "Plan",
      cell: (p) => (
        <span className="whitespace-nowrap">
          {p.plan ?? "—"}
          {p.months ? <span className="text-muted-foreground"> · {p.months} mois</span> : null}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Montant",
      align: "right",
      cell: (p) => <strong className="font-bold whitespace-nowrap tabular-nums">{formatCurrency(p.amount, p.currency)}</strong>,
    },
    {
      id: "status",
      header: "Statut",
      cell: (p) => {
        const meta = paymentStatusMeta(p.status)
        return (
          <span title={p.statusDescription ?? undefined}>
            <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
          </span>
        )
      },
    }
  )
  return columns
}
