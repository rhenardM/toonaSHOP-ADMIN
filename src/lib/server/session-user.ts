import "server-only"

import { roleLabel, type SessionUser } from "@/lib/auth/session-user"

import { type BackendResult, callBackend } from "./backend-call"

interface ConnectedUser {
  id: number
  nomUser?: string | null
  numero?: string | null
  email?: string | null
  roles?: string[] | null
}

/**
 * Resolves the signed-in user from a token with GET /user/connecter.
 * POST /auth only returns `{ token }` in practice (the legacy console did the same lookup).
 */
export async function fetchSessionUser(token: string): Promise<BackendResult<SessionUser>> {
  const result = await callBackend<ConnectedUser>("/user/connecter", { token })
  if (!result.ok || !result.data) return { ...result, data: null }

  const roles = result.data.roles ?? []
  const phone = result.data.numero ?? ""
  return {
    ...result,
    data: {
      id: result.data.id,
      name: result.data.nomUser?.trim() || phone || "Administrateur",
      phone,
      email: result.data.email ?? null,
      roles,
      roleLabel: roleLabel(roles),
    },
  }
}

/** Token invalid or expired, as reported (inconsistently) by the API. */
export function isSessionStatus(status: number): boolean {
  return [401, 403, 405, 500].includes(status)
}
