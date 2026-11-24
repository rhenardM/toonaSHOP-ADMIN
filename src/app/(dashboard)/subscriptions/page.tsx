import type { Metadata } from "next"
import { Suspense } from "react"

import { HydrationGate } from "@/components/shared/hydration-gate"
import { PageContainer } from "@/components/shared/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { SubscriptionsView } from "@/features/subscriptions/components/subscriptions-view"

export const metadata: Metadata = { title: "Abonnements" }

export default function SubscriptionsPage() {
  // SubscriptionsView reads the current time: it renders at request time, behind Suspense.
  return (
    <Suspense fallback={<SubscriptionsFallback />}>
      <HydrationGate fallback={<SubscriptionsFallback />}>
        <SubscriptionsView />
      </HydrationGate>
    </Suspense>
  )
}

function SubscriptionsFallback() {
  return (
    <PageContainer>
      <Skeleton className="h-10 w-full max-w-xl bg-track" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-2xl bg-card" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-2xl bg-card" />
    </PageContainer>
  )
}
