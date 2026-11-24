import { toIsoDate, toNumber, toOptionalNumber, toOptionalText, toText } from "@/lib/api/normalize"

import type { Company, CompanyUser, RawGroup, RawGroupUser } from "../types/company.types"

export function toCompany(raw: RawGroup): Company {
  const isPaid = Boolean(raw.isPaid)
  return {
    id: toNumber(raw.id),
    name: toText(raw.nomEntreprise) || toText(raw.name) || `Entreprise #${raw.id}`,
    email: toOptionalText(raw.email),
    phone: toOptionalText(raw.contact),
    rccm: toOptionalText(raw.nrccm),
    usersCount: toNumber(raw.user_count),
    pointsOfSaleCount: toNumber(raw.point_of_sale_count),
    warehousesCount: toNumber(raw.warehouse_count),
    isPaid,
    isEnabled: raw.isActive === undefined || raw.isActive === null ? isPaid : raw.isActive,
    subscriptionEnd: toIsoDate(raw.subscriptionEnd),
    subscriptionStatus: toOptionalText(raw.subscriptionStatus),
    planName: toOptionalText(raw.planName),
    totalRevenue: toOptionalNumber(raw.totalRevenue),
    createdAt: toIsoDate(raw.createdAt) ?? toIsoDate(raw.created_at),
  }
}

export function toCompanyUser(raw: RawGroupUser): CompanyUser {
  return {
    id: toNumber(raw.id),
    name: [toText(raw.prenom), toText(raw.nom)].filter(Boolean).join(" ") || toText(raw.numero) || `#${raw.id}`,
    phone: toOptionalText(raw.numero),
    roles: raw.roles ?? [],
    createdAt: toIsoDate(raw.created_at) ?? toIsoDate(raw.createdAt),
    pointOfSale: raw.point_of_sale?.name ?? null,
    warehouse: raw.entrepot?.name ?? null,
  }
}
