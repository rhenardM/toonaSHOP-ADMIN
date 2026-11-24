import { NextResponse } from "next/server"
import { z } from "zod"

import { callBackend } from "@/lib/server/backend-call"
import { setSessionCookie } from "@/lib/server/session"
import { fetchSessionUser } from "@/lib/server/session-user"
import { jsonError } from "@/lib/server/upstream"

const credentialsSchema = z.object({
  numero: z.string().trim().min(6).max(20),
  password: z.string().min(1).max(200),
})

/** POST /api/auth/login — exchanges credentials for an httpOnly session cookie. */
export async function POST(request: Request) {
  const parsed = credentialsSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(400, "Numéro ou mot de passe manquant.")

  const auth = await callBackend<{ token?: string }>("/auth", { method: "POST", body: parsed.data })
  const token = auth.data?.token
  if (!auth.ok || !token) {
    if (auth.status === 401 || auth.status === 400) return jsonError(401, "Numéro de téléphone ou mot de passe incorrect.")
    if (auth.ok) return jsonError(502, "Réponse de connexion inattendue du serveur ToonaSHOP.")
    return jsonError(auth.status === 504 ? 504 : 502, auth.message)
  }

  const user = await fetchSessionUser(token)
  if (!user.ok || !user.data) {
    return jsonError(user.status === 504 ? 504 : 502, `Connexion réussie mais profil introuvable : ${user.message}`)
  }

  const response = NextResponse.json({ user: user.data })
  setSessionCookie(response, token)
  return response
}
