import { downloadFile, formatDate, formatTime, toCsv } from "@/lib/utils"

import type { ContactMessage } from "../types/contact.types"
import { contactTypeLabel } from "./message-meta"

const yesNo = (value: boolean | null) => (value === null ? "" : value ? "Oui" : "Non")

/** CSV export of website contact messages (semicolon-separated, UTF-8 BOM for Excel). */
export function exportMessagesCsv(messages: ContactMessage[], filename: string) {
  const csv = toCsv(
    messages.map((m) => ({
      id: m.id,
      date: m.createdAt ? `${formatDate(m.createdAt)} ${formatTime(m.createdAt)}` : "",
      type: contactTypeLabel[m.type],
      name: m.fullName,
      company: m.company ?? "",
      email: m.email,
      phone: m.phone ?? "",
      jobTitle: m.jobTitle ?? "",
      professionalEmail: m.professionalEmail ?? "",
      country: m.country ?? "",
      ordersPerMonth: m.ordersPerMonth ?? "",
      currentERP: m.currentERP ?? "",
      hasExistingAccount: yesNo(m.hasExistingAccount),
      contactReason: m.contactReason ?? "",
      preferredEmail: m.preferredEmail ?? "",
      toonashopAccountEmail: m.toonashopAccountEmail ?? "",
      emailSent: yesNo(m.emailSent),
      whatsappSent: yesNo(m.whatsappSent),
      message: m.message,
    })),
    [
      { key: "id", label: "ID" },
      { key: "date", label: "Date" },
      { key: "type", label: "Type" },
      { key: "name", label: "Nom" },
      { key: "company", label: "Entreprise" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Téléphone" },
      { key: "jobTitle", label: "Fonction" },
      { key: "professionalEmail", label: "Email professionnel" },
      { key: "country", label: "Pays" },
      { key: "ordersPerMonth", label: "Commandes / mois" },
      { key: "currentERP", label: "ERP actuel" },
      { key: "hasExistingAccount", label: "Compte existant" },
      { key: "contactReason", label: "Motif" },
      { key: "preferredEmail", label: "Email préféré" },
      { key: "toonashopAccountEmail", label: "Email du compte ToonaSHOP" },
      { key: "emailSent", label: "Email envoyé" },
      { key: "whatsappSent", label: "WhatsApp envoyé" },
      { key: "message", label: "Message" },
    ]
  )
  downloadFile(csv, filename)
}
