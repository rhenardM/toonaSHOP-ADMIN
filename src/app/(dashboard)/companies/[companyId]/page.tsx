import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { HydrationGate } from "@/components/shared/hydration-gate"
import { PageContainer } from "@/components/shared/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { CompanyDetailView } from "@/features/companies/components/company-detail-view"

export const metadata: Metadata = { title: "Fiche entreprise" }

export default function CompanyPage({ params }: PageProps<"/companies/[companyId]">) {
  // The id is request-time data: resolve it behind Suspense so the shell stays prerendered.
  return (
    <Suspense fallback={<CompanyFallback />}>
      <ResolvedCompany params={params} />
    </Suspense>
  )
}

async function ResolvedCompany({ params }: Pick<PageProps<"/companies/[companyId]">, "params">) {
  const { companyId } = await params
  const id = Number(companyId)
  if (!Number.isInteger(id) || id <= 0) notFound()
  return (
    <HydrationGate fallback={<CompanyFallback />}>
      <CompanyDetailView companyId={id} />
    </HydrationGate>
  )
}

function CompanyFallback() {
  return (
    <PageContainer>
      <Skeleton className="h-[160px] rounded-2xl bg-card" />
    </PageContainer>
  )
}
