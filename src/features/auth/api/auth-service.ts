import { ApiError } from "@/lib/api/errors"
import type { SessionUser } from "@/lib/auth/session-user"

/** Calls the BFF auth routes (same origin, httpOnly cookie). */
async function authCall<T>(path: string, body?: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api/auth${path}`, {
      method: body === undefined && path === "/session" ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    })
  } catch {
    throw new ApiError("network", "Connexion impossible. Vérifiez votre accès internet.")
  }
  const data = (await response.json().catch(() => null)) as (T & { message?: string }) | null
  if (!response.ok) {
    const kind = response.status === 401 ? "unauthorized" : response.status === 504 ? "timeout" : "validation"
    throw new ApiError(kind, data?.message ?? `La requête a échoué (${response.status}).`, response.status)
  }
  return data as T
}

export const authService = {
  login: (credentials: { numero: string; password: string }) =>
    authCall<{ user: SessionUser }>("/login", credentials).then((r) => r.user),
  session: () => authCall<{ user: SessionUser }>("/session").then((r) => r.user),
  logout: () => authCall<{ ok: true }>("/logout", {}),
  requestReset: (numero: string) => authCall<{ ok: true }>("/password/request", { numero }),
  verifyReset: (numero: string, otp: string) => authCall<{ ok: true }>("/password/verify", { numero, otp }),
  resetPassword: (password: string) => authCall<{ ok: true }>("/password/reset", { password }),
}
