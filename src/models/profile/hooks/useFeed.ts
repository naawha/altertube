import { useGetFeedQuery } from "../api/profileSlice"
import useUserState from "./useUserState"

export const useFeed = () => {
  const { isAuthenticated } = useUserState()

  const { data, isLoading, isError } = useGetFeedQuery(undefined, {
    skip: !isAuthenticated,
  })

  return { data, isLoading, isError }
}

export default useFeed
