/** Serialises rows to CSV (semicolon-separated, Excel-friendly in fr locales). */
export function toCsv<T extends Record<string, string | number>>(
  rows: readonly T[],
  columns: readonly { key: keyof T; label: string }[]
): string {
  const escape = (value: string | number) => {
    const text = String(value)
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const header = columns.map((c) => escape(c.label)).join(";")
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(";"))
  return [header, ...body].join("\n")
}

/** Saves a Blob (e.g. a file returned by the API) under the given name. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Triggers a browser download for in-memory text content. */
export function downloadFile(content: string, filename: string, type = "text/csv;charset=utf-8") {
  // BOM so Excel detects UTF-8 accents correctly.
  saveBlob(new Blob(["\uFEFF", content], { type }), filename)
}
