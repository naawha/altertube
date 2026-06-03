/** Из URL плейлиста Piped/YouTube (`list=…`, `/playlists/…`) или сырого id `PL…`. */
export function parsePlaylistIdFromPipedUrl(url: string): string | null {
  const trimmed = url.trim()
  if (/^PL[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed
  }
  try {
    const u = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, "http://local.invalid")
    const list = u.searchParams.get("list")
    if (list) return list
    const parts = u.pathname.split("/").filter(Boolean)
    const idx = parts.findIndex((p) => p === "playlist" || p === "playlists")
    if (idx >= 0 && parts[idx + 1]) {
      return parts[idx + 1]
    }
  } catch {
    /* ignore */
  }
  const m = url.match(/[?&]list=([^&]+)/)
  return m?.[1] ? decodeURIComponent(m[1]) : null
}
