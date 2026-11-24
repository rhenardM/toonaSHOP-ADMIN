import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  collapsed?: boolean
  className?: string
}

export function BrandLogo({ collapsed = false, className }: BrandLogoProps) {
  if (collapsed) {
    return (
      <Link
        href="/"
        aria-label="ToonaSHOP Admin — tableau de bord"
        className={cn(
          "relative flex size-10 items-center justify-center rounded-xl bg-brand text-lg font-extrabold text-white",
          className
        )}
      >
        T
        <span aria-hidden="true" className="absolute right-1.5 bottom-1.5 size-2 rounded-full bg-orange" />
      </Link>
    )
  }

  return (
    <div className={cn("flex items-center justify-between gap-2 px-1.5", className)}>
      <Link href="/" aria-label="ToonaSHOP Admin — tableau de bord" className="shrink-0">
        <Image
          src="/brand/toonashop-logo.png"
          alt="ToonaSHOP – Entreprendre, Comprendre, Grandir"
          width={261}
          height={193}
          priority
          className="h-[58px] w-auto"
        />
      </Link>
      <span className="rounded-md bg-brand-soft px-2 py-1 text-[11px] font-bold tracking-[0.06em] text-brand-strong">
        ADMIN
      </span>
    </div>
  )
}
