import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

import { APP_LOCALE, DEFAULT_CURRENCY } from "@/lib/constants/app"

const integerFormatter = new Intl.NumberFormat(APP_LOCALE, { maximumFractionDigits: 0 })
const compactFormatter = new Intl.NumberFormat(APP_LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
})
const percentFormatter = new Intl.NumberFormat(APP_LOCALE, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** 3412 → "3 412" */
export function formatNumber(value: number): string {
  return integerFormatter.format(value)
}

/** 6000 → "6 k" — for chart axes only. */
export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value)
}

/**
 * 48200 → "48 200 USD". The ISO code is shown after the amount (as in the
 * prototype) instead of a symbol, since plans carry their own currency.
 */
export function formatCurrency(value: number, currency: string = DEFAULT_CURRENCY): string {
  return `${integerFormatter.format(value)} ${currency}`
}

/** 0.914 → "91,4 %" */
export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio)
}

/** 8.2 → "+8,2 %", -3 → "−3,0 %" (true minus sign). */
export function formatSignedPercent(points: number): string {
  const formatted = percentFormatter.format(Math.abs(points) / 100)
  if (points > 0) return `+${formatted}`
  if (points < 0) return `−${formatted}`
  return formatted
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value
}

/** "22 nov. 2026" */
export function formatDate(value: string | Date): string {
  return format(toDate(value), "d MMM yyyy", { locale: fr })
}

/** "26 nov." */
export function formatShortDate(value: string | Date): string {
  return format(toDate(value), "d MMM", { locale: fr })
}

/** "Lundi 23 novembre 2026" */
export function formatLongDate(value: string | Date): string {
  const text = format(toDate(value), "EEEE d MMMM yyyy", { locale: fr })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "Octobre 2026" */
export function formatMonthYear(value: string | Date): string {
  const text = format(toDate(value), "MMMM yyyy", { locale: fr })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const MONTH_TICKS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

/** Short month label used on chart axes, as in the prototype ("Fév", "Juil", "Sep"). */
export function formatMonthTick(value: string | Date): string {
  return MONTH_TICKS[toDate(value).getMonth()] ?? ""
}

/** "14:32" */
export function formatTime(value: string | Date): string {
  return format(toDate(value), "HH:mm", { locale: fr })
}

/** Whole days between a reference date and a target date (negative if past). */
export function daysUntil(target: string | Date, reference: string | Date): number {
  return differenceInCalendarDays(toDate(target), toDate(reference))
}

/** "Pharmacie Bon Berger" → "PB" */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^[A-Za-zÀ-ÿ]/.test(word) && word.length > 2)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
}
