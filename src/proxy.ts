import { type NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE } from "@/lib/auth/cookies"

const PUBLIC_PATHS = ["/login", "/forgot-password"]

/**
 * Optimistic route guard: only checks that a session cookie exists. The token
 * itself is validated by the backend on every BFF call (and /api/auth/session).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (!hasSession && !isPublic) {
    const url = new URL("/login", request.url)
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(url)
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

export const config = {
  // Pages only: API routes answer 401 themselves, assets are always public.
  matcher: ["/((?!api|_next/static|_next/image|brand|icon.svg|favicon.ico).*)"],
}
