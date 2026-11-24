"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { authService } from "../api/auth-service"
import { phoneSchema } from "../lib/schemas"
import { Field, FormAlert, inputClass, PasswordInput, SubmitButton } from "@/components/shared/form-controls"

type Step = "phone" | "otp" | "password"

const STEPS: { id: Step; label: string }[] = [
  { id: "phone", label: "Numéro" },
  { id: "otp", label: "Code" },
  { id: "password", label: "Nouveau mot de passe" },
]

const phoneFormSchema = z.object({ numero: phoneSchema })
const otpFormSchema = z.object({ otp: z.string().trim().regex(/^\d{4,8}$/, "Saisissez le code reçu par SMS.") })
const passwordFormSchema = z
  .object({
    password: z.string().min(6, "Au moins 6 caractères."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Les mots de passe ne correspondent pas." })

/** Reset by SMS OTP: request-reset → verify-reset → update (API spec §3). */
export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>("phone")
  const [numero, setNumero] = useState("")
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex gap-2" aria-label="Étapes">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 flex-col gap-1.5" aria-current={s.id === step ? "step" : undefined}>
            <span className={cn("h-1 rounded-full", i <= stepIndex ? "bg-brand" : "bg-track")} />
            <span className={cn("text-[11.5px]", i === stepIndex ? "font-bold text-ink" : "text-muted-foreground")}>{s.label}</span>
          </li>
        ))}
      </ol>

      {step === "phone" ? (
        <PhoneStep
          onDone={(value) => {
            setNumero(value)
            setStep("otp")
          }}
        />
      ) : step === "otp" ? (
        <OtpStep numero={numero} onBack={() => setStep("phone")} onDone={() => setStep("password")} />
      ) : (
        <PasswordStep />
      )}

      <Link href="/login" className="inline-flex items-center gap-1.5 self-start text-[13px] font-bold text-brand hover:text-brand-strong">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour à la connexion
      </Link>
    </div>
  )
}

function PhoneStep({ onDone }: { onDone: (numero: string) => void }) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm<z.input<typeof phoneFormSchema>, unknown, z.output<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { numero: "" },
  })
  const onSubmit = form.handleSubmit(async ({ numero }) => {
    setError(null)
    try {
      await authService.requestReset(numero)
      toast.success("Code envoyé par SMS")
      onDone(numero)
    } catch (e) {
      setError(getErrorMessage(e))
    }
  })
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field id="reset-numero" label="Numéro de téléphone du compte" error={form.formState.errors.numero?.message}>
        <input
          id="reset-numero"
          type="tel"
          inputMode="tel"
          autoComplete="username"
          placeholder="+243 81 234 5678"
          aria-invalid={form.formState.errors.numero ? true : undefined}
          className={inputClass}
          {...form.register("numero")}
        />
      </Field>
      <SubmitButton pending={form.formState.isSubmitting}>Recevoir un code</SubmitButton>
    </form>
  )
}

function OtpStep({ numero, onBack, onDone }: { numero: string; onBack: () => void; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const form = useForm<z.infer<typeof otpFormSchema>>({ resolver: zodResolver(otpFormSchema), defaultValues: { otp: "" } })
  const onSubmit = form.handleSubmit(async ({ otp }) => {
    setError(null)
    try {
      await authService.verifyReset(numero, otp)
      onDone()
    } catch (e) {
      setError(getErrorMessage(e))
    }
  })
  async function resend() {
    setResending(true)
    try {
      await authService.requestReset(numero)
      toast.success("Nouveau code envoyé")
    } catch (e) {
      toast.error("Envoi impossible", { description: getErrorMessage(e) })
    } finally {
      setResending(false)
    }
  }
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-[13px] text-muted-foreground">
        Code envoyé au <strong className="text-ink">{numero}</strong>.{" "}
        <button type="button" onClick={onBack} className="font-bold text-brand hover:text-brand-strong">
          Modifier
        </button>
      </p>
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field
        id="reset-otp"
        label="Code de vérification"
        error={form.formState.errors.otp?.message}
        action={
          <button type="button" onClick={resend} disabled={resending} className="text-[12.5px] font-bold text-brand disabled:opacity-50">
            Renvoyer le code
          </button>
        }
      >
        <input
          id="reset-otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          aria-invalid={form.formState.errors.otp ? true : undefined}
          className={cn(inputClass, "text-center text-lg font-bold tracking-[0.4em]")}
          {...form.register("otp")}
        />
      </Field>
      <SubmitButton pending={form.formState.isSubmitting}>Vérifier le code</SubmitButton>
    </form>
  )
}

function PasswordStep() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { password: "", confirm: "" },
  })
  const onSubmit = form.handleSubmit(async ({ password }) => {
    setError(null)
    try {
      await authService.resetPassword(password)
      router.replace("/login?reset=1")
    } catch (e) {
      setError(getErrorMessage(e))
    }
  })
  const { errors } = form.formState
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field id="new-password" label="Nouveau mot de passe" error={errors.password?.message}>
        <PasswordInput id="new-password" autoComplete="new-password" aria-invalid={errors.password ? true : undefined} {...form.register("password")} />
      </Field>
      <Field id="confirm-password" label="Confirmer le mot de passe" error={errors.confirm?.message}>
        <PasswordInput id="confirm-password" autoComplete="new-password" aria-invalid={errors.confirm ? true : undefined} {...form.register("confirm")} />
      </Field>
      <SubmitButton pending={form.formState.isSubmitting}>Enregistrer le mot de passe</SubmitButton>
    </form>
  )
}
