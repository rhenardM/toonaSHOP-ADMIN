"use client"

import { CalendarPlus, Eye, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type { Payment } from "../types/payment.types"

export type PaymentWithCompany = Payment & {
  company: NonNullable<Payment["company"]>
}

interface PaymentActionsMenuProps {
  payment: PaymentWithCompany
  onExtend: (payment: PaymentWithCompany) => void
}

/** Row actions of a payment linked to a company. */
export function PaymentActionsMenu({ payment, onExtend }: PaymentActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(event) => event.stopPropagation()}
        aria-label={`Actions pour le paiement ${payment.reference ?? `#${payment.id}`}`}
        className="flex size-9 items-center justify-center rounded-[9px] text-ink-soft outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-hover"
      >
        <MoreHorizontal className="size-[18px]" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem render={<Link href={`/companies/${payment.company.id}`} />} className="gap-2 px-2 py-2">
          <Eye aria-hidden="true" />
          Ouvrir la fiche entreprise
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExtend(payment)} className="gap-2 px-2 py-2">
          <CalendarPlus aria-hidden="true" />
          Prolonger l’abonnement
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function hasCompany(payment: Payment): payment is PaymentWithCompany {
  return payment.company !== null
}
