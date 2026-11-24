"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "toona_admin_sidebar_collapsed"
const listeners = new Set<() => void>()
/** Fallback when localStorage is unavailable (private mode, blocked storage). */
let memoryValue = false

function read(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? memoryValue : stored === "1"
  } catch {
    return memoryValue
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Desktop sidebar collapsed state, remembered per browser. The server snapshot
 * is "expanded", so the first paint always matches the server HTML.
 */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, () => false)

  const setCollapsed = useCallback((next: boolean) => {
    memoryValue = next
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
    } catch {
      // Storage unavailable: the preference is not remembered.
    }
    listeners.forEach((listener) => listener())
  }, [])

  return [collapsed, setCollapsed] as const
}
