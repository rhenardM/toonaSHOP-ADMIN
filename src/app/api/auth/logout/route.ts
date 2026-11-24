import { NextResponse } from "next/server"

import { clearSessionCookie } from "@/lib/server/session"

/** POST /api/auth/logout — the API has no logout endpoint: dropping the cookie ends the session. */
export async function POST() {
  const response = NextResponse.json({ ok: true })
  clearSessionCookie(response)
  return response
}
