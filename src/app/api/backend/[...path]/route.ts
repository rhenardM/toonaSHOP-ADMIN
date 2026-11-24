import { cookies } from "next/headers"

import { SESSION_COOKIE } from "@/lib/server/config"
import { forward } from "@/lib/server/upstream"

/** Authenticated relay to the main ToonaSHOP API: /api/backend/<path> → {API}/api/<path>. */
async function handler(request: Request, ctx: RouteContext<"/api/backend/[...path]">) {
  const { path } = await ctx.params
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return forward({ upstream: "api", path: path.join("/"), request, token })
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE }
