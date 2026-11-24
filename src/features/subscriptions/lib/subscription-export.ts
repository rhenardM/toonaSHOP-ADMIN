import { companyStatusMeta } from "@/features/companies/lib/company-status"
import { daysUntil, downloadFile, formatDate, toCsv } from "@/lib/utils"

import type { SubscriptionRow } from "./subscription-filters"

/** CSV export of the filtered subscriptions (semicolon-separated, UTF-8 BOM for Excel). */
export function exportSubscriptionsCsv(rows: readonly SubscriptionRow[], now: Date, filename: string) {
  const csv = toCsv(
    rows.map(({ company: c, status, trial }) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      plan: c.planName ?? "",
      trial: trial ? "Oui" : "Non",
      subscriptionEnd: c.subscriptionEnd ? formatDate(c.subscriptionEnd) : "",
      daysLeft: c.subscriptionEnd ? daysUntil(c.subscriptionEnd, now) : "",
      status: companyStatusMeta[status].label,
    })),
    [
      { key: "id", label: "ID" },
      { key: "name", label: "Entreprise" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Téléphone" },
      { key: "plan", label: "Plan" },
      { key: "trial", label: "Essai" },
      { key: "subscriptionEnd", label: "Fin d’abonnement" },
      { key: "daysLeft", label: "Jours restants" },
      { key: "status", label: "Statut" },
    ]
  )
  downloadFile(csv, filename)
}
