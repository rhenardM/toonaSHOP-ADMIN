/** Signed-in administrator, as exposed by GET /api/auth/session. */
export interface SessionUser {
  id: number
  name: string
  phone: string
  email: string | null
  roles: string[]
  roleLabel: string
}

/** Labels for roles we know; any other `ROLE_XXX` is displayed from its name ("ROLE_VENDEUR" → "Vendeur"). */
const ROLE_LABELS: Record<string, string> = {
  ROLE_SUPER_ADMIN: "Super administrateur",
  ROLE_ADMIN: "Administrateur",
  ROLE_MANAGER: "Gestionnaire",
  ROLE_USER: "Utilisateur",
}

/**
 * The backend (Symfony) gives every account `ROLE_USER` in addition to its
 * business role, so ROLE_USER only counts when it is the sole role.
 */
export const BASE_ROLE = "ROLE_USER"
const PRIORITY = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_MANAGER"]

export function formatRole(role: string): string {
  const known = ROLE_LABELS[role]
  if (known) return known
  const words = role.replace(/^ROLE_/, "").toLowerCase().replace(/_/g, " ").trim()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : role
}

/** Most significant role: admin-like roles first, then any business role, else ROLE_USER. */
export function primaryRole(roles: readonly string[]): string {
  return PRIORITY.find((role) => roles.includes(role)) ?? roles.find((role) => role !== BASE_ROLE) ?? BASE_ROLE
}

export function roleLabel(roles: readonly string[]): string {
  return formatRole(primaryRole(roles))
}

/** Every meaningful role of an account, for display (ROLE_USER hidden when others exist). */
export function roleLabels(roles: readonly string[]): string[] {
  const meaningful = roles.filter((role) => role !== BASE_ROLE)
  return (meaningful.length > 0 ? meaningful : [BASE_ROLE]).map(formatRole)
}

/** "Jean Mukendi" → "JM" */
export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.charAt(0) ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "")).toUpperCase() || "?"
}
