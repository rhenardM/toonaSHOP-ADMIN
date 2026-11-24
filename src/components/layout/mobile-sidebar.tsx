"use client"

import { Suspense } from "react"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"

import { BrandLogo } from "./brand-logo"
import { QuickContacts } from "./quick-contacts"
import { SidebarNav, SidebarNavFallback } from "./sidebar-nav"

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Navigation drawer for viewports below lg. */
export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[288px] gap-0 bg-card p-0 sm:max-w-[288px]">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <SheetDescription className="sr-only">Accès aux modules de la console ToonaSHOP</SheetDescription>
        <div className="px-4 pt-5 pb-3 pr-12">
          <BrandLogo />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <Suspense fallback={<SidebarNavFallback />}>
            <SidebarNav onNavigate={() => onOpenChange(false)} />
          </Suspense>
        </div>
        <div className="border-t px-4 pt-3 pb-4">
          <QuickContacts />
        </div>
      </SheetContent>
    </Sheet>
  )
}
