"use client"

import { type ReactNode, useState } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed"

import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardTopbar } from "./dashboard-topbar"
import { MobileSidebar } from "./mobile-sidebar"

/** Application frame: sidebar (desktop) or drawer (mobile), topbar, scrollable content. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useSidebarCollapsed()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <TooltipProvider delay={150}>
      <div className="flex min-h-dvh bg-background">
        <DashboardSidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed(!collapsed)} />
        <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
