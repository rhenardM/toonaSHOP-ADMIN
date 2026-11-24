import { websiteRequest } from "@/lib/api/http"
import { toIsoDate, toNumber, toOptionalText, toText } from "@/lib/api/normalize"

import type { ContactMessage, ContactType } from "../types/contact.types"

type RawContact = Record<string, unknown> & { id: number | string }

export function toContactMessage(raw: RawContact): ContactMessage {
  const type: ContactType = raw.type === "support" ? "support" : "sales"
  const fullName =
    toText(raw.fullName) || [toText(raw.firstName), toText(raw.lastName)].filter(Boolean).join(" ") || toText(raw.email)
  return {
    id: toNumber(raw.id),
    type,
    fullName,
    email: toText(raw.email),
    phone: toOptionalText(raw.phone),
    company: toOptionalText(raw.company),
    message: toText(raw.message),
    createdAt: toIsoDate(raw.createdAt) ?? toIsoDate(raw.created_at),
    emailSent: raw.emailSent === true,
    whatsappSent: raw.whatsappSent === true,
    preferredEmail: toOptionalText(raw.preferredEmail),
    toonashopAccountEmail: toOptionalText(raw.toonashopAccountEmail),
    contactReason: toOptionalText(raw.contactReason),
    jobTitle: toOptionalText(raw.jobTitle),
    professionalEmail: toOptionalText(raw.professionalEmail),
    country: toOptionalText(raw.country),
    ordersPerMonth: toOptionalText(raw.ordersPerMonth),
    currentERP: toOptionalText(raw.currentERP),
    hasExistingAccount: typeof raw.hasExistingAccount === "boolean" ? raw.hasExistingAccount : null,
  }
}

/** GET /api/contact — `{ success, count, data }`, newest first after sorting. */
export async function listContactMessages(type?: ContactType): Promise<ContactMessage[]> {
  const raw = await websiteRequest<{ data?: RawContact[] }>("/api/contact", { query: { type } })
  return (raw?.data ?? [])
    .map(toContactMessage)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
}
