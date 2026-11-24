import { roleLabel } from "@/lib/auth/session-user"

import type { UserRole } from "../types/user.types"

/** Roles an admin can assign, highest first (same order as `roleLabel`). */
export const USER_ROLES = ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"] as const satisfies readonly UserRole[]

export const ROLE_OPTIONS = USER_ROLES.map((role) => ({ value: role, label: roleLabel([role]) }))

export function primaryRole(roles: readonly string[]): UserRole {
  return USER_ROLES.find((role) => roles.includes(role)) ?? "ROLE_USER"
}
