import type { Metadata } from "next"

import { ImfPendingView } from "@/features/imf/components/imf-pending-view"

export const metadata: Metadata = { title: "IMF en attente" }

export default function Page() {
  return <ImfPendingView />
}
