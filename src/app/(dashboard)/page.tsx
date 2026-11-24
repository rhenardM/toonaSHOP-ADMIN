import type { Metadata } from "next"
import { Suspense } from "react"

import { HydrationGate } from "@/components/shared/hydration-gate"
import { PageContainer } from "@/components/shared/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardView } from "@/features/dashboard/components/dashboard-view"

export const metadata: Metadata = { title: "Tableau de bord" }

export default function DashboardPage() {
  // DashboardView reads the current time: it renders at request time, behind Suspense.
  return (
    <Suspense fallback={<DashboardFallback />}>
      <HydrationGate fallback={<DashboardFallback />}>
        <DashboardView />
      </HydrationGate>
    </Suspense>
  )
}

function DashboardFallback() {
  return (
    <PageContainer>
      <Skeleton className="h-12 w-72 bg-track" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(190px,1fr))] sm:gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[150px] rounded-2xl bg-card" />
        ))}
      </div>
      <Skeleton className="h-[340px] rounded-2xl bg-card" />
    </PageContainer>
  )
}
