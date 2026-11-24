/** Signed-in administrator, as exposed by GET /api/auth/session. */
export interface SessionUser {
  id: number
  name: string
  phone: string
  email: string | null
  roles: string[]
  roleLabel: string
}

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Administrateur",
  ROLE_MANAGER: "Gestionnaire",
  ROLE_USER: "Utilisateur",
}

export function roleLabel(roles: string[]): string {
  for (const role of ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"]) {
    if (roles.includes(role)) return ROLE_LABELS[role] ?? role
  }
  return roles[0] ?? "Utilisateur"
}

/** "Jean Mukendi" → "JM" */
export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.charAt(0) ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "")).toUpperCase() || "?"
}
