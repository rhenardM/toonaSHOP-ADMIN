import type { IsoDate } from "@/types/domain"

export type UserRole = "ROLE_USER" | "ROLE_MANAGER" | "ROLE_ADMIN"

/** Raw user as returned by GET /user/list (API spec §5.8). Activation reads as `is_enable`. */
export interface RawUser {
  id: number | string
  numero?: string | null
  nom?: string | null
  prenom?: string | null
  email?: string | null
  roles?: string[] | null
  is_enable?: boolean | null
  point_of_sale?: { id: number; name: string } | null
  entrepot?: { id: number; name: string } | null
  created_at?: string | null
  createdAt?: string | null
}

export interface User {
  id: number
  firstName: string
  lastName: string
  name: string
  phone: string
  email: string | null
  roles: string[]
  /** Highest known role, used to pre-fill the edit form. */
  role: UserRole
  isEnabled: boolean
  pointOfSale: string | null
  warehouse: string | null
  createdAt: IsoDate | null
}

export interface CreateUserInput {
  numero: string
  password: string
  nom: string
  prenom: string
  role: UserRole
}

export interface UpdateUserInput {
  id: number
  numero: string
  nom: string
  prenom: string
  role: UserRole
  /** Omitted to keep the current password. */
  password?: string
  isEnable: boolean
}
