import type { IsoDate } from "@/types/domain"

export type ContactType = "sales" | "support"

/** Website contact message (GET /api/contact). Type-specific fields are optional. */
export interface ContactMessage {
  id: number
  type: ContactType
  fullName: string
  email: string
  phone: string | null
  company: string | null
  message: string
  createdAt: IsoDate | null
  emailSent: boolean
  whatsappSent: boolean
  // support
  preferredEmail: string | null
  toonashopAccountEmail: string | null
  contactReason: string | null
  // sales
  jobTitle: string | null
  professionalEmail: string | null
  country: string | null
  ordersPerMonth: string | null
  currentERP: string | null
  hasExistingAccount: boolean | null
}
