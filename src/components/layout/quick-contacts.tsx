"use client"

import { MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { env, whatsappLink } from "@/config/env"
import { cn } from "@/lib/utils"

const contacts = [
  {
    key: "sales",
    label: "Ventes",
    number: env.whatsapp.sales,
    envName: "NEXT_PUBLIC_WA_SALES",
    className: "bg-white text-brand-strong hover:bg-brand-soft",
  },
  {
    key: "support",
    label: "Support",
    number: env.whatsapp.support,
    envName: "NEXT_PUBLIC_WA_SUPPORT",
    className: "bg-orange text-[#1F1300] hover:bg-[#F7B954]",
  },
] as const

function ContactButton({ contact, compact }: { contact: (typeof contacts)[number]; compact: boolean }) {
  const href = whatsappLink(contact.number)
  const classes = cn(
    "flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-[9px] text-[13px] font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
    contact.className,
    compact && "size-10 flex-none"
  )
  const content = (
    <>
      <MessageCircle className="size-[15px]" strokeWidth={2} aria-hidden="true" />
      {compact ? <span className="sr-only">WhatsApp {contact.label}</span> : contact.label}
    </>
  )

  const element = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {content}
    </a>
  ) : (
    <button
      type="button"
      className={classes}
      onClick={() =>
        toast.info(`Numéro WhatsApp ${contact.label.toLowerCase()} non configuré`, {
          description: `Renseignez ${contact.envName} dans .env.local.`,
        })
      }
    >
      {content}
    </button>
  )

  if (!compact) return element
  return (
    <Tooltip>
      <TooltipTrigger render={element} />
      <TooltipContent side="right" sideOffset={10}>
        WhatsApp {contact.label}
      </TooltipContent>
    </Tooltip>
  )
}

/** Sidebar footer card from the prototype: WhatsApp shortcuts to the sales & support teams. */
export function QuickContacts({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[14px] bg-brand p-2">
        {contacts.map((contact) => (
          <ContactButton key={contact.key} contact={contact} compact />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] bg-brand p-[18px] text-white">
      <p className="text-[15px] font-extrabold">Contacts rapides</p>
      <p className="text-[12.5px] leading-normal text-brand-soft">
        Joignez l’équipe ventes ou support directement sur WhatsApp.
      </p>
      <div className="flex flex-wrap gap-2">
        {contacts.map((contact) => (
          <ContactButton key={contact.key} contact={contact} compact={false} />
        ))}
      </div>
    </div>
  )
}
