"use client"

import { CalendarPlus, Eye, MoreHorizontal, Power, PowerOff } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Company } from "../types/company.types"

interface CompanyActionsMenuProps {
  company: Company
  onExtend: (company: Company) => void
  onToggleEnabled: (company: Company) => void
  showOpen?: boolean
}

export function CompanyActionsMenu({ company, onExtend, onToggleEnabled, showOpen = true }: CompanyActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(event) => event.stopPropagation()}
        aria-label={`Actions pour ${company.name}`}
        className="flex size-9 items-center justify-center rounded-[9px] text-ink-soft outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-hover"
      >
        <MoreHorizontal className="size-[18px]" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1.5" onClick={(event) => event.stopPropagation()}>
        {showOpen ? (
          <DropdownMenuItem render={<Link href={`/companies/${company.id}`} />} className="gap-2 px-2 py-2">
            <Eye aria-hidden="true" />
            Ouvrir la fiche
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={() => onExtend(company)} className="gap-2 px-2 py-2">
          <CalendarPlus aria-hidden="true" />
          Prolonger l’abonnement
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={company.isEnabled ? "destructive" : "default"}
          onClick={() => onToggleEnabled(company)}
          className="gap-2 px-2 py-2"
        >
          {company.isEnabled ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
          {company.isEnabled ? "Désactiver l’entreprise" : "Activer l’entreprise"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
