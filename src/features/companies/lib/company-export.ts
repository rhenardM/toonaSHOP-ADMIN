import { downloadFile, formatDate, toCsv } from "@/lib/utils"

import type { Company } from "../types/company.types"
import { companyStatusMeta, getCompanyStatus } from "./company-status"

/** CSV export of companies (semicolon-separated, UTF-8 BOM for Excel). */
export function exportCompaniesCsv(companies: Company[], filename: string) {
  const csv = toCsv(
    companies.map((c) => ({
      id: c.id,
      name: c.name,
      rccm: c.rccm ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      plan: c.planName ?? "",
      users: c.usersCount,
      pointsOfSale: c.pointsOfSaleCount,
      warehouses: c.warehousesCount,
      status: companyStatusMeta[getCompanyStatus(c)].label,
      subscriptionEnd: c.subscriptionEnd ? formatDate(c.subscriptionEnd) : "",
      createdAt: c.createdAt ? formatDate(c.createdAt) : "",
    })),
    [
      { key: "id", label: "ID" },
      { key: "name", label: "Entreprise" },
      { key: "rccm", label: "RCCM" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Téléphone" },
      { key: "plan", label: "Plan" },
      { key: "users", label: "Utilisateurs" },
      { key: "pointsOfSale", label: "Points de vente" },
      { key: "warehouses", label: "Entrepôts" },
      { key: "status", label: "Statut" },
      { key: "subscriptionEnd", label: "Fin d’abonnement" },
      { key: "createdAt", label: "Inscrite le" },
    ]
  )
  downloadFile(csv, filename)
}
