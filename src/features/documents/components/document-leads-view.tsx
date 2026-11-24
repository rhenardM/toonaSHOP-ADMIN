"use client"

import { Check, Download, Minus, UserRoundSearch } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { type DataColumn, DataTable } from "@/components/shared/data-table"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SearchInput } from "@/components/shared/search-input"
import { StatusPill } from "@/components/shared/status-pill"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getErrorMessage } from "@/lib/api/errors"
import { formatDate, formatNumber, formatTime } from "@/lib/utils"

import { exportDocumentLeadsCsv } from "../api/documents-service"
import { useDocumentLeads } from "../hooks/use-documents"
import { saveBlob } from "@/lib/utils"
import type { DocumentLead } from "../types/document.types"

function Flag({ value, label }: { value: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] whitespace-nowrap">
      {value ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Minus className="size-3.5 text-muted-foreground" aria-hidden="true" />}
      <span className={value ? "text-ink-soft" : "text-muted-foreground"}>
        {label}
        <span className="sr-only"> : {value ? "oui" : "non"}</span>
      </span>
    </span>
  )
}

const columns: DataColumn<DocumentLead>[] = [
  {
    id: "name",
    header: "Contact",
    cell: (l) => (
      <>
        <span className="block font-bold text-ink">{l.fullName}</span>
        <a href={`mailto:${l.email}`} onClick={(e) => e.stopPropagation()} className="block max-w-[220px] truncate text-xs text-muted-foreground hover:text-brand">
          {l.email}
        </a>
      </>
    ),
  },
  { id: "phone", header: "Téléphone", cell: (l) => <span className="whitespace-nowrap text-ink-soft">{l.phone ?? "—"}</span> },
  { id: "country", header: "Pays", cell: (l) => <span className="text-ink-soft">{l.country ?? "—"}</span> },
  { id: "size", header: "Taille", cell: (l) => <span className="whitespace-nowrap text-ink-soft">{l.companySize ? `${l.companySize} pers.` : "—"}</span> },
  { id: "document", header: "Document", cell: (l) => <span className="block max-w-[220px] truncate text-ink-soft">{l.documentTitle ?? "—"}</span> },
  {
    id: "optin",
    header: "Marketing",
    cell: (l) => <StatusPill tone={l.marketingOptIn ? "success" : "neutral"}>{l.marketingOptIn ? "Accepté" : "Refusé"}</StatusPill>,
  },
  {
    id: "flags",
    header: "Suivi",
    cell: (l) => (
      <span className="flex flex-col gap-1">
        <Flag value={l.downloaded} label="Téléchargé" />
        <Flag value={l.emailSent} label="Email envoyé" />
      </span>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: (l) =>
      l.createdAt ? (
        <span className="whitespace-nowrap text-ink-soft">
          {formatDate(l.createdAt)}
          <span className="block text-xs text-muted-foreground">{formatTime(l.createdAt)}</span>
        </span>
      ) : (
        "—"
      ),
  },
]

export function DocumentLeadsView() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [exporting, setExporting] = useState(false)

  const effectiveSearch = useDebouncedValue(search).trim()
  const leads = useDocumentLeads({ page, pageSize, search: effectiveSearch })
  const result = leads.data

  async function exportCsv() {
    setExporting(true)
    try {
      const blob = await exportDocumentLeadsCsv(effectiveSearch)
      saveBlob(blob, "leads-documents.csv")
      toast.success("Export prêt", { description: effectiveSearch ? `Leads correspondant à « ${effectiveSearch} ».` : "Tous les leads ont été exportés." })
    } catch (error) {
      toast.error("Export impossible", { description: getErrorMessage(error) })
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageContainer>
      <PageIntro
        description="Visiteurs du site ayant téléchargé un document de la bibliothèque, avec leur consentement marketing."
        actions={
          <AppButton icon={<Download aria-hidden="true" />} pending={exporting} onClick={exportCsv}>
            {effectiveSearch ? "Exporter la sélection" : "Exporter en CSV"}
          </AppButton>
        }
      />

      <AnalyticsCard
        id="document-leads"
        title="Leads"
        description={result ? `${formatNumber(result.total)} lead${result.total > 1 ? "s" : ""}${effectiveSearch ? ` pour « ${effectiveSearch} »` : ""}` : "Chargement…"}
        action={
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Nom, email, entreprise…"
            label="Rechercher un lead"
            className="w-full sm:w-[300px]"
          />
        }
        className="gap-4"
      >
        <DataTable
          caption="Leads issus des téléchargements de documents"
          columns={columns}
          rows={result?.items}
          getRowId={(l) => l.id}
          isLoading={leads.isPending}
          isRefreshing={leads.isPlaceholderData}
          error={leads.error}
          onRetry={() => leads.refetch()}
          minWidth={1080}
          empty={{
            icon: UserRoundSearch,
            title: effectiveSearch ? "Aucun résultat" : "Aucun lead",
            description: effectiveSearch ? "Essayez un autre nom ou email." : "Les téléchargements de documents apparaîtront ici.",
          }}
          renderMobileCard={(l) => (
            <div className="flex flex-col gap-1.5 rounded-xl border border-divider p-3.5">
              <span className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate font-bold text-ink">{l.fullName}</span>
                  <a href={`mailto:${l.email}`} className="block truncate text-[12.5px] text-muted-foreground hover:text-brand">
                    {l.email}
                  </a>
                </span>
                <StatusPill tone={l.marketingOptIn ? "success" : "neutral"}>{l.marketingOptIn ? "Opt-in" : "Sans opt-in"}</StatusPill>
              </span>
              {l.documentTitle ? <span className="truncate text-[12.5px] text-ink-soft">{l.documentTitle}</span> : null}
              <span className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-soft">
                {l.phone ? <span>{l.phone}</span> : null}
                {l.country ? <span>{l.country}</span> : null}
                {l.companySize ? <span>{l.companySize} pers.</span> : null}
                {l.createdAt ? <span>{formatDate(l.createdAt)}</span> : null}
              </span>
              <span className="flex flex-wrap gap-3">
                <Flag value={l.downloaded} label="Téléchargé" />
                <Flag value={l.emailSent} label="Email envoyé" />
              </span>
            </div>
          )}
        />
        {result && result.total > 0 ? (
          <PaginationBar
            page={page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            itemLabel="leads"
          />
        ) : null}
      </AnalyticsCard>
    </PageContainer>
  )
}
