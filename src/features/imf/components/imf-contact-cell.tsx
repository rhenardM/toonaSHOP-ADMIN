import type { ImfGroup } from "../types/imf.types"

/** Phone over email, as in the companies table. */
export function ImfContactCell({ group }: { group: Pick<ImfGroup, "phone" | "email"> }) {
  return (
    <span className="text-ink-soft">
      <span className="block whitespace-nowrap">{group.phone ?? "—"}</span>
      {group.email ? <span className="block max-w-[220px] truncate text-xs text-muted-foreground">{group.email}</span> : null}
    </span>
  )
}
