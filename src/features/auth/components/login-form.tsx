"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

import { getErrorMessage } from "@/lib/api/errors"

import { authService } from "../api/auth-service"
import { sessionKey } from "../hooks/use-session"
import { loginSchema, safeNextPath } from "../lib/schemas"
import { Field, FormAlert, inputClass, PasswordInput, SubmitButton } from "@/components/shared/form-controls"

type LoginInput = z.input<typeof loginSchema>
type LoginValues = z.output<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)
  const expired = searchParams.get("expired") === "1"
  const reset = searchParams.get("reset") === "1"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { numero: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const user = await authService.login(values)
      queryClient.setQueryData(sessionKey, user)
      router.replace(safeNextPath(searchParams.get("next")))
      router.refresh()
    } catch (error) {
      setServerError(getErrorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {serverError ? (
        <FormAlert>{serverError}</FormAlert>
      ) : expired ? (
        <FormAlert tone="info">Votre session a expiré. Reconnectez-vous pour continuer.</FormAlert>
      ) : reset ? (
        <FormAlert tone="info">Mot de passe modifié. Vous pouvez vous connecter.</FormAlert>
      ) : null}

      <Field id="numero" label="Numéro de téléphone" error={errors.numero?.message}>
        <input
          id="numero"
          type="tel"
          inputMode="tel"
          autoComplete="username"
          placeholder="+243 81 234 5678"
          aria-invalid={errors.numero ? true : undefined}
          aria-describedby={errors.numero ? "numero-error" : undefined}
          className={inputClass}
          {...register("numero")}
        />
      </Field>

      <Field
        id="password"
        label="Mot de passe"
        error={errors.password?.message}
        action={
          <Link href="/forgot-password" className="text-[12.5px] font-bold text-brand hover:text-brand-strong">
            Mot de passe oublié ?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
      </Field>

      <div className="mt-2">
        <SubmitButton pending={isSubmitting}>Se connecter</SubmitButton>
      </div>
    </form>
  )
}
