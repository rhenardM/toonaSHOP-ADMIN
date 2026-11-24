"use client"

import { BellDot, CheckCheck, Download, Headset, Inbox, Mail, MailOpen } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { AppButton } from "@/components/shared/app-button"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { SearchInput } from "@/components/shared/search-input"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { StatGrid, StatTile } from "@/components/shared/stat-tile"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatNumber, formatShortDate, formatTime, normalizeSearchText } from "@/lib/utils"

import { useIsDesktop } from "../hooks/use-is-desktop"
import { useUnreadMessages } from "../hooks/use-unread-messages"
import { exportMessagesCsv } from "../lib/message-export"
import { contactTypeLabel } from "../lib/message-meta"
import type { ContactMessage, ContactType } from "../types/contact.types"
import { MessageDetail } from "./message-detail"

type TypeFilter = "all" | ContactType

const TYPE_OPTIONS = [
  { value: "all", label: "Tout" },
  { value: "sales", label: "Ventes" },
  { value: "support", label: "Support" },
] as const

function searchableText(m: ContactMessage): string {
  return normalizeSearchText([m.fullName, m.company, m.email, m.phone, m.message, m.country, m.contactReason].filter(Boolean).join(" "))
}

export function MessagesView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isDesktop = useIsDesktop()
  const messages = useUnreadMessages()
  const [type, setType] = useState<TypeFilter>("all")
  const [search, setSearch] = useState("")

  const all = messages.data
  const term = normalizeSearchText(search.trim())
  const filtered = useMemo(
    () => (all ?? []).filter((m) => (type === "all" || m.type === type) && (!term || searchableText(m).includes(term))),
    [all, type, term]
  )

  const selectedId = Number(searchParams.get("id"))
  const selected = Number.isFinite(selectedId) && selectedId > 0 ? (all?.find((m) => m.id === selectedId) ?? null) : null
  const missingSelection = Boolean(all && searchParams.get("id") && !selected)

  function select(id: number | null) {
    router.replace(id === null ? pathname : `${pathname}?id=${id}`, { scroll: false })
  }

  function exportCsv() {
    exportMessagesCsv(filtered, "messages-site.csv")
    toast.success("Export prêt", { description: `${formatNumber(filtered.length)} message${filtered.length > 1 ? "s" : ""} exporté${filtered.length > 1 ? "s" : ""} en CSV.` })
  }

  const salesCount = all?.filter((m) => m.type === "sales").length ?? 0
  const supportCount = all ? all.length - salesCount : 0

  return (
    <PageContainer>
      <PageIntro
        description="Demandes envoyées depuis les formulaires Ventes et Support du site ToonaSHOP. Les messages « nouveaux » sont ceux reçus depuis votre dernière lecture sur ce navigateur."
        actions={
          <>
            <AppButton icon={<CheckCheck aria-hidden="true" />} onClick={messages.markAllSeen} disabled={messages.unreadCount === 0}>
              Tout marquer comme lu
            </AppButton>
            <AppButton icon={<Download aria-hidden="true" />} onClick={exportCsv} disabled={filtered.length === 0}>
              Exporter en CSV
            </AppButton>
          </>
        }
      />

      <StatGrid>
        <StatTile label="Messages" value={formatNumber(all?.length ?? 0)} icon={Inbox} loading={messages.isPending} />
        <StatTile label="Ventes" value={formatNumber(salesCount)} icon={Mail} loading={messages.isPending} />
        <StatTile label="Support" value={formatNumber(supportCount)} icon={Headset} tone="warning" loading={messages.isPending} />
        <StatTile label="Non lus" value={formatNumber(messages.unreadCount)} icon={BellDot} tone="danger" loading={messages.isPending} />
      </StatGrid>

      {messages.isError && !all ? (
        <ErrorState error={messages.error} onRetry={() => messages.refetch()} retrying={messages.isFetching} />
      ) : (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
          <section aria-labelledby="messages-list-title" className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4">
            <h2 id="messages-list-title" className="sr-only">
              Liste des messages
            </h2>
            <SegmentedControl label="Type de message" options={TYPE_OPTIONS} value={type} onValueChange={setType} className="w-fit" />
            <SearchInput value={search} onChange={setSearch} placeholder="Nom, entreprise, email, contenu…" label="Rechercher un message" />
            {missingSelection ? (
              <p role="status" className="rounded-lg bg-warning-soft px-3 py-2 text-[12.5px] text-warning">
                Le message #{searchParams.get("id")} est introuvable.
              </p>
            ) : null}

            {messages.isPending ? (
              <div className="flex flex-col gap-2" aria-busy="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-[76px] w-full rounded-xl bg-track" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={term || type !== "all" ? "Aucun résultat" : "Aucun message"}
                description={term || type !== "all" ? "Modifiez le filtre ou la recherche." : "Les messages du site apparaîtront ici."}
              />
            ) : (
              <ul className="-mx-1 flex flex-col gap-1 lg:max-h-[calc(100dvh-320px)] lg:min-h-[420px] lg:overflow-y-auto" aria-label={`${filtered.length} messages`}>
                {filtered.map((m) => (
                  <li key={m.id} className="px-1">
                    <MessageRow message={m} unread={messages.isUnread(m)} active={selected?.id === m.id} onSelect={() => select(m.id)} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Détail du message" className="hidden min-w-0 rounded-2xl border bg-card p-5 sm:p-6 lg:block">
            {selected ? (
              <MessageDetail message={selected} unread={messages.isUnread(selected)} titleId="message-detail-title" />
            ) : (
              <EmptyState
                icon={MailOpen}
                title="Sélectionnez un message"
                description="Le détail, les coordonnées et les actions de réponse s’affichent ici."
                className="h-full py-16"
              />
            )}
          </section>
        </div>
      )}

      <Sheet open={!isDesktop && selected !== null} onOpenChange={(open) => !open && select(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto p-5 pt-12 data-[side=right]:sm:max-w-lg">
          <SheetTitle className="sr-only">{selected ? `Message de ${selected.fullName}` : "Message"}</SheetTitle>
          {selected ? <MessageDetail message={selected} unread={messages.isUnread(selected)} titleId="message-sheet-title" /> : null}
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

function MessageRow({ message: m, unread, active, onSelect }: { message: ContactMessage; unread: boolean; active: boolean; onSelect: () => void }) {
  const Icon = m.type === "support" ? Headset : Mail
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        active ? "bg-brand-soft" : "hover:bg-surface-subtle"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
          active ? "bg-card text-brand" : unread ? "bg-brand-soft text-brand" : "bg-secondary text-muted-foreground"
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("truncate text-[13.5px] text-ink", unread ? "font-bold" : "font-medium")}>
            {m.fullName}
            {m.company ? <span className="font-normal text-muted-foreground"> · {m.company}</span> : null}
          </span>
          {m.createdAt ? (
            <span className="shrink-0 text-[11.5px] whitespace-nowrap text-muted-foreground">
              {formatShortDate(m.createdAt)} {formatTime(m.createdAt)}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 flex items-start gap-2">
          <span className="line-clamp-2 flex-1 text-[12.5px] leading-snug text-muted-foreground">
            {contactTypeLabel[m.type]} · {m.message}
          </span>
          {unread ? (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-orange">
              <span className="sr-only">Nouveau</span>
            </span>
          ) : null}
        </span>
      </span>
    </button>
  )
}
