export const normalizeSearchSuggestions = (raw: unknown): string[] => {
  if (!Array.isArray(raw) || raw.length === 0) return []
  const second = raw[1]
  if (Array.isArray(second)) {
    return second.filter((x): x is string => typeof x === "string")
  }
  if (raw.every((x) => typeof x === "string")) {
    return raw as string[]
  }
  return []
}
