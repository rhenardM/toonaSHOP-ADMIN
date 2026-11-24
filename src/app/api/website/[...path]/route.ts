import { cookies } from "next/headers"

import { SESSION_COOKIE } from "@/lib/server/config"
import { forward } from "@/lib/server/upstream"

/**
 * Relay to the website API: /api/website/<path> → {WEBSITE}/<path>.
 * A session is required here even for endpoints the website API leaves public,
 * so admin data is never reachable through this console without signing in.
 */
async function handler(request: Request, ctx: RouteContext<"/api/website/[...path]">) {
  const { path } = await ctx.params
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return forward({ upstream: "website", path: path.join("/"), request, token })
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE }
