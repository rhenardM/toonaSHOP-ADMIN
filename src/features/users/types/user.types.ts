import type { IsoDate } from "@/types/domain"

/** `ROLE_XXX` code. The set is open: the backend defines business roles (e.g. ROLE_VENDEUR). */
export type UserRole = string

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
  /** Most significant role (see `primaryRole`), used to pre-fill the edit form. */
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
  /** Full role list sent to the API — existing roles are preserved by the callers. */
  roles: UserRole[]
  /** Omitted to keep the current password. */
  password?: string
  isEnable: boolean
}
