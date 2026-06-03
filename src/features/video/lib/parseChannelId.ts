/** Из URL канала (`/channel/UC…`, `youtube.com/channel/…`) или сырого id `UC…`. */
export function parseChannelIdFromPipedUrl(url: string): string | null {
  const t = url.trim()
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(t)) {
    return t
  }
  try {
    const u = t.startsWith("http") ? new URL(t) : new URL(t, "http://local.invalid")
    const parts = u.pathname.split("/").filter(Boolean)
    const i = parts.findIndex((p) => p === "channel")
    if (i >= 0 && parts[i + 1]) {
      return decodeURIComponent(parts[i + 1].split("?")[0])
    }
  } catch {
    /* ignore */
  }
  const m = t.match(/\/channel\/([^/?#]+)/)
  return m?.[1] ? decodeURIComponent(m[1]) : null
}
