export type Backend = "piped" | "invidious"

/** Активный бэкенд: `BACKEND=piped|invidious` (по умолчанию invidious). */
export function getBackend(): Backend {
  const value = process.env.BACKEND?.trim().toLowerCase()
  if (value === "piped") {
    return "piped"
  }
  return "invidious"
}

/** Базовый URL upstream-инстанса без завершающего слэша. */
export function getBackendInternalUrl(): string {
  const unified = process.env.BACKEND_INTERNAL_URL?.trim()
  if (unified) {
    return unified.replace(/\/$/, "")
  }

  const backend = getBackend()
  if (backend === "piped") {
    const piped =
      process.env.PIPED_INTERNAL_URL?.trim() ??
      process.env.PIPED_API_URL?.trim()
    if (!piped) {
      throw new Error(
        "Задайте BACKEND_INTERNAL_URL или PIPED_INTERNAL_URL для BACKEND=piped",
      )
    }
    return piped.replace(/\/$/, "")
  }

  const invidious = process.env.INVIDIOUS_INTERNAL_URL?.trim()
  if (!invidious) {
    throw new Error(
      "Задайте BACKEND_INTERNAL_URL или INVIDIOUS_INTERNAL_URL для BACKEND=invidious",
    )
  }
  return invidious.replace(/\/$/, "")
}

/** Пока /v1/* не перенесены — собирает URL upstream для SSR. */
export function resolveLegacyUpstreamUrl(relativePath: string): string {
  const base = getBackendInternalUrl()
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`
  const withoutV1 = path.replace(/^\/v1/, "")

  if (getBackend() === "invidious") {
    return new URL(`/api/v1${withoutV1}`, `${base}/`).href
  }

  return new URL(withoutV1 || "/", `${base}/`).href
}
