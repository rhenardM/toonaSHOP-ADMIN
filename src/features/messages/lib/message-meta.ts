import { formatDate, formatTime } from "@/lib/utils"

import type { ContactMessage, ContactType } from "../types/contact.types"

export const contactTypeLabel: Record<ContactType, string> = { sales: "Ventes", support: "Support" }

/** Address to reply to: the one the contact asked for first, then the form's email. */
export function replyEmail(message: ContactMessage): string {
  return (message.type === "support" ? message.preferredEmail : message.professionalEmail) ?? message.email
}

export function mailtoLink(message: ContactMessage): string {
  const subject = message.type === "support" ? "Votre demande de support ToonaSHOP" : "Votre demande commerciale ToonaSHOP"
  const body = `Bonjour ${message.fullName},\n\n`
  return `mailto:${replyEmail(message)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function whatsappGreeting(message: ContactMessage): string {
  return `Bonjour ${message.fullName}, nous revenons vers vous suite à votre message envoyé à ToonaSHOP.`
}

/** Plain-text summary used by "Copier". */
export function messageToText(message: ContactMessage): string {
  const lines: [string, string | null][] = [
    ["Type", contactTypeLabel[message.type]],
    ["Nom", message.fullName],
    ["Entreprise", message.company],
    ["Email", message.email],
    ["Téléphone", message.phone],
    ["Date", message.createdAt ? `${formatDate(message.createdAt)} ${formatTime(message.createdAt)}` : null],
    ...messageDetails(message).map(({ label, value }): [string, string] => [label, value]),
  ]
  return [...lines.filter(([, value]) => value).map(([label, value]) => `${label} : ${value}`), "", message.message].join("\n")
}

/** Type-specific fields, in display order. */
export function messageDetails(message: ContactMessage): { label: string; value: string }[] {
  const yesNo = (value: boolean | null) => (value === null ? null : value ? "Oui" : "Non")
  const fields: [string, string | null][] =
    message.type === "sales"
      ? [
          ["Fonction", message.jobTitle],
          ["Email professionnel", message.professionalEmail],
          ["Pays", message.country],
          ["Commandes / mois", message.ordersPerMonth],
          ["ERP actuel", message.currentERP],
          ["Compte ToonaSHOP existant", yesNo(message.hasExistingAccount)],
        ]
      : [
          ["Motif", message.contactReason],
          ["Email préféré", message.preferredEmail],
          ["Email du compte ToonaSHOP", message.toonashopAccountEmail],
        ]
  return fields.filter((field): field is [string, string] => field[1] !== null).map(([label, value]) => ({ label, value }))
}
