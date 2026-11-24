"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { PageParams } from "@/lib/api/pagination"

import { createUser, listUsers, updateUser } from "../api/users-service"

export const userKeys = {
  all: ["users"] as const,
  list: (params: PageParams) => [...userKeys.all, "list", params] as const,
}

export function useUsers(params: PageParams) {
  return useQuery({ queryKey: userKeys.list(params), queryFn: () => listUsers(params), placeholderData: keepPreviousData })
}

/** Creation, edition and activation toggle: the list is refreshed afterwards. */
export function useUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: userKeys.all })
  return {
    create: useMutation({ mutationFn: createUser, onSuccess: invalidate }),
    update: useMutation({ mutationFn: updateUser, onSuccess: invalidate }),
  }
}
