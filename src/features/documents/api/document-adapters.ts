import { toIsoDate, toNumber, toOptionalText, toText } from "@/lib/api/normalize"

import { formatFileSize, normalizeFileType } from "../lib/document-files"
import type { DocumentLead, LibraryDocument, RawDocumentLead, RawLibraryDocument } from "../types/document.types"

export function toLibraryDocument(raw: RawLibraryDocument): LibraryDocument {
  const size = toText(raw.file_size)
  const bytes = /^\d+$/.test(size) ? Number(size) : null
  return {
    id: toNumber(raw.id),
    title: toText(raw.title) || `Document #${raw.id}`,
    description: toOptionalText(raw.description),
    fileType: normalizeFileType(toText(raw.file_type)),
    fileSizeLabel: bytes !== null ? formatFileSize(bytes) : size || null,
    isActive: raw.is_active !== false,
    createdAt: toIsoDate(raw.created_at),
  }
}

export function toDocumentLead(raw: RawDocumentLead): DocumentLead {
  const email = toText(raw.email)
  return {
    id: toNumber(raw.id),
    fullName: [toText(raw.first_name), toText(raw.last_name)].filter(Boolean).join(" ") || email || `Lead #${raw.id}`,
    email,
    phone: toOptionalText(raw.phone),
    country: toOptionalText(raw.country),
    companySize: toOptionalText(raw.company_size),
    marketingOptIn: raw.marketing_opt_in === true,
    documentTitle: toOptionalText(raw.document_title),
    downloaded: raw.downloaded === true,
    emailSent: raw.email_sent === true,
    expiresAt: toIsoDate(raw.expires_at),
    createdAt: toIsoDate(raw.created_at),
  }
}
