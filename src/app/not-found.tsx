import { Compass } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-extrabold text-ink">Page introuvable</h1>
      <p className="max-w-sm text-muted-foreground">Cette adresse ne correspond à aucune page de la console.</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center rounded-[10px] bg-brand px-4 text-[13px] font-bold text-white hover:bg-brand-strong"
      >
        Retour au tableau de bord
      </Link>
    </main>
  )
}
