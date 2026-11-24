"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeCheck, Mail, MapPin, Phone, Search, SearchX } from "lucide-react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AnalyticsCard } from "@/components/shared/analytics-card"
import { AppButton } from "@/components/shared/app-button"
import { Field, FormAlert, inputClass } from "@/components/shared/form-controls"
import { InitialsTile } from "@/components/shared/initials-tile"
import { PageContainer, PageIntro } from "@/components/shared/page-container"
import { StatusPill } from "@/components/shared/status-pill"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { useGroupInfo } from "../hooks/use-imf"
import type { GroupInfo } from "../types/imf.types"
import { ApproveImfDialog } from "./approve-imf-dialog"

const lookupSchema = z.object({
  groupId: z
    .string()
    .trim()
    .min(1, "Saisissez l’ID du groupe.")
    .regex(/^[1-9]\d*$/, "L’ID doit être un nombre entier positif."),
})
type LookupValues = z.infer<typeof lookupSchema>

export function ImfValidateView() {
  const [groupId, setGroupId] = useState<number | null>(null)
  const [approving, setApproving] = useState<GroupInfo | null>(null)
  const group = useGroupInfo(groupId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupValues>({ resolver: zodResolver(lookupSchema), defaultValues: { groupId: "" } })

  const onSubmit = handleSubmit((values) => {
    const id = Number(values.groupId)
    if (id === groupId) void group.refetch()
    else setGroupId(id)
  })

  return (
    <PageContainer>
      <PageIntro description="Recherchez un groupe par son identifiant pour vérifier ses informations et lui attribuer le statut IMF." />

      <AnalyticsCard id="imf-lookup" title="Rechercher un groupe" description="L’ID figure sur la fiche entreprise et dans les demandes reçues." className="gap-4">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="sm:w-[280px]">
            <Field id="imf-group-id" label="ID du groupe" error={errors.groupId?.message}>
              <input
                id="imf-group-id"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ex. 128"
                aria-invalid={errors.groupId ? true : undefined}
                aria-describedby={errors.groupId ? "imf-group-id-error" : undefined}
                className={inputClass}
                {...register("groupId")}
              />
            </Field>
          </div>
          <AppButton type="submit" variant="primary" icon={<Search aria-hidden="true" />} pending={group.isFetching} className="h-11 sm:mt-[26px]">
            Rechercher
          </AppButton>
        </form>
      </AnalyticsCard>

      {groupId !== null ? <LookupResult query={group} groupId={groupId} onApprove={setApproving} /> : null}

      <ApproveImfDialog group={approving} onOpenChange={(open) => !open && setApproving(null)} />
    </PageContainer>
  )
}

interface LookupResultProps {
  query: ReturnType<typeof useGroupInfo>
  groupId: number
  onApprove: (group: GroupInfo) => void
}

function LookupResult({ query, groupId, onApprove }: LookupResultProps) {
  if (query.isPending) return <Skeleton className="h-[200px] rounded-2xl bg-card" aria-busy="true" />

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.kind === "not-found"
    return (
      <section role="alert" className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <SearchX className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[15px] font-extrabold text-ink">{notFound ? "Groupe introuvable" : "Recherche impossible"}</p>
          <p className="mt-1 max-w-md text-[13px] text-muted-foreground">
            {notFound ? `Aucun groupe ne correspond à l’ID ${groupId}. Vérifiez l’identifiant saisi.` : getErrorMessage(query.error)}
          </p>
        </div>
        {notFound ? null : (
          <AppButton onClick={() => query.refetch()} pending={query.isFetching}>
            Réessayer
          </AppButton>
        )}
      </section>
    )
  }

  const g = query.data
  return (
    <section aria-labelledby="imf-group-title" className={cn("flex flex-col gap-5 rounded-2xl border bg-card p-5 transition-opacity sm:p-6", query.isFetching && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <InitialsTile name={g.name} className="size-12 rounded-xl text-[15px]" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 id="imf-group-title" className="text-xl font-extrabold tracking-[-0.01em] break-words text-ink">
                {g.name}
              </h2>
              {g.isImf ? <StatusPill tone="success">IMF</StatusPill> : null}
              {g.status ? <StatusPill tone="neutral">{g.status}</StatusPill> : null}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">ID {g.id}</p>
          </div>
        </div>
        {g.isImf ? null : (
          <AppButton variant="primary" icon={<BadgeCheck aria-hidden="true" />} onClick={() => onApprove(g)}>
            Approuver comme IMF
          </AppButton>
        )}
      </div>

      <dl className="grid gap-x-6 gap-y-4 border-t border-divider pt-5 sm:grid-cols-3">
        <Detail icon={<Phone aria-hidden="true" />} label="Contact" value={g.phone ?? "—"} />
        <Detail icon={<Mail aria-hidden="true" />} label="Email" value={g.email ? <span className="break-all">{g.email}</span> : "—"} />
        <Detail icon={<MapPin aria-hidden="true" />} label="Adresse" value={g.address ?? "—"} />
      </dl>

      {g.isImf ? (
        <FormAlert tone="info">
          Ce groupe est déjà une institution de microfinance : aucune approbation n’est nécessaire.{" "}
          <Link href="/imf/approved" className="font-bold underline underline-offset-2">
            Voir les IMF approuvées
          </Link>
        </FormAlert>
      ) : null}
    </section>
  )
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-ink-soft [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[12px] text-muted-foreground">{label}</dt>
        <dd className="text-[13.5px] font-semibold break-words text-ink">{value}</dd>
      </div>
    </div>
  )
}
