import "server-only"

/** Server-side configuration for the backend-for-frontend layer. */
export const serverConfig = {
  /** Main ToonaSHOP ERP API origin (without /api). */
  apiOrigin: process.env.TOONA_API_URL ?? "https://toonashop.toonaphar.com",
  /** Website API origin (contact messages, documents, leads). */
  websiteOrigin: process.env.TOONA_WEBSITE_API_URL ?? "https://website-api.toonashop.com",
  /** Upstream timeouts, as in the legacy console (§3 of the API spec). */
  apiTimeoutMs: 15_000,
  websiteTimeoutMs: 30_000,
} as const

export { RESET_COOKIE, SESSION_COOKIE } from "@/lib/auth/cookies"
