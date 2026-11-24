import type { Metadata } from "next"

import { ImfApprovedView } from "@/features/imf/components/imf-approved-view"

export const metadata: Metadata = { title: "IMF approuvées" }

export default function Page() {
  return <ImfApprovedView />
}
