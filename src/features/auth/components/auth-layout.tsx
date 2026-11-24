import { Building2, CreditCard, Landmark } from "lucide-react"
import Image from "next/image"
import type { ReactNode } from "react"

const highlights = [
  { icon: Building2, text: "Entreprises, utilisateurs et abonnements" },
  { icon: CreditCard, text: "Paiements mobile money et carte" },
  { icon: Landmark, text: "Validation des institutions de microfinance" },
]

/** Split auth screen: brand panel on large screens, form column everywhere. */
export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <div className="flex w-fit items-center rounded-2xl bg-white px-4 py-2">
          <Image src="/brand/toonashop-logo.png" alt="ToonaSHOP" width={261} height={193} priority className="h-14 w-auto" />
        </div>
        <div className="max-w-md">
          <p className="text-[13px] font-bold tracking-[0.08em] text-brand-muted uppercase">Console d’administration</p>
          <h2 className="mt-3 text-[32px] leading-tight font-extrabold tracking-[-0.02em]">
            Pilotez tout l’écosystème ToonaSHOP depuis un seul endroit.
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15px] text-brand-soft">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/12">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[12.5px] text-brand-muted">ToonaSHOP · Entreprendre, Comprendre, Grandir</p>
        <span aria-hidden="true" className="absolute -right-24 -bottom-24 size-72 rounded-full border-[40px] border-white/6" />
      </aside>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          <Image
            src="/brand/toonashop-logo.png"
            alt="ToonaSHOP – Entreprendre, Comprendre, Grandir"
            width={261}
            height={193}
            priority
            className="mx-auto mb-6 h-20 w-auto lg:hidden"
          />
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">{title}</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  )
}
