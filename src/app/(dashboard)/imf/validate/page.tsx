import type { Metadata } from "next"

import { ImfValidateView } from "@/features/imf/components/imf-validate-view"

export const metadata: Metadata = { title: "Valider un groupe IMF" }

export default function Page() {
  return <ImfValidateView />
}
