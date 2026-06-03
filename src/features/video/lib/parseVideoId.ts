/** Из URL вида `/watch?v=…` или полного URL — id ролика. */
export const parseVideoIdFromPipedWatchUrl = (url: string): string | null => {
  try {
    const base = "http://local.invalid"
    const u = url.startsWith("http") ? new URL(url) : new URL(url, base)
    const v = u.searchParams.get("v")
    if (v) return v
  } catch {
    /* ignore */
  }
  const m = url.match(/[?&]v=([^&]+)/)
  return m?.[1] ? decodeURIComponent(m[1]) : null
}
