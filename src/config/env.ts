/**
 * Public configuration, safe for client components. Backend origins are
 * server-only (see lib/server/config.ts): the browser only talks to the BFF.
 */
export const env = {
  whatsapp: {
    sales: process.env.NEXT_PUBLIC_WA_SALES ?? "",
    support: process.env.NEXT_PUBLIC_WA_SUPPORT ?? "",
  },
} as const

/** Builds a wa.me link, or null when the number is not configured. */
export function whatsappLink(number: string, message?: string): string | null {
  const digits = number.replace(/[^\d]/g, "")
  if (!digits) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ""
  return `https://wa.me/${digits}${text}`
}
