/**
 * Pure derivations for dashboard sections the API does not compute itself
 * (time series, distributions, activity feed). Inputs are real API data.
 */
import { differenceInCalendarDays, formatISO, startOfDay, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns"

import type { Claim } from "@/features/claims/types/claim.types"
import { getCompanyStatus } from "@/features/companies/lib/company-status"
import type { Company } from "@/features/companies/types/company.types"
import type { ImfGroup } from "@/features/imf/types/imf.types"
import type { ContactMessage } from "@/features/messages/types/contact.types"
import type { Payment } from "@/features/payments/types/payment.types"
import { formatCurrency, formatNumber } from "@/lib/utils"

import type {
  CompanyGrowthPoint,
  DashboardAlert,
  DateRangePreset,
  PaymentHealth,
  PlanShare,
  PlatformActivity,
  ProviderStat,
  RevenuePoint,
  RevenueWindow,
  StatusShare,
} from "../types/dashboard.types"

const isoDay = (date: Date) => formatISO(date, { representation: "date" })

export function rangeStart(range: DateRangePreset | RevenueWindow, now: Date): Date {
  switch (range) {
    case "7d":
      return startOfDay(subDays(now, 6))
    case "30d":
      return startOfDay(subDays(now, 29))
    case "90d":
      return startOfDay(subDays(now, 89))
    case "12m":
      return startOfMonth(subMonths(now, 11))
  }
}

function inRange(payment: Payment, start: Date): boolean {
  return Boolean(payment.createdAt && new Date(payment.createdAt) >= start)
}

/** Most frequent currency — amounts in different currencies are never summed together. */
export function dominantCurrency(payments: Payment[], fallback = "USD"): string {
  const counts = new Map<string, number>()
  for (const p of payments) counts.set(p.currency, (counts.get(p.currency) ?? 0) + 1)
  let best = fallback
  let max = 0
  for (const [currency, count] of counts) {
    if (count > max) {
      best = currency
      max = count
    }
  }
  return best
}

/** Approved revenue per day (30 d), per week (90 d) or per month (12 m), zero-filled. */
export function revenueSeries(payments: Payment[], window: RevenueWindow, now: Date, currency: string): RevenuePoint[] {
  const start = rangeStart(window, now)
  const bucketOf = (date: Date) =>
    window === "12m" ? startOfMonth(date) : window === "90d" ? startOfWeek(date, { weekStartsOn: 1 }) : startOfDay(date)

  const buckets = new Map<string, number>()
  let cursor = bucketOf(start)
  const end = bucketOf(now)
  while (cursor <= end) {
    buckets.set(isoDay(cursor), 0)
    cursor =
      window === "12m"
        ? startOfMonth(subMonths(cursor, -1))
        : window === "90d"
          ? subDays(cursor, -7)
          : subDays(cursor, -1)
  }

  for (const payment of payments) {
    if (payment.status !== "approved" || payment.currency !== currency || !inRange(payment, start) || !payment.createdAt) continue
    const key = isoDay(bucketOf(new Date(payment.createdAt)))
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + payment.amount)
  }
  return [...buckets.entries()].map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
}

export function paymentHealth(payments: Payment[], range: DateRangePreset, now: Date): PaymentHealth {
  const start = rangeStart(range, now)
  const health: PaymentHealth = { total: 0, approved: 0, failed: 0, timeout: 0, pending: 0, companiesToFollowUp: 0 }
  const followUp = new Set<number>()
  for (const p of payments) {
    if (!inRange(p, start)) continue
    health.total++
    if (p.status === "approved") health.approved++
    else if (p.status === "failed") health.failed++
    else if (p.status === "timeout") health.timeout++
    else health.pending++
    if ((p.status === "failed" || p.status === "timeout") && p.company) followUp.add(p.company.id)
  }
  health.companiesToFollowUp = followUp.size
  return health
}

/** Approved amount and transaction count per operator. */
export function providerBreakdown(payments: Payment[], range: DateRangePreset, now: Date, currency: string): ProviderStat[] {
  const start = rangeStart(range, now)
  const map = new Map<string, ProviderStat>()
  for (const p of payments) {
    if (!inRange(p, start)) continue
    const stat = map.get(p.provider) ?? { provider: p.provider, amount: 0, count: 0 }
    stat.count++
    if (p.status === "approved" && p.currency === currency) stat.amount += p.amount
    map.set(p.provider, stat)
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount || b.count - a.count)
}

/** Companies with a valid subscription, by plan name. */
export function planShares(companies: Company[], now: Date): PlanShare[] {
  const map = new Map<string, number>()
  for (const c of companies) {
    const status = getCompanyStatus(c, now)
    if (status !== "active" && status !== "expiring") continue
    const plan = c.planName ?? "Sans plan"
    map.set(plan, (map.get(plan) ?? 0) + 1)
  }
  return [...map.entries()].map(([plan, count]) => ({ plan, companies: count })).sort((a, b) => b.companies - a.companies)
}

export function statusShares(companies: Company[], now: Date): StatusShare[] {
  const order: StatusShare["status"][] = ["active", "expiring", "expired", "disabled"]
  const counts = new Map(order.map((s) => [s, 0]))
  for (const c of companies) {
    const status = getCompanyStatus(c, now)
    counts.set(status, (counts.get(status) ?? 0) + 1)
  }
  return order.map((status) => ({ status, companies: counts.get(status) ?? 0 }))
}

/** Sign-ups per month over the last 12 months (needs `createdAt` on groups). */
export function companyGrowth(companies: Company[], now: Date): CompanyGrowthPoint[] {
  const months = Array.from({ length: 12 }, (_, i) => isoDay(startOfMonth(subMonths(now, 11 - i))))
  const counts = new Map(months.map((m) => [m, 0]))
  for (const c of companies) {
    if (!c.createdAt) continue
    const key = isoDay(startOfMonth(new Date(c.createdAt)))
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return months.map((month) => ({ month, signups: counts.get(month) ?? 0 }))
}

export function hasCreationDates(companies: Company[]): boolean {
  return companies.some((c) => c.createdAt)
}

interface AlertInputs {
  expiring?: Company[]
  imfPendingCount?: number
  claims?: Claim[]
  unreadMessages?: ContactMessage[]
  health?: PaymentHealth
  now: Date
}

/** "Points d'attention": only built from sources that loaded. */
export function buildAlerts({ expiring, imfPendingCount, claims, unreadMessages, health, now }: AlertInputs): DashboardAlert[] {
  const alerts: DashboardAlert[] = []

  const urgent = (expiring ?? []).filter((c) => c.subscriptionEnd && differenceInCalendarDays(new Date(c.subscriptionEnd), now) <= 5)
  if (urgent.length > 0) {
    alerts.push({
      id: "expiring",
      severity: "critical",
      title: `${formatNumber(urgent.length)} abonnement${urgent.length > 1 ? "s expirent" : " expire"} sous 5 jours`,
      description: urgent.slice(0, 2).map((c) => c.name).join(", ") + (urgent.length > 2 ? "…" : "."),
      href: "/subscriptions",
      actionLabel: "Voir les abonnements",
    })
  }
  if (health && health.companiesToFollowUp > 0) {
    alerts.push({
      id: "payments",
      severity: "warning",
      title: `${formatNumber(health.failed + health.timeout)} paiements non aboutis`,
      description: `${formatNumber(health.companiesToFollowUp)} entreprises à relancer sur la période.`,
      href: "/payments",
      actionLabel: "Voir les paiements",
    })
  }
  if (imfPendingCount && imfPendingCount > 0) {
    alerts.push({
      id: "imf",
      severity: "warning",
      title: `${formatNumber(imfPendingCount)} demande${imfPendingCount > 1 ? "s" : ""} IMF en attente`,
      description: "Des institutions attendent une validation.",
      href: "/imf/pending",
      actionLabel: "Examiner",
    })
  }
  const openHigh = (claims ?? []).filter((c) => c.priority === "high" && (c.status === "pending" || c.status === "in-progress"))
  if (openHigh.length > 0) {
    alerts.push({
      id: "claims",
      severity: "warning",
      title: `${formatNumber(openHigh.length)} réclamation${openHigh.length > 1 ? "s" : ""} prioritaire${openHigh.length > 1 ? "s" : ""} ouverte${openHigh.length > 1 ? "s" : ""}`,
      description: openHigh[0]?.title ?? "",
      href: "/claims",
      actionLabel: "Traiter",
    })
  }
  if (unreadMessages && unreadMessages.length > 0) {
    const sales = unreadMessages.filter((m) => m.type === "sales").length
    alerts.push({
      id: "messages",
      severity: "info",
      title: `${formatNumber(unreadMessages.length)} nouveau${unreadMessages.length > 1 ? "x" : ""} message${unreadMessages.length > 1 ? "s" : ""} du site`,
      description: `${formatNumber(sales)} commercial(aux), ${formatNumber(unreadMessages.length - sales)} support.`,
      href: "/messages",
      actionLabel: "Lire",
    })
  }
  return alerts
}

interface ActivityInputs {
  payments?: Payment[]
  newCompanies?: Company[]
  claims?: Claim[]
  messages?: ContactMessage[]
  imfPending?: ImfGroup[]
}

/** Recent platform events merged from every source, newest first. */
export function buildActivities({ payments, newCompanies, claims, messages, imfPending }: ActivityInputs, limit = 8): PlatformActivity[] {
  const events: PlatformActivity[] = []
  for (const p of (payments ?? []).slice(0, 20)) {
    if (!p.createdAt || (p.status !== "approved" && p.status !== "failed" && p.status !== "timeout")) continue
    const ok = p.status === "approved"
    events.push({
      id: `payment-${p.id}`,
      kind: ok ? "payment-approved" : "payment-failed",
      category: "payments",
      title: ok ? "Paiement approuvé" : p.status === "timeout" ? "Paiement expiré" : "Paiement échoué",
      description: `${p.company?.name ?? "Entreprise inconnue"} · ${formatCurrency(p.amount, p.currency)} via ${p.provider}`,
      occurredAt: p.createdAt,
      href: p.company ? `/companies/${p.company.id}` : "/payments",
    })
  }
  for (const c of newCompanies ?? []) {
    if (!c.createdAt) continue
    events.push({
      id: `company-${c.id}`,
      kind: "company-created",
      category: "companies",
      title: "Nouvelle entreprise",
      description: `${c.name}${c.planName ? ` · plan ${c.planName}` : ""}`,
      occurredAt: c.createdAt,
      href: `/companies/${c.id}`,
    })
  }
  for (const g of imfPending ?? []) {
    if (!g.createdAt) continue
    events.push({
      id: `imf-${g.id}`,
      kind: "imf-request",
      category: "companies",
      title: "Demande IMF",
      description: `${g.name} a demandé l’accès IMF`,
      occurredAt: g.createdAt,
      href: "/imf/pending",
    })
  }
  for (const c of (claims ?? []).slice(0, 10)) {
    if (!c.createdAt) continue
    events.push({
      id: `claim-${c.id}`,
      kind: "claim-opened",
      category: "support",
      title: "Réclamation ouverte",
      description: `${c.client ? `${c.client} · ` : ""}${c.title}`,
      occurredAt: c.createdAt,
      href: "/claims",
    })
  }
  for (const m of (messages ?? []).slice(0, 10)) {
    if (!m.createdAt) continue
    events.push({
      id: `message-${m.id}`,
      kind: "message-received",
      category: "support",
      title: m.type === "support" ? "Demande de support" : "Demande commerciale",
      description: `${m.fullName}${m.company ? ` · ${m.company}` : ""}`,
      occurredAt: m.createdAt,
      href: `/messages?id=${m.id}`,
    })
  }
  return events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, limit)
}
