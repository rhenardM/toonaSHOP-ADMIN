import type { Metadata } from "next"

import { UsersListView } from "@/features/users/components/users-list-view"

export const metadata: Metadata = { title: "Utilisateurs" }

export default function UsersPage() {
  return <UsersListView />
}
