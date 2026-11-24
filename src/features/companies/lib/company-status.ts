import { differenceInCalendarDays } from "date-fns"

import type { PillTone } from "@/lib/constants/status"

import type { Company, CompanyStatus } from "../types/company.types"

export const EXPIRING_SOON_DAYS = 7

/** Same rules as the legacy console (utils/groupStatus.ts). */
export function getCompanyStatus(company: Pick<Company, "isEnabled" | "subscriptionEnd">, now = new Date()): CompanyStatus {
  if (!company.isEnabled) return "disabled"
  if (!company.subscriptionEnd) return "active"
  const days = differenceInCalendarDays(new Date(company.subscriptionEnd), now)
  if (days < 0) return "expired"
  return days <= EXPIRING_SOON_DAYS ? "expiring" : "active"
}

export const companyStatusMeta: Record<CompanyStatus, { label: string; tone: PillTone }> = {
  active: { label: "Actif", tone: "success" },
  expiring: { label: "Expire bientôt", tone: "warning" },
  expired: { label: "Abonnement expiré", tone: "danger" },
  disabled: { label: "Désactivé", tone: "neutral" },
}

/** True when the API flags the company as being on a trial. */
export function isTrial(company: Pick<Company, "subscriptionStatus">): boolean {
  return /trial|essai/i.test(company.subscriptionStatus ?? "")
}
