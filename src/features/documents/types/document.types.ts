import type { IsoDate } from "@/types/domain"

/** Raw library document (GET /api/documents, website API spec §6.2). */
export interface RawLibraryDocument {
  id: number | string
  title?: string | null
  description?: string | null
  file_type?: string | null
  /** A string in the spec: either a byte count or an already formatted size. */
  file_size?: string | number | null
  is_active?: boolean | null
  created_at?: string | null
}

export interface RawDocumentList {
  success?: boolean
  count?: number
  data?: RawLibraryDocument[] | null
}

/** Named to avoid clashing with the DOM `Document` type. */
export interface LibraryDocument {
  id: number
  title: string
  description: string | null
  /** Lower-case extension ("pdf", "xlsx"…) when it can be derived, else the raw type. */
  fileType: string
  /** Human-readable size: byte counts are formatted, other strings kept as sent. */
  fileSizeLabel: string | null
  isActive: boolean
  createdAt: IsoDate | null
}

export interface UploadDocumentInput {
  title: string
  description?: string
  file: File
}

/** Raw lead (GET /api/admin/document-downloads, website API spec §6.3). */
export interface RawDocumentLead {
  id: number | string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  company_size?: string | null
  marketing_opt_in?: boolean | null
  document_title?: string | null
  downloaded?: boolean | null
  email_sent?: boolean | null
  expires_at?: string | null
  created_at?: string | null
}

export interface DocumentLead {
  id: number
  fullName: string
  email: string
  phone: string | null
  country: string | null
  companySize: string | null
  marketingOptIn: boolean
  documentTitle: string | null
  downloaded: boolean
  emailSent: boolean
  expiresAt: IsoDate | null
  createdAt: IsoDate | null
}
