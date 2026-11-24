import type { Metadata } from "next"

import { PlansView } from "@/features/plans/components/plans-view"

export const metadata: Metadata = { title: "Plans" }

export default function PlansPage() {
  return <PlansView />
}
