import "server-only"

import { NextResponse } from "next/server"

import { serverConfig } from "./config"
import { clearSessionCookie } from "./session"

export type Upstream = "api" | "website"

/** Paths the BFF may forward to. Anything else is rejected (no open relay). */
const ALLOWED_PREFIXES: Record<Upstream, string[]> = {
  api: ["admin/", "user/", "multipay/", "reclamation/", "imf/", "group/"],
  website: ["api/admin/", "api/contact", "api/documents"],
}

/** Response headers worth passing back to the browser. */
const FORWARDED_RESPONSE_HEADERS = ["content-type", "content-disposition", "content-length"]

export function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ message, code }, { status })
}

export function isAllowedPath(upstream: Upstream, path: string): boolean {
  return !path.includes("..") && ALLOWED_PREFIXES[upstream].some((prefix) => path.startsWith(prefix))
}

function buildUrl(upstream: Upstream, path: string, search: string): URL {
  const origin = upstream === "api" ? serverConfig.apiOrigin : serverConfig.websiteOrigin
  const url = new URL(origin)
  // The origin is fixed: only the pathname and query come from the caller.
  url.pathname = upstream === "api" ? `/api/${path}` : `/${path}`
  url.search = search
  return url
}

/**
 * The ToonaSHOP API reports a bad or missing token inconsistently: 401, 405,
 * or even a 500 HTML page titled "Token invalide" (see API spec §3).
 */
async function isSessionFailure(response: Response): Promise<boolean> {
  if (response.status === 401 || response.status === 405) return true
  if (response.status === 500) {
    const text = await response.clone().text()
    return /token\s+invalide/i.test(text)
  }
  return false
}

interface ForwardOptions {
  upstream: Upstream
  path: string
  request: Request
  token: string | undefined
  /** Public website endpoints do not need a session. */
  requireSession?: boolean
}

export async function forward({ upstream, path, request, token, requireSession = true }: ForwardOptions) {
  if (!isAllowedPath(upstream, path)) return jsonError(404, "Ressource inconnue.")
  if (requireSession && !token) return jsonError(401, "Session expirée. Veuillez vous reconnecter.", "session")

  const incoming = new URL(request.url)
  const headers = new Headers({ Accept: "application/json" })
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("Content-Type", contentType)
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const hasBody = request.method !== "GET" && request.method !== "HEAD"
  let response: Response
  try {
    response = await fetch(buildUrl(upstream, path, incoming.search), {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      signal: AbortSignal.timeout(upstream === "api" ? serverConfig.apiTimeoutMs : serverConfig.websiteTimeoutMs),
      cache: "no-store",
      redirect: "manual",
    })
  } catch (error) {
    const timeout = error instanceof DOMException && error.name === "TimeoutError"
    return jsonError(
      504,
      timeout ? "Le serveur ToonaSHOP met trop de temps à répondre." : "Impossible de joindre le serveur ToonaSHOP.",
      timeout ? "timeout" : "network"
    )
  }

  if (token && (await isSessionFailure(response))) {
    const expired = jsonError(401, "Session expirée. Veuillez vous reconnecter.", "session")
    clearSessionCookie(expired)
    return expired
  }

  const outHeaders = new Headers()
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = response.headers.get(name)
    if (value) outHeaders.set(name, value)
  }
  return new NextResponse(response.body, { status: response.status, headers: outHeaders })
}
