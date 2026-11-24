"use client"

import { Menu } from "lucide-react"
import { Suspense } from "react"

import { GlobalSearch } from "./global-search"
import { NotificationsMenu } from "./notifications-menu"
import { PageHeading } from "./page-heading"
import { UserMenu } from "./user-menu"

interface DashboardTopbarProps {
  onOpenMobileNav: () => void
}

export function DashboardTopbar({ onOpenMobileNav }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-card/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-card/85 sm:gap-4 md:px-6 lg:px-8 lg:py-[18px]">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Ouvrir le menu"
        className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-[10px] text-ink-soft outline-none hover:bg-hover focus-visible:ring-3 focus-visible:ring-ring/40 lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <Suspense fallback={<div className="min-w-0 flex-1 md:flex-[1_1_260px]" />}>
        <PageHeading />
      </Suspense>
      <GlobalSearch />
      <NotificationsMenu />
      <UserMenu />
    </header>
  )
}
