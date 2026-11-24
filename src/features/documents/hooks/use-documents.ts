"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { deleteDocument, type LeadParams, listDocumentLeads, listDocuments, uploadDocument } from "../api/documents-service"

export const documentKeys = {
  all: ["documents"] as const,
  library: () => [...documentKeys.all, "library"] as const,
  leads: (params: LeadParams) => [...documentKeys.all, "leads", params] as const,
}

export function useDocuments() {
  return useQuery({ queryKey: documentKeys.library(), queryFn: listDocuments })
}

export function useDocumentLeads(params: LeadParams) {
  return useQuery({ queryKey: documentKeys.leads(params), queryFn: () => listDocumentLeads(params), placeholderData: keepPreviousData })
}

/** Upload and deletion refresh the library. */
export function useDocumentMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: documentKeys.library() })
  return {
    upload: useMutation({ mutationFn: uploadDocument, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: deleteDocument, onSuccess: invalidate }),
  }
}
