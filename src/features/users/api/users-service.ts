import { apiRequest } from "@/lib/api/http"
import { normalizePaginated, type PageParams, type Paginated, type RawPaginated } from "@/lib/api/pagination"

import type { CreateUserInput, RawUser, UpdateUserInput, User } from "../types/user.types"
import { toUser } from "./user-adapters"

/** GET /user/list — users of the signed-in admin's own group (API spec §5.8). */
export async function listUsers(params: PageParams): Promise<Paginated<User>> {
  const raw = await apiRequest<RawPaginated<RawUser>>("/user/list", { query: { page: params.page, limit: params.pageSize } })
  return normalizePaginated(raw, params, toUser)
}

export function createUser({ numero, password, nom, prenom, role }: CreateUserInput): Promise<unknown> {
  return apiRequest("/user/create-in-group", { method: "POST", body: { numero, password, nom, prenom, roles: [role] } })
}

/** Activation is written as `isEnable` (read as `is_enable`). */
export function updateUser({ id, numero, nom, prenom, role, password, isEnable }: UpdateUserInput): Promise<unknown> {
  return apiRequest(`/user/update/${id}`, {
    method: "PUT",
    body: { numero, nom, prenom, roles: [role], isEnable, ...(password ? { password } : {}) },
  })
}
