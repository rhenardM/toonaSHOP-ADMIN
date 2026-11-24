"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"
import { Toaster } from "sonner"

import { ApiError } from "@/lib/api/errors"
import { onSessionExpired } from "@/lib/api/http"

/** Errors that a retry cannot fix. */
const FINAL_ERRORS = new Set(["unauthorized", "forbidden", "not-found", "validation"])

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => !(error instanceof ApiError && FINAL_ERRORS.has(error.kind)) && failureCount < 2,
      },
    },
  })
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  const router = useRouter()

  useEffect(() => {
    let redirecting = false
    onSessionExpired(() => {
      if (redirecting || window.location.pathname === "/login") return
      redirecting = true
      queryClient.clear()
      const next = `${window.location.pathname}${window.location.search}`
      router.replace(`/login?expired=1&next=${encodeURIComponent(next)}`)
      // Allow a later expiry (after re-login) to redirect again.
      setTimeout(() => (redirecting = false), 2000)
    })
  }, [queryClient, router])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-jakarta)" } }} />
    </QueryClientProvider>
  )
}
