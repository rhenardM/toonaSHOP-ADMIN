import { ApiError, type ApiErrorKind } from "./errors"

type QueryValue = string | number | boolean | null | undefined

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  query?: Record<string, QueryValue>
  /** JSON-serialised unless it is FormData. */
  body?: unknown
  signal?: AbortSignal
}

/** Base paths of the BFF relays (see app/api/backend and app/api/website). */
const BASES = { api: "/api/backend", website: "/api/website" } as const

let sessionExpiredHandler: (() => void) | null = null

/** Registered once by the app shell: redirects to /login when the session dies. */
export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler
}

function buildPath(base: string, path: string, query?: Record<string, QueryValue>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value))
  }
  const qs = params.toString()
  return `${base}${path}${qs ? `?${qs}` : ""}`
}

async function readMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>
      for (const key of ["message", "error", "detail"]) {
        const value = record[key]
        if (typeof value === "string" && value.trim()) return value
      }
    }
  } catch {
    // Non-JSON body.
  }
  return `La requête a échoué (${response.status}).`
}

function kindFor(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized"
  if (status === 403) return "forbidden"
  if (status === 404) return "not-found"
  if (status === 400 || status === 409 || status === 422) return "validation"
  if (status === 504) return "timeout"
  return "server"
}

async function send(base: string, path: string, options: RequestOptions): Promise<Response> {
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData
  let response: Response
  try {
    response = await fetch(buildPath(base, path, options.query), {
      method: options.method ?? "GET",
      headers: options.body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
      signal: options.signal,
      credentials: "same-origin",
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError("network", "Connexion impossible. Vérifiez votre accès internet.")
  }

  if (!response.ok) {
    const message = await readMessage(response)
    if (response.status === 401) sessionExpiredHandler?.()
    throw new ApiError(kindFor(response.status), message, response.status)
  }
  return response
}

async function json<T>(base: string, path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(base, path, options)
  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError("server", "Réponse inattendue du serveur ToonaSHOP.", response.status)
  }
}

/** Main ToonaSHOP API, through the BFF. Paths are relative to `/api` of the backend. */
export function apiRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  return json<T>(BASES.api, path, options)
}

/** Website API (contacts, documents, leads), through the BFF. Paths start with `/api`. */
export function websiteRequest<T>(path: string, options?: RequestOptions): Promise<T> {
  return json<T>(BASES.website, path, options)
}

/** Binary download through the BFF (e.g. CSV exports) — the token never appears in a URL. */
export async function websiteDownload(path: string, options: RequestOptions = {}): Promise<Blob> {
  const response = await send(BASES.website, path, options)
  return response.blob()
}
