import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { SESSION_COOKIE } from "@/lib/server/config"
import { clearSessionCookie } from "@/lib/server/session"
import { fetchSessionUser, isSessionStatus } from "@/lib/server/session-user"
import { jsonError } from "@/lib/server/upstream"

/** GET /api/auth/session — validates the token with GET /user/connecter and returns the user. */
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return jsonError(401, "Session expirée. Veuillez vous reconnecter.", "session")

  const result = await fetchSessionUser(token)
  if (!result.ok || !result.data) {
    if (isSessionStatus(result.status)) {
      const response = jsonError(401, "Session expirée. Veuillez vous reconnecter.", "session")
      clearSessionCookie(response)
      return response
    }
    return jsonError(result.status, result.message)
  }
  return NextResponse.json({ user: result.data })
}
