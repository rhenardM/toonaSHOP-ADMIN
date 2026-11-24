"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

import type { ContactMessage } from "../types/contact.types"
import { useContactMessages } from "./use-contact-messages"

/**
 * The website API has no read/unread flag (API spec §6.1). "Unread" means
 * received after the last time this browser marked messages as seen.
 */
const SEEN_KEY = "toona_admin_messages_seen_at"
const listeners = new Set<() => void>()
let memorySeenAt: string | null = null

function readSeenAt(): string | null {
  try {
    return window.localStorage.getItem(SEEN_KEY) ?? memorySeenAt
  } catch {
    return memorySeenAt
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useUnreadMessages() {
  const query = useContactMessages()
  const seenAt = useSyncExternalStore(subscribe, readSeenAt, () => null)

  const isUnread = useCallback(
    (message: ContactMessage) => Boolean(message.createdAt && (!seenAt || message.createdAt > seenAt)),
    [seenAt]
  )

  const unread = useMemo(() => (query.data ?? []).filter(isUnread), [query.data, isUnread])

  const markAllSeen = useCallback(() => {
    const now = new Date().toISOString()
    memorySeenAt = now
    try {
      window.localStorage.setItem(SEEN_KEY, now)
    } catch {
      // Not persisted: in-memory only.
    }
    listeners.forEach((listener) => listener())
  }, [])

  return { ...query, unread, unreadCount: unread.length, isUnread, markAllSeen }
}
