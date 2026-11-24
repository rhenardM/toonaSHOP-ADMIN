import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Buttons from the prototype: 40px, 10px radius, bold 13px labels. */
export const appButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] text-[13px] whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-[15px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand font-bold text-white hover:bg-brand-strong",
        outline: "border border-input bg-white font-semibold text-ink-soft hover:bg-surface-subtle",
        brandOutline: "border border-brand bg-white font-bold text-brand-strong hover:bg-brand-soft",
        ghost: "font-semibold text-ink-soft hover:bg-hover hover:text-ink",
        danger: "bg-danger font-bold text-white hover:bg-danger-strong",
        dangerOutline: "border border-danger/40 bg-white font-bold text-danger-strong hover:bg-danger-soft",
      },
      size: {
        md: "h-10 px-3.5",
        sm: "h-9 px-3 rounded-[9px]",
        icon: "size-9 rounded-[9px]",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  }
)

type Variants = VariantProps<typeof appButtonVariants>

interface AppButtonProps extends ComponentProps<"button">, Variants {
  pending?: boolean
  icon?: ReactNode
}

export function AppButton({ variant, size, pending, icon, className, children, disabled, type = "button", ...props }: AppButtonProps) {
  return (
    <button type={type} disabled={disabled || pending} className={cn(appButtonVariants({ variant, size }), className)} {...props}>
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  )
}

interface AppLinkButtonProps extends ComponentProps<typeof Link>, Variants {
  icon?: ReactNode
}

export function AppLinkButton({ variant, size, icon, className, children, ...props }: AppLinkButtonProps) {
  return (
    <Link className={cn(appButtonVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </Link>
  )
}
