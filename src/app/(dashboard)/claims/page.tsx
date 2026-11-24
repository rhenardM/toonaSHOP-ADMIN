import type { Metadata } from "next"

import { ClaimsView } from "@/features/claims/components/claims-view"

export const metadata: Metadata = { title: "Réclamations" }

export default function Page() {
  return <ClaimsView />
}
