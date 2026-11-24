"use client"

import { Bell, Headset, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUnreadMessages } from "@/features/messages/hooks/use-unread-messages"
import { cn, formatShortDate, formatTime } from "@/lib/utils"

const PREVIEW_COUNT = 6

/** New website contact messages (the only real-time notification source the API offers). */
export function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const { data, isPending, isError, refetch, unreadCount, isUnread, markAllSeen } = useUnreadMessages()
  const latest = (data ?? []).slice(0, PREVIEW_COUNT)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} nouveaux messages` : "Notifications"}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-[11px] border bg-white text-ink-soft transition-colors outline-none hover:bg-surface-subtle focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-surface-subtle"
      >
        <Bell className="size-[19px]" strokeWidth={1.9} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span aria-hidden="true" className="absolute top-[9px] right-2.5 box-content size-2 rounded-full border-2 border-white bg-orange" />
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[min(380px,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <p className="font-extrabold text-ink">Messages du site</p>
            <p className="text-[12px] text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} nouveau${unreadCount > 1 ? "x" : ""}` : "Aucun nouveau message"}
            </p>
          </div>
          <button
            type="button"
            onClick={markAllSeen}
            disabled={unreadCount === 0}
            className="rounded-md px-2 py-1 text-[12.5px] font-bold text-brand hover:bg-brand-soft disabled:pointer-events-none disabled:opacity-40"
          >
            Tout marquer comme lu
          </button>
        </div>

        <ul className="max-h-[360px] overflow-y-auto py-1">
          {isPending ? (
            <li className="px-4 py-6 text-center text-[13px] text-muted-foreground">Chargement…</li>
          ) : isError ? (
            <li className="flex flex-col items-center gap-2 px-4 py-6 text-center text-[13px] text-muted-foreground">
              Impossible de charger les messages.
              <button type="button" onClick={() => refetch()} className="font-bold text-brand hover:underline">
                Réessayer
              </button>
            </li>
          ) : latest.length === 0 ? (
            <li className="px-4 py-6 text-center text-[13px] text-muted-foreground">Aucun message reçu.</li>
          ) : (
            latest.map((message) => {
              const unread = isUnread(message)
              const Icon = message.type === "support" ? Headset : Mail
              return (
                <li key={message.id}>
                  <Link
                    href={`/messages?id=${message.id}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-subtle"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
                        unread ? "bg-brand-soft text-brand" : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={cn("truncate text-[13.5px] text-ink", unread ? "font-bold" : "font-medium")}>
                          {message.fullName}
                          {message.company ? <span className="font-normal text-muted-foreground"> · {message.company}</span> : null}
                        </span>
                        {unread ? (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-orange">
                            <span className="sr-only">Nouveau</span>
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-muted-foreground">
                        {message.type === "support" ? "Support · " : "Ventes · "}
                        {message.message}
                      </span>
                      {message.createdAt ? (
                        <span className="mt-1 block text-[11.5px] text-muted-foreground">
                          {formatShortDate(message.createdAt)} · {formatTime(message.createdAt)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              )
            })
          )}
        </ul>

        <div className="border-t p-2">
          <Link
            href="/messages"
            onClick={() => setOpen(false)}
            className="flex h-9 items-center justify-center rounded-lg text-[13px] font-bold text-brand hover:bg-brand-soft"
          >
            Voir tous les messages
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
