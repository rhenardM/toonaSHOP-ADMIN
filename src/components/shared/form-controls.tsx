"use client"

import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { type ComponentProps, forwardRef, type ReactNode, useState } from "react"

import { cn } from "@/lib/utils"

export const inputClass =
  "h-11 w-full rounded-[10px] border border-input bg-white px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-danger"

export function Field({ id, label, error, action, children }: { id: string; label: string; error?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input ref={ref} type={visible ? "text" : "password"} className={cn(inputClass, "pr-11")} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-hover hover:text-ink"
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  )
})

export function FormAlert({ children, tone = "danger" }: { children: ReactNode; tone?: "danger" | "info" }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[13px] leading-snug",
        tone === "danger" ? "bg-danger-soft text-danger-strong" : "bg-brand-soft text-brand-strong"
      )}
    >
      <CircleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-strong disabled:opacity-70"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

export const textareaClass =
  "min-h-[110px] w-full rounded-[10px] border border-input bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-danger"
