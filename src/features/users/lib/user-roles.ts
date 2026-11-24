import { BASE_ROLE, formatRole, primaryRole } from "@/lib/auth/session-user"

import type { User, UserRole } from "../types/user.types"

/** Roles always offered, even if no loaded user has them yet. */
const STANDARD_ROLES = ["ROLE_ADMIN", "ROLE_MANAGER", BASE_ROLE]

export { primaryRole }

/** Standard roles plus every role seen in the loaded users (ROLE_VENDEUR, …). */
export function roleOptions(users: readonly User[], extra: readonly string[] = []): { value: UserRole; label: string }[] {
  const seen = new Set<string>(STANDARD_ROLES)
  for (const user of users) for (const role of user.roles) seen.add(role)
  for (const role of extra) seen.add(role)
  return [...seen].map((role) => ({ value: role, label: formatRole(role) })).sort((a, b) => a.label.localeCompare(b.label, "fr"))
}

/**
 * Roles to send when the selected main role changes: keep every other role
 * the account had, swap the previous main role for the new one.
 */
export function nextRoles(current: readonly string[], previousMain: string, nextMain: string): UserRole[] {
  if (previousMain === nextMain && current.length > 0) return [...current]
  const kept = current.filter((role) => role !== previousMain && role !== nextMain && role !== BASE_ROLE)
  return [nextMain, ...kept]
}
