import { configureStore } from "@reduxjs/toolkit"
import type { Context } from "next-redux-wrapper"
import { HYDRATE } from "next-redux-wrapper"
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import type { InvidiousThunkExtra } from "@/shared/api/invidiousAPI"
import pipedService from "./pipedService"

function getCookieHeaderFromContext(context?: Context): string | undefined {
  if (!context) return undefined
  const req =
    "req" in context && context.req
      ? context.req
      : "ctx" in context && context.ctx && "req" in context.ctx
        ? context.ctx.req
        : undefined
  if (!req?.headers) return undefined
  const cookie = req.headers.cookie
  if (typeof cookie === "string") return cookie
  if (Array.isArray(cookie)) return cookie.join("; ")
  return undefined
}

export function makeStore(context?: Context) {
  const thunkExtra: InvidiousThunkExtra = {
    cookieHeader: getCookieHeaderFromContext(context),
  }
  return configureStore({
    reducer: {
      [pipedService.reducerPath]: pipedService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [HYDRATE],
        },
        thunk: {
          extraArgument: thunkExtra,
        },
      }).concat(pipedService.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
