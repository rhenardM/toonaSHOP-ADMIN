"use client"

import { Package, Receipt, ShoppingCart, Wallet } from "lucide-react"
import type { ReactNode } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { QuerySection } from "@/components/shared/query-section"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DEFAULT_CURRENCY } from "@/lib/constants/app"
import { formatCurrency, formatNumber } from "@/lib/utils"

import { useImfAnalytics } from "../hooks/use-imf"
import type { ImfGroup } from "../types/imf.types"
import { TopProductsChart } from "./top-products-chart"

interface ImfAnalyticsSheetProps {
  group: ImfGroup | null
  onOpenChange: (open: boolean) => void
}

/** Side panel with GET /imf/analytics/{groupId}. */
export function ImfAnalyticsSheet({ group, onOpenChange }: ImfAnalyticsSheetProps) {
  const analytics = useImfAnalytics(group?.id ?? null)

  return (
    <Sheet open={group !== null} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b border-divider p-5 pr-12">
          <SheetTitle className="text-lg font-extrabold text-ink">{group?.name ?? "IMF"}</SheetTitle>
          <SheetDescription>Indicateurs de ventes de l’institution{group ? ` · ID ${group.id}` : ""}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 p-5">
          <QuerySection query={analytics} skeletonClassName="h-[360px] rounded-xl">
            {(data) => (
              <>
                <dl className="grid gap-3 sm:grid-cols-3">
                  <Figure icon={<ShoppingCart aria-hidden="true" />} label="Ventes" value={formatNumber(data.totalSales)} />
                  <Figure icon={<Wallet aria-hidden="true" />} label="Chiffre d’affaires" value={formatCurrency(data.totalRevenue, DEFAULT_CURRENCY)} />
                  <Figure icon={<Receipt aria-hidden="true" />} label="Panier moyen" value={formatCurrency(data.averageTransaction, DEFAULT_CURRENCY)} />
                </dl>

                <section aria-labelledby="imf-top-products-title" className="flex flex-col gap-3">
                  <div>
                    <h3 id="imf-top-products-title" className="text-[15px] font-extrabold text-ink">
                      Produits les plus vendus
                    </h3>
                    <p className="text-[12.5px] text-muted-foreground">Classés par quantité vendue</p>
                  </div>
                  {data.topProducts.length > 0 ? (
                    <TopProductsChart products={data.topProducts} />
                  ) : (
                    <EmptyState icon={Package} title="Aucune vente enregistrée" description="Les produits apparaîtront dès les premières ventes." />
                  )}
                </section>
              </>
            )}
          </QuerySection>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Figure({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border p-3.5 sm:flex-col sm:items-start sm:gap-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[12px] font-semibold text-muted-foreground">{label}</dt>
        <dd className="text-[16px] font-extrabold tracking-[-0.01em] break-words text-ink tabular-nums">{value}</dd>
      </div>
    </div>
  )
}
