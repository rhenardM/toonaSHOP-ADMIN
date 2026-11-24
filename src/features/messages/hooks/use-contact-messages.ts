"use client"

import { useQuery } from "@tanstack/react-query"

import { listContactMessages } from "../api/contacts-service"
import type { ContactType } from "../types/contact.types"

export const contactKeys = {
  all: ["contact-messages"] as const,
  list: (type?: ContactType) => [...contactKeys.all, type ?? "all"] as const,
}

export function useContactMessages(type?: ContactType) {
  return useQuery({ queryKey: contactKeys.list(type), queryFn: () => listContactMessages(type), staleTime: 60_000 })
}
