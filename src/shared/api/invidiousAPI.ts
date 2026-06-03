import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { HYDRATE } from "next-redux-wrapper"
import { resolveLegacyUpstreamUrl } from "@/shared/config/backend"
import { RTK_TAGS } from "./rtkTags"

/** Прокидывается из makeStore (thunk.extraArgument) для SSR: Cookie с SID / authToken. */
export type InvidiousThunkExtra = {
  cookieHeader?: string
}

/**
 * Собственное API приложения (`/api/*`). На SSR — абсолютный URL Next.
 */
function resolveApiBaseUrl(): string {
  const path = process.env.NEXT_PUBLIC_API_BASE ?? "/api"
  if (typeof window !== "undefined") {
    return path
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path.replace(/\/$/, "")
  }
  const normalized = path.startsWith("/") ? path : `/${path}`
  const origin =
    process.env.NEXT_INTERNAL_ORIGIN ??
    `http://127.0.0.1:${process.env.PORT ?? "3000"}`
  return new URL(normalized, origin).href.replace(/\/$/, "")
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: resolveApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { extra }) => {
    headers.set("Accept", "application/json")
    const cookieHeader = (extra as InvidiousThunkExtra | undefined)?.cookieHeader
    if (cookieHeader) {
      headers.set("Cookie", cookieHeader)
    }
    return headers
  },
})

/** Внутренние маршруты Next — не проксируются на upstream при SSR. */
function isInternalApiPath(url: string): boolean {
  const path = url.split("?")[0]
  return (
    path.startsWith("/v1/video/") ||
    path.startsWith("/v1/comments/") ||
    path === "/v1/subscriptions" ||
    path.startsWith("/v1/subscriptions/") ||
    path === "/v1/playlists" ||
    path.startsWith("/v1/playlists/") ||
    path === "/v1/auth/profile" ||
    path === "/v1/auth/login" ||
    path === "/v1/auth/register" ||
    path === "/v1/auth/logout" ||
    path === "/v1/auth/feed"
  )
}

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (typeof window === "undefined") {
    const req = typeof args === "string" ? { url: args } : args
    if (
      typeof req.url === "string" &&
      req.url.startsWith("/v1/") &&
      !isInternalApiPath(req.url)
    ) {
      const upstreamUrl = resolveLegacyUpstreamUrl(req.url)
      const nextArgs =
        typeof args === "string"
          ? upstreamUrl
          : { ...args, url: upstreamUrl }
      return rawBaseQuery(nextArgs, api, extraOptions)
    }
  }

  return rawBaseQuery(args, api, extraOptions)
}

export const invidiousApi = createApi({
  reducerPath: "invidiousApi",
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === HYDRATE) {
      const payload = action.payload as Record<string, unknown>
      return payload[reducerPath] as never
    }
  },
  baseQuery,
  tagTypes: Object.values(RTK_TAGS),
  endpoints: () => ({}),
})
