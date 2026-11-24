import type { Metadata } from "next"

import { PaymentsView } from "@/features/payments/components/payments-view"

export const metadata: Metadata = { title: "Paiements" }

export default function PaymentsPage() {
  return <PaymentsView />
}
