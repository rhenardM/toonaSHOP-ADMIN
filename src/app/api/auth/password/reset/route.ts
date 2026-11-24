import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import { callBackend } from "@/lib/server/backend-call"
import { RESET_COOKIE } from "@/lib/server/config"
import { jsonError } from "@/lib/server/upstream"

const schema = z.object({ password: z.string().min(6).max(200) })
const resetStateSchema = z.object({ userId: z.number(), token: z.string().min(1) })

/** POST /api/auth/password/reset — sets the new password with the temporary token (PUT /user/update/{id}). */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(400, "Le mot de passe doit contenir au moins 6 caractères.")

  const raw = (await cookies()).get(RESET_COOKIE)?.value
  let state: z.infer<typeof resetStateSchema> | null = null
  try {
    state = raw ? resetStateSchema.parse(JSON.parse(raw)) : null
  } catch {
    state = null
  }
  if (!state) return jsonError(400, "La vérification a expiré. Recommencez la procédure.")

  const result = await callBackend(`/user/update/${state.userId}`, {
    method: "PUT",
    body: { password: parsed.data.password },
    token: state.token,
  })
  if (!result.ok) return jsonError(result.status === 504 ? 504 : 400, result.message)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(RESET_COOKIE, "", { path: "/api/auth/password", maxAge: 0 })
  return response
}
