import type { Metadata } from "next"

import { DocumentsLibraryView } from "@/features/documents/components/documents-library-view"

export const metadata: Metadata = { title: "Bibliothèque" }

export default function DocumentsPage() {
  return <DocumentsLibraryView />
}
