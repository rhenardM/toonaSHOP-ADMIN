"use client"

import { useSyncExternalStore } from "react"

/** Matches Tailwind's `lg` breakpoint, where messages switch to the two-pane layout. */
const QUERY = "(min-width: 1024px)"

function subscribe(listener: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener("change", listener)
  return () => media.removeEventListener("change", listener)
}

export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
}
