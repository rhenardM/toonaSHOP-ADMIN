"use client"

import { useSyncExternalStore } from "react"

const noopSubscribe = () => () => {}

/**
 * False on the server and during hydration, true afterwards. Lets components
 * defer content that depends on client-only state (TanStack Query cache,
 * localStorage) so it never differs from the server-rendered HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}
