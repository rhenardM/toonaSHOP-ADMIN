import { toIsoDate, toNumber, toOptionalText, toText } from "@/lib/api/normalize"

import { primaryRole } from "../lib/user-roles"
import type { RawUser, User } from "../types/user.types"

export function toUser(raw: RawUser): User {
  const firstName = toText(raw.prenom)
  const lastName = toText(raw.nom)
  const phone = toText(raw.numero)
  const roles = (raw.roles ?? []).filter((role): role is string => typeof role === "string")
  return {
    id: toNumber(raw.id),
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || phone || `Utilisateur #${raw.id}`,
    phone,
    email: toOptionalText(raw.email),
    roles,
    role: primaryRole(roles),
    // Missing flag: the account is treated as enabled, like the legacy console.
    isEnabled: raw.is_enable !== false,
    pointOfSale: toOptionalText(raw.point_of_sale?.name),
    warehouse: toOptionalText(raw.entrepot?.name),
    createdAt: toIsoDate(raw.created_at) ?? toIsoDate(raw.createdAt),
  }
}
