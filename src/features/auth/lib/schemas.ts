import { z } from "zod"

/** The API authenticates with a phone number (`numero`). */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s]{9,16}$/, "Saisissez un numéro de téléphone valide, ex. +243 81 234 5678.")
  .transform((value) => value.replace(/\s+/g, ""))

export const loginSchema = z.object({
  numero: phoneSchema,
  password: z.string().min(1, "Saisissez votre mot de passe."),
})

/** Only same-site relative paths are accepted as post-login destinations. */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return "/"
  return next
}
