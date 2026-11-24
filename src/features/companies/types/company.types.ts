import type { IsoDate } from "@/types/domain"

/** Raw group (company) as returned by /admin/groups and related endpoints. */
export interface RawGroup {
  id: number | string
  nomEntreprise?: string | null
  name?: string | null
  email?: string | null
  contact?: string | null
  nrccm?: string | null
  user_count?: number | string | null
  point_of_sale_count?: number | string | null
  warehouse_count?: number | string | null
  isPaid?: boolean | null
  isActive?: boolean | null
  subscriptionEnd?: string | null
  subscriptionStatus?: string | null
  planName?: string | null
  totalRevenue?: number | string | null
  createdAt?: string | null
  created_at?: string | null
}

export interface Company {
  id: number
  name: string
  email: string | null
  phone: string | null
  rccm: string | null
  usersCount: number
  pointsOfSaleCount: number
  warehousesCount: number
  isPaid: boolean
  /** Admin activation (`isActive`, falling back to `isPaid` like the legacy console). */
  isEnabled: boolean
  subscriptionEnd: IsoDate | null
  subscriptionStatus: string | null
  planName: string | null
  totalRevenue: number | null
  createdAt: IsoDate | null
}

/** Combined status shown in lists: activation first, then subscription validity. */
export type CompanyStatus = "active" | "expiring" | "expired" | "disabled"

export interface RawGroupUser {
  id: number | string
  numero?: string | null
  nom?: string | null
  prenom?: string | null
  roles?: string[] | null
  created_at?: string | null
  createdAt?: string | null
  point_of_sale?: { id: number; name: string } | null
  entrepot?: { id: number; name: string } | null
}

export interface CompanyUser {
  id: number
  name: string
  phone: string | null
  roles: string[]
  createdAt: IsoDate | null
  pointOfSale: string | null
  warehouse: string | null
}

export interface ExtendSubscriptionInput {
  companyId: number
  months: number
  /** Plan code, as expected by POST /admin/group/{id}/subscription/extend. */
  plan: string
}
