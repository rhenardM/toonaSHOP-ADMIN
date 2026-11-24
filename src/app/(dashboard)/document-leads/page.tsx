import type { Metadata } from "next"

import { DocumentLeadsView } from "@/features/documents/components/document-leads-view"

export const metadata: Metadata = { title: "Leads" }

export default function DocumentLeadsPage() {
  return <DocumentLeadsView />
}
