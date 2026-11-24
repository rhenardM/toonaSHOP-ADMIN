"use client"

import { MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { User } from "../types/user.types"

interface UserActionsMenuProps {
  user: User
  onEdit: (user: User) => void
  onToggleEnabled: (user: User) => void
}

export function UserActionsMenu({ user, onEdit, onToggleEnabled }: UserActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(event) => event.stopPropagation()}
        aria-label={`Actions pour ${user.name}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-[9px] text-ink-soft outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-hover"
      >
        <MoreHorizontal className="size-[18px]" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onClick={() => onEdit(user)} className="gap-2 px-2 py-2">
          <Pencil aria-hidden="true" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant={user.isEnabled ? "destructive" : "default"} onClick={() => onToggleEnabled(user)} className="gap-2 px-2 py-2">
          {user.isEnabled ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
          {user.isEnabled ? "Désactiver le compte" : "Activer le compte"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
