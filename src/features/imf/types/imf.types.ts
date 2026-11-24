import type { IsoDate } from "@/types/domain"

export interface RawImfGroup {
  id: number | string
  /** ⚠️ `name` in the pages, `nomEntreprise` in the old imfService (API spec §5.7). */
  name?: string | null
  nomEntreprise?: string | null
  contact?: string | null
  email?: string | null
  address?: string | null
  planName?: string | null
  createdAt?: string | null
  approvedAt?: string | null
  activeClients?: number | string | null
  inactiveClients?: number | string | null
}

export interface ImfGroup {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  planName: string | null
  createdAt: IsoDate | null
  approvedAt: IsoDate | null
  activeClients: number | null
  inactiveClients: number | null
}

/** GET /imf/analytics/{groupId} (API spec §5.7). */
export interface RawImfAnalytics {
  totalSales?: number | string | null
  totalRevenue?: number | string | null
  averageTransaction?: number | string | null
  topProducts?: Array<{ name?: string | null; quantity?: number | string | null; revenue?: number | string | null }> | null
}

export interface ImfTopProduct {
  name: string
  quantity: number
  revenue: number | null
}

export interface ImfAnalytics {
  totalSales: number
  totalRevenue: number
  averageTransaction: number
  topProducts: ImfTopProduct[]
}

/** GET /group/info?id= — `isApproved`/`nomEntreprise` are the legacy imfService spellings. */
export interface RawGroupInfo {
  id?: number | string | null
  name?: string | null
  nomEntreprise?: string | null
  contact?: string | null
  email?: string | null
  address?: string | null
  status?: string | null
  isImf?: boolean | null
  isApproved?: boolean | null
}

export interface GroupInfo {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  status: string | null
  isImf: boolean
}
