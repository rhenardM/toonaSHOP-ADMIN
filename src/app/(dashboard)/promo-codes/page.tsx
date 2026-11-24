import type { Metadata } from "next"

import { PromoCodesView } from "@/features/promo-codes/components/promo-codes-view"

export const metadata: Metadata = { title: "Codes promo" }

export default function PromoCodesPage() {
  return <PromoCodesView />
}
