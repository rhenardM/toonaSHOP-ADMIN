"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Suspense } from "react"

import { cn } from "@/lib/utils"

import { BrandLogo } from "./brand-logo"
import { QuickContacts } from "./quick-contacts"
import { SidebarNav, SidebarNavFallback } from "./sidebar-nav"

interface DashboardSidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

/** Desktop sidebar (≥ lg). Below that breakpoint the same nav lives in MobileSidebar. */
export function DashboardSidebar({ collapsed, onToggleCollapsed }: DashboardSidebarProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      <div className={cn("flex flex-col pt-5 pb-3", collapsed ? "items-center px-3" : "px-4")}>
        <BrandLogo collapsed={collapsed} />
      </div>

      <div className={cn("flex flex-1 flex-col gap-[22px] overflow-y-auto py-3", collapsed ? "px-3" : "px-4")}>
        <Suspense fallback={<SidebarNavFallback />}>
          <SidebarNav collapsed={collapsed} />
        </Suspense>
        <div className="mt-auto">
          <QuickContacts collapsed={collapsed} />
        </div>
      </div>

      <div className={cn("border-t py-2", collapsed ? "px-3" : "px-4")}>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          aria-expanded={!collapsed}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-[10px] px-3 text-[13px] font-semibold text-muted-foreground transition-colors outline-none hover:bg-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/40",
            collapsed && "justify-center px-0"
          )}
        >
          <ToggleIcon className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
          {collapsed ? null : "Replier le menu"}
        </button>
      </div>
    </aside>
  )
}
