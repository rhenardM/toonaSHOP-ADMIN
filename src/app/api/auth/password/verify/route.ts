import { NextResponse } from "next/server"
import { z } from "zod"

import { callBackend } from "@/lib/server/backend-call"
import { RESET_COOKIE } from "@/lib/server/config"
import { jsonError } from "@/lib/server/upstream"

const schema = z.object({ numero: z.string().trim().min(6).max(20), otp: z.string().trim().min(4).max(10) })

interface VerifyResetResponse {
  user_id: number
  token: string
}

/**
 * POST /api/auth/password/verify — checks the OTP (POST /user/verify-reset).
 * The temporary token stays server-side in a short-lived httpOnly cookie.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(400, "Code de vérification invalide.")
  const result = await callBackend<VerifyResetResponse>("/user/verify-reset", { method: "POST", body: parsed.data })
  if (!result.ok || !result.data?.token) {
    return jsonError(result.status === 504 ? 504 : 400, result.ok ? "Code de vérification invalide." : result.message)
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(RESET_COOKIE, JSON.stringify({ userId: result.data.user_id, token: result.data.token }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/password",
    maxAge: 15 * 60,
  })
  return response
}
