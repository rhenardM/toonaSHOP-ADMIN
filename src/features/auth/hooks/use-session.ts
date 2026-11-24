"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { authService } from "../api/auth-service"

export const sessionKey = ["session"] as const

/** Current administrator, validated against GET /user/connecter. */
export function useSession() {
  return useQuery({ queryKey: sessionKey, queryFn: authService.session, staleTime: 5 * 60_000, retry: false })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      queryClient.clear()
      router.replace("/login")
      router.refresh()
    },
  })
}
