"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type NavBadgeKey, type NavItem, isNavItemActive, navigation } from "@/config/navigation"
import { usePendingImfCount } from "@/features/imf/hooks/use-imf"
import { useUnreadMessages } from "@/features/messages/hooks/use-unread-messages"
import { useHydrated } from "@/hooks/use-hydrated"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  collapsed?: boolean
  /** Called after a link is followed (closes the mobile drawer). */
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: imfPending } = usePendingImfCount()
  const { unreadCount } = useUnreadMessages()
  // Counters come from the client cache: shown only after hydration (see HydrationGate).
  const hydrated = useHydrated()
  const badges: Record<NavBadgeKey, number | undefined> = hydrated
    ? { imfPending, unreadMessages: unreadCount }
    : { imfPending: undefined, unreadMessages: undefined }

  return (
    <nav aria-label="Navigation principale" className={cn("flex flex-col", collapsed ? "gap-2.5" : "gap-[18px]")}>
      {navigation.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          {collapsed ? (
            <span aria-hidden="true" className="mx-auto mb-1.5 h-px w-6 bg-border first:hidden" />
          ) : (
            <p className="mb-1.5 ml-2.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
              {group.label}
            </p>
          )}
          {group.items.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isNavItemActive(pathname, item.href)}
              collapsed={collapsed}
              count={item.badge ? badges[item.badge.key] : undefined}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

interface SidebarLinkProps {
  item: NavItem
  active: boolean
  collapsed: boolean
  count?: number
  onNavigate?: () => void
}

function SidebarLink({ item, active, collapsed, count, onNavigate }: SidebarLinkProps) {
  const Icon = item.icon
  const showCount = typeof count === "number" && count > 0
  const label = showCount ? `${item.title}, ${count} à traiter` : item.title

  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      onClick={onNavigate}
      className={cn(
        "relative flex min-h-10 items-center gap-2.5 rounded-[10px] px-3 py-2 text-[14px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        collapsed && "min-h-9 justify-center px-0 py-1.5",
        active ? "bg-brand-soft font-bold text-brand-strong" : "font-medium text-ink-soft hover:bg-hover hover:text-ink"
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.9} aria-hidden="true" />
      {collapsed ? (
        showCount ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-2 right-3 size-2 rounded-full ring-2 ring-white",
              item.badge?.tone === "warning" ? "bg-orange" : "bg-brand"
            )}
          />
        ) : null
      ) : (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {showCount ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                item.badge?.tone === "warning" ? "bg-warning-soft text-warning" : "bg-brand text-white"
              )}
            >
              {count}
            </span>
          ) : null}
        </>
      )}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right" sideOffset={10}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/** Static placeholder while the current pathname is resolved (dynamic routes). */
export function SidebarNavFallback() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="h-10 rounded-[10px] bg-surface-subtle" />
      ))}
    </div>
  )
}
