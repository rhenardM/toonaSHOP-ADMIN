"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { findNavMatch } from "@/config/navigation"

/** Topbar title area: page title, then the description (dashboard) or a breadcrumb trail. */
export function PageHeading() {
  const pathname = usePathname()
  const match = findNavMatch(pathname)
  const title = match?.item.title ?? "ToonaSHOP Admin"

  return (
    <div className="min-w-0 flex-1 md:flex-[1_1_260px]">
      <h1 className="truncate text-xl font-extrabold tracking-[-0.02em] text-ink sm:text-2xl">{title}</h1>
      {match && match.item.href !== "/" ? (
        <nav aria-label="Fil d’Ariane" className="mt-0.5 hidden sm:block">
          <ol className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-brand">
                Tableau de bord
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>{match.group.label}</li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="font-semibold text-ink-soft">
              {match.item.title}
            </li>
          </ol>
        </nav>
      ) : (
        <p className="mt-0.5 hidden truncate text-[13px] text-muted-foreground sm:block">
          {match?.item.description ?? "Console d’administration"}
        </p>
      )}
    </div>
  )
}
