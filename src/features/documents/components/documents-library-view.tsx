"use client"

import { FileUp, Library, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { QuerySection } from "@/components/shared/query-section"
import { SearchInput } from "@/components/shared/search-input"
import { StatusPill } from "@/components/shared/status-pill"
import { cn, formatDate, formatNumber, normalizeSearchText } from "@/lib/utils"

import { useDocuments } from "../hooks/use-documents"
import { fileKind } from "../lib/document-files"
import type { LibraryDocument } from "../types/document.types"
import { DeleteDocumentDialog } from "./delete-document-dialog"
import { UploadDocumentDialog } from "./upload-document-dialog"

export function DocumentsLibraryView() {
  const documents = useDocuments()
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<LibraryDocument | null>(null)

  const term = normalizeSearchText(search.trim())
  const filtered = useMemo(
    () =>
      (documents.data ?? []).filter(
        (d) => !term || normalizeSearchText(`${d.title} ${d.description ?? ""} ${d.fileType}`).includes(term)
      ),
    [documents.data, term]
  )

  const total = documents.data?.length

  return (
    <PageContainer>
      <PageIntro
        description="Livres blancs, guides et modèles téléchargeables sur le site ToonaSHOP. Chaque téléchargement crée un lead."
        actions={
          <AppButton variant="primary" icon={<FileUp aria-hidden="true" />} onClick={() => setUploading(true)}>
            Ajouter un document
          </AppButton>
        }
      />

      <AnalyticsCard
        id="documents-library"
        title="Bibliothèque"
        description={total === undefined ? "Chargement…" : `${formatNumber(total)} document${total > 1 ? "s" : ""}`}
        action={
          <SearchInput value={search} onChange={setSearch} placeholder="Titre, description, format…" label="Rechercher un document" className="w-full sm:w-[280px]" />
        }
        className="gap-4"
      >
        <QuerySection query={documents} skeletonClassName="h-[260px] rounded-xl">
          {(all) =>
            all.length === 0 ? (
              <EmptyState
                icon={Library}
                title="Aucun document"
                description="Publiez un premier document pour le proposer sur le site."
                action={
                  <AppButton variant="primary" icon={<FileUp aria-hidden="true" />} onClick={() => setUploading(true)}>
                    Ajouter un document
                  </AppButton>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState icon={Library} title="Aucun résultat" description="Essayez un autre titre ou format." />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((d) => (
                  <li key={d.id}>
                    <DocumentCard document={d} onDelete={setDeleting} />
                  </li>
                ))}
              </ul>
            )
          }
        </QuerySection>
      </AnalyticsCard>

      <UploadDocumentDialog open={uploading} onOpenChange={setUploading} />
      <DeleteDocumentDialog document={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </PageContainer>
  )
}

function DocumentCard({ document: d, onDelete }: { document: LibraryDocument; onDelete: (document: LibraryDocument) => void }) {
  const kind = fileKind(d.fileType)
  const Icon = kind.icon
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-divider p-4">
      <div className="flex items-start gap-3">
        <span className={cn("flex size-11 shrink-0 flex-col items-center justify-center rounded-xl", kind.className)}>
          <Icon className="size-[18px]" aria-hidden="true" />
          <span className="text-[9px] leading-tight font-extrabold">{kind.label}</span>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-bold break-words text-ink">{d.title}</h3>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {[d.fileSizeLabel, d.createdAt ? `ajouté le ${formatDate(d.createdAt)}` : null].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <AppButton variant="ghost" size="icon" onClick={() => onDelete(d)} aria-label={`Supprimer ${d.title}`} className="hover:bg-danger-soft hover:text-danger-strong">
          <Trash2 aria-hidden="true" />
        </AppButton>
      </div>
      {d.description ? <p className="line-clamp-3 text-[13px] break-words text-ink-soft">{d.description}</p> : null}
      <div className="mt-auto flex flex-wrap gap-2">
        <StatusPill tone="neutral">{kind.label}</StatusPill>
        <StatusPill tone={d.isActive ? "success" : "neutral"}>{d.isActive ? "Publié" : "Masqué"}</StatusPill>
      </div>
    </article>
  )
}
