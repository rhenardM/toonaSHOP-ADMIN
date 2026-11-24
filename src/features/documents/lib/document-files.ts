import { File as FileIcon, FileSpreadsheet, FileText, type LucideIcon, Presentation } from "lucide-react"

import { APP_LOCALE } from "@/lib/constants/app"

/** Formats accepted by the upload form (website API library). */
export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"] as const
export const ACCEPT_ATTRIBUTE = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")
/** Same ceiling as the legacy upload modal. */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

const MIME_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".")
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ""
}

/** "application/pdf", ".PDF" or "pdf" → "pdf". Unknown values are returned lower-cased. */
export function normalizeFileType(value: string): string {
  const type = value.trim().toLowerCase()
  return MIME_EXTENSIONS[type] ?? type.replace(/^\./, "")
}

interface FileKind {
  label: string
  icon: LucideIcon
  className: string
}

export function fileKind(fileType: string): FileKind {
  const label = fileType ? fileType.toUpperCase() : "FICHIER"
  if (fileType === "pdf") return { label, icon: FileText, className: "bg-danger-soft text-danger" }
  if (fileType === "doc" || fileType === "docx") return { label, icon: FileText, className: "bg-brand-soft text-brand" }
  if (fileType === "xls" || fileType === "xlsx") return { label, icon: FileSpreadsheet, className: "bg-success-soft text-success" }
  if (fileType === "ppt" || fileType === "pptx") return { label, icon: Presentation, className: "bg-warning-soft text-warning" }
  return { label, icon: FileIcon, className: "bg-track text-ink-soft" }
}

const SIZE_UNITS = ["o", "Ko", "Mo", "Go"]

/** 2_400_000 → "2,3 Mo" */
export function formatFileSize(bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024
    unit++
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1
  return `${value.toLocaleString(APP_LOCALE, { maximumFractionDigits: digits })} ${SIZE_UNITS[unit]}`
}

/** Saves a downloaded Blob under the given name (object URL, no token in any URL). */
