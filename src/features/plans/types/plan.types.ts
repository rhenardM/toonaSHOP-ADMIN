export interface Plan {
  id: number
  code: string
  name: string
  description: string
  isActive: boolean
  currency: string
  monthlyPrice: number
  semesterPrice: number
  annualPrice: number
  maxUsers: number
  maxPointOfSales: number
  maxWarehouses: number
  maxLocations: number
  features: string[]
}

/** Body of POST /admin/plans and PUT /admin/plans/{id}. */
export type PlanInput = Omit<Plan, "id">
