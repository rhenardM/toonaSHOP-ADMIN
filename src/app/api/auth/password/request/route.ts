import { NextResponse } from "next/server"
import { z } from "zod"

import { callBackend } from "@/lib/server/backend-call"
import { jsonError } from "@/lib/server/upstream"

const schema = z.object({ numero: z.string().trim().min(6).max(20) })

/** POST /api/auth/password/request — sends a reset OTP by SMS (POST /user/request-reset). */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(400, "Numéro de téléphone invalide.")
  const result = await callBackend("/user/request-reset", { method: "POST", body: parsed.data })
  if (!result.ok) return jsonError(result.status === 504 ? 504 : 400, result.message)
  return NextResponse.json({ ok: true })
}
