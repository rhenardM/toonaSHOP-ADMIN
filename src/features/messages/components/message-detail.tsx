"use client"

import { Building2, Check, Copy, Mail, MessageCircle, Minus, Phone } from "lucide-react"
import type { ReactNode } from "react"
import { toast } from "sonner"

import { AppButton, appButtonVariants } from "@/components/shared/app-button"
import { StatusPill } from "@/components/shared/status-pill"
import { whatsappLink } from "@/config/env"
import { cn, formatLongDate, formatTime } from "@/lib/utils"

import { contactTypeLabel, mailtoLink, messageDetails, messageToText, replyEmail, whatsappGreeting } from "../lib/message-meta"
import type { ContactMessage } from "../types/contact.types"

interface MessageDetailProps {
  message: ContactMessage
  unread: boolean
  /** Id of the heading, so a Sheet or region can reference it. */
  titleId: string
}

export function MessageDetail({ message, unread, titleId }: MessageDetailProps) {
  const whatsapp = message.phone ? whatsappLink(message.phone, whatsappGreeting(message)) : null
  const details = messageDetails(message)

  async function copy() {
    try {
      await navigator.clipboard.writeText(messageToText(message))
      toast.success("Message copié")
    } catch {
      toast.error("Copie impossible", { description: "Le presse-papiers n’est pas accessible depuis ce navigateur." })
    }
  }

  return (
    <article className="flex min-w-0 flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={message.type === "sales" ? "brand" : "warning"}>{contactTypeLabel[message.type]}</StatusPill>
          {unread ? <StatusPill tone="solid">Nouveau</StatusPill> : null}
        </div>
        <h2 id={titleId} className="text-xl font-extrabold tracking-[-0.01em] break-words text-ink">
          {message.fullName}
        </h2>
        {message.createdAt ? (
          <p className="text-[13px] text-muted-foreground">
            Reçu le {formatLongDate(message.createdAt)} à {formatTime(message.createdAt)}
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-2">
        <a href={mailtoLink(message)} className={appButtonVariants({ variant: "primary" })}>
          <Mail aria-hidden="true" />
          Répondre par email
        </a>
        {whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={appButtonVariants({ variant: "outline" })}>
            <MessageCircle aria-hidden="true" />
            WhatsApp
          </a>
        ) : (
          <AppButton icon={<MessageCircle aria-hidden="true" />} disabled title="Aucun numéro de téléphone">
            WhatsApp
          </AppButton>
        )}
        <AppButton icon={<Copy aria-hidden="true" />} onClick={copy}>
          Copier
        </AppButton>
      </div>

      <dl className="grid gap-x-6 gap-y-4 rounded-xl bg-surface-subtle p-4 sm:grid-cols-2">
        <Detail icon={<Mail aria-hidden="true" />} label="Email">
          <a href={`mailto:${replyEmail(message)}`} className="break-all hover:text-brand">
            {message.email}
          </a>
        </Detail>
        <Detail icon={<Phone aria-hidden="true" />} label="Téléphone">
          {message.phone ? (
            <a href={`tel:${message.phone}`} className="hover:text-brand">
              {message.phone}
            </a>
          ) : (
            "—"
          )}
        </Detail>
        <Detail icon={<Building2 aria-hidden="true" />} label="Entreprise">
          {message.company ?? "—"}
        </Detail>
        {details.map((field) => (
          <Detail key={field.label} label={field.label}>
            <span className="break-words">{field.value}</span>
          </Detail>
        ))}
      </dl>

      <section aria-label="Message" className="rounded-xl border border-divider p-4">
        <p className="text-[14px] leading-relaxed break-words whitespace-pre-line text-ink">{message.message || "—"}</p>
      </section>

      <div className="flex flex-wrap gap-4 text-[12.5px]">
        <Flag value={message.emailSent} label="Notification email envoyée" />
        <Flag value={message.whatsappSent} label="Notification WhatsApp envoyée" />
      </div>
    </article>
  )
}

function Detail({ icon, label, children }: { icon?: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 gap-3">
      {icon ? (
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-ink-soft [&_svg]:size-4">{icon}</span>
      ) : null}
      <div className="min-w-0">
        <dt className="text-[12px] text-muted-foreground">{label}</dt>
        <dd className="text-[13.5px] font-semibold text-ink">{children}</dd>
      </div>
    </div>
  )
}

function Flag({ value, label }: { value: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", value ? "text-ink-soft" : "text-muted-foreground")}>
      {value ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Minus className="size-3.5" aria-hidden="true" />}
      {label}
      <span className="sr-only"> : {value ? "oui" : "non"}</span>
    </span>
  )
}
