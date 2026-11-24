import "server-only"

import type { NextResponse } from "next/server"

import { SESSION_COOKIE } from "./config"

const DEFAULT_MAX_AGE = 60 * 60 * 8 // 8 h when the token carries no expiry.

/** Reads the `exp` claim of a JWT without verifying it (the backend does that). */
function tokenMaxAge(token: string): number {
  try {
    const payload = token.split(".")[1]
    if (!payload) return DEFAULT_MAX_AGE
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number }
    if (!exp) return DEFAULT_MAX_AGE
    return Math.max(exp - Math.floor(Date.now() / 1000), 0)
  } catch {
    return DEFAULT_MAX_AGE
  }
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokenMaxAge(token),
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 })
}
