"use client"

import { ChevronDown, LifeBuoy, LogOut, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { env, whatsappLink } from "@/config/env"
import { useLogout, useSession } from "@/features/auth/hooks/use-session"
import { userInitials } from "@/lib/auth/session-user"

export function UserMenu() {
  const { data: user, isPending } = useSession()
  const logout = useLogout()

  function contactSupport() {
    const href = whatsappLink(env.whatsapp.support)
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer")
    } else {
      toast.info("Numéro WhatsApp support non configuré", {
        description: "Renseignez NEXT_PUBLIC_WA_SUPPORT dans .env.local.",
      })
    }
  }

  if (isPending) {
    return (
      <div className="flex shrink-0 items-center gap-2.5" aria-busy="true" aria-label="Chargement du compte">
        <Skeleton className="size-10 rounded-full bg-track" />
        <Skeleton className="hidden h-8 w-28 bg-track md:block" />
      </div>
    )
  }

  const name = user?.name ?? "Compte"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu du compte, ${name}`}
        className="flex shrink-0 items-center gap-2.5 rounded-xl p-0.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40 md:pr-2 md:hover:bg-surface-subtle"
      >
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-brand-strong text-[14px] font-extrabold text-white"
        >
          {userInitials(name)}
        </span>
        <span className="hidden max-w-[160px] flex-col leading-tight md:flex">
          <span className="truncate text-[13.5px] font-bold text-ink">{name}</span>
          <span className="truncate text-[12px] text-muted-foreground">{user?.roleLabel}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground md:block" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5">
            <span className="block truncate text-[13.5px] font-bold text-ink">{name}</span>
            <span className="block truncate text-[12px] font-normal">
              {[user?.roleLabel, user?.phone].filter(Boolean).join(" · ")}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/users" />} className="gap-2 px-2 py-2">
          <Users aria-hidden="true" />
          Gérer les utilisateurs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={contactSupport} className="gap-2 px-2 py-2">
          <LifeBuoy aria-hidden="true" />
          Contacter le support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="gap-2 px-2 py-2"
        >
          <LogOut aria-hidden="true" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
