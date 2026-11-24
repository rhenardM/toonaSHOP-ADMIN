import type { Metadata } from "next"
import { Suspense } from "react"

import { HydrationGate } from "@/components/shared/hydration-gate"
import { PageContainer } from "@/components/shared/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { MessagesView } from "@/features/messages/components/messages-view"

export const metadata: Metadata = { title: "Messages" }

export default function MessagesPage() {
  // MessagesView reads ?id= (deep links from notifications): search params need a Suspense boundary.
  return (
    <Suspense fallback={<MessagesFallback />}>
      <HydrationGate fallback={<MessagesFallback />}>
        <MessagesView />
      </HydrationGate>
    </Suspense>
  )
}

function MessagesFallback() {
  return (
    <PageContainer>
      <Skeleton className="h-10 w-full max-w-xl bg-track" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-2xl bg-card" />
        ))}
      </div>
      <Skeleton className="h-[480px] rounded-2xl bg-card" />
    </PageContainer>
  )
}
