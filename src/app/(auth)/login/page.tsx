import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthLayout } from "@/features/auth/components/auth-layout"
import { LoginForm } from "@/features/auth/components/login-form"

export const metadata: Metadata = { title: "Connexion" }

export default function LoginPage() {
  return (
    <AuthLayout title="Connexion" description="Connectez-vous avec le numéro de téléphone de votre compte administrateur.">
      {/* LoginForm reads ?next= and ?expired= (search params need a Suspense boundary). */}
      <Suspense fallback={<div className="h-[260px]" aria-busy="true" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
