import "server-only"

import { serverConfig } from "./config"

export interface BackendResult<T> {
  ok: boolean
  status: number
  data: T | null
  message: string
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    for (const key of ["message", "error", "detail"]) {
      const value = record[key]
      if (typeof value === "string" && value.trim()) return value
    }
  }
  return fallback
}

/** JSON call to the main API from a route handler (auth flows). */
export async function callBackend<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string } = {}
): Promise<BackendResult<T>> {
  const headers = new Headers({ Accept: "application/json" })
  if (init.body !== undefined) headers.set("Content-Type", "application/json")
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`)

  try {
    const response = await fetch(`${serverConfig.apiOrigin}/api${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(serverConfig.apiTimeoutMs),
      cache: "no-store",
    })
    const text = await response.text()
    let data: unknown = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? (data as T) : null,
      message: extractMessage(data, `Erreur du serveur ToonaSHOP (${response.status}).`),
    }
  } catch (error) {
    const timeout = error instanceof DOMException && error.name === "TimeoutError"
    return {
      ok: false,
      status: 504,
      data: null,
      message: timeout ? "Le serveur ToonaSHOP met trop de temps à répondre." : "Impossible de joindre le serveur ToonaSHOP.",
    }
  }
}
