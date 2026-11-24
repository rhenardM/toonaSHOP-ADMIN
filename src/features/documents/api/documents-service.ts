import { websiteDownload, websiteRequest } from "@/lib/api/http"
import { normalizePaginated, type PageParams, type Paginated, type RawPaginated } from "@/lib/api/pagination"

import type { DocumentLead, LibraryDocument, RawDocumentLead, RawDocumentList, UploadDocumentInput } from "../types/document.types"
import { toDocumentLead, toLibraryDocument } from "./document-adapters"

/** GET /api/documents — `{ success, count, data }`, newest first. */
export async function listDocuments(): Promise<LibraryDocument[]> {
  const raw = await websiteRequest<RawDocumentList>("/api/documents")
  return (raw?.data ?? []).map(toLibraryDocument).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
}

/** POST /api/admin/documents — multipart `title`, `description?`, `file`. */
export function uploadDocument({ title, description, file }: UploadDocumentInput): Promise<unknown> {
  const form = new FormData()
  form.append("title", title)
  if (description) form.append("description", description)
  form.append("file", file)
  return websiteRequest("/api/admin/documents", { method: "POST", body: form })
}

export function deleteDocument(id: number): Promise<unknown> {
  return websiteRequest(`/api/admin/documents/${id}`, { method: "DELETE" })
}

export type LeadParams = PageParams & { search: string }

/** GET /api/admin/document-downloads — `{ success, data, pagination: { total, page, limit, total_pages } }`. */
export async function listDocumentLeads({ page, pageSize, search }: LeadParams): Promise<Paginated<DocumentLead>> {
  const raw = await websiteRequest<RawPaginated<RawDocumentLead>>("/api/admin/document-downloads", {
    query: { page, limit: pageSize, search: search || undefined },
  })
  return normalizePaginated(raw, { page, pageSize }, toDocumentLead)
}

/** Server-side CSV export (`export=csv`), fetched through the BFF: the token stays server-side. */
export function exportDocumentLeadsCsv(search: string): Promise<Blob> {
  return websiteDownload("/api/admin/document-downloads", { query: { export: "csv", search: search || undefined } })
}
