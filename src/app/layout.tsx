import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"

import { APP_NAME } from "@/lib/constants/app"

import { Providers } from "./providers"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Console d’administration de la plateforme ToonaSHOP.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
