"use client"

import type { ReactNode } from "react"

import { useHydrated } from "@/hooks/use-hydrated"

/**
 * Renders `fallback` on the server and while hydrating, then `children`.
 *
 * Needed for views streamed inside a Suspense boundary: components hydrated
 * earlier (topbar, notifications) may already have filled the query cache,
 * and reading it during hydration would produce HTML that differs from the
 * server's (React error #418).
 */
export function HydrationGate({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  return useHydrated() ? children : fallback
}
