import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { useGetAuthPreferencesQuery } from "../api/profileSlice"

export type UserState = {
  /** Сессия (GET /api/v1/auth/profile вернул 200). */
  isAuthenticated: boolean
  /** Явный гость (403). */
  isGuest: boolean
  /** Первый запрос проверки сессии ещё выполняется. */
  authPending: boolean
}

const useUserState = (): UserState => {
  const { data, isSuccess, isError, isFetching, error } = useGetAuthPreferencesQuery()

  const isGuest =
    isError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as FetchBaseQueryError).status === 403

  return {
    isAuthenticated: isSuccess && !!data,
    isGuest: Boolean(isGuest),
    authPending: isFetching,
  }
}

export default useUserState
