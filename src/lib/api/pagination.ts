/** Raw paginated envelope: the API mixes `totalPages` and `total_pages` (API spec §4). */
export interface RawPaginated<T> {
  data?: T[] | null
  total?: number | string | null
  page?: number | string | null
  limit?: number | string | null
  totalPages?: number | null
  total_pages?: number | null
  pagination?: { total?: number; page?: number; limit?: number; total_pages?: number; totalPages?: number } | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PageParams {
  page: number
  pageSize: number
}

export function normalizePaginated<T, R = T>(
  raw: RawPaginated<T> | null | undefined,
  params: PageParams,
  map: (item: T) => R = (item) => item as unknown as R
): Paginated<R> {
  const source = raw?.pagination ?? raw ?? {}
  const items = (raw?.data ?? []).map(map)
  const total = Number(source.total ?? items.length) || 0
  const pageSize = Number(source.limit ?? params.pageSize) || params.pageSize
  const explicitPages = source.totalPages ?? source.total_pages
  const totalPages = Math.max(1, Number(explicitPages ?? Math.ceil(total / pageSize)) || 1)
  return { items, total, page: Number(source.page ?? params.page) || params.page, pageSize, totalPages }
}

/** Fetches every page of an endpoint (small collections only: groups, claims…). */
export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<RawPaginated<T>>,
  pageSize = 200,
  maxPages = 50
): Promise<T[]> {
  const all: T[] = []
  for (let page = 1; page <= maxPages; page++) {
    const raw = await fetchPage(page, pageSize)
    const normalized = normalizePaginated(raw, { page, pageSize })
    all.push(...normalized.items)
    if (normalized.items.length < pageSize || page >= normalized.totalPages) break
  }
  return all
}
