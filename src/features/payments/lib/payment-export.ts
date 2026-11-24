import { downloadFile, formatDate, formatTime, toCsv } from "@/lib/utils"

import type { Payment } from "../types/payment.types"
import { paymentStatusMeta } from "./payment-status"

/** CSV export of payments (semicolon-separated, UTF-8 BOM for Excel). */
export function exportPaymentsCsv(payments: readonly Payment[], filename: string) {
  const csv = toCsv(
    payments.map((p) => ({
      id: p.id,
      date: p.createdAt ? `${formatDate(p.createdAt)} ${formatTime(p.createdAt)}` : "",
      company: p.company?.name ?? "",
      companyEmail: p.company?.email ?? "",
      reference: p.reference ?? "",
      transactionId: p.transactionId ?? "",
      provider: p.provider,
      plan: p.plan ?? "",
      months: p.months ?? "",
      amount: p.amount,
      currency: p.currency,
      status: paymentStatusMeta(p.status).label,
      statusDescription: p.statusDescription ?? "",
    })),
    [
      { key: "id", label: "ID" },
      { key: "date", label: "Date" },
      { key: "company", label: "Entreprise" },
      { key: "companyEmail", label: "Email entreprise" },
      { key: "reference", label: "Référence" },
      { key: "transactionId", label: "Transaction" },
      { key: "provider", label: "Opérateur" },
      { key: "plan", label: "Plan" },
      { key: "months", label: "Mois" },
      { key: "amount", label: "Montant" },
      { key: "currency", label: "Devise" },
      { key: "status", label: "Statut" },
      { key: "statusDescription", label: "Détail du statut" },
    ]
  )
  downloadFile(csv, filename)
}
