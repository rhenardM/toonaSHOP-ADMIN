import type { Metadata } from "next"

import { AuthLayout } from "@/features/auth/components/auth-layout"
import { ForgotPasswordFlow } from "@/features/auth/components/forgot-password-flow"

export const metadata: Metadata = { title: "Mot de passe oublié" }

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Mot de passe oublié" description="Recevez un code par SMS pour définir un nouveau mot de passe.">
      <ForgotPasswordFlow />
    </AuthLayout>
  )
}
