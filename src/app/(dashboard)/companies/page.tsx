import type { Metadata } from "next"

import { CompaniesListView } from "@/features/companies/components/companies-list-view"

export const metadata: Metadata = { title: "Entreprises" }

export default function CompaniesPage() {
  return <CompaniesListView />
}
