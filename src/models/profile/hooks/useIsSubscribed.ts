import { useGetSubscriptionsQuery } from "@/models/subscription/api/subscriptionSlice"
import useUserState from "./useUserState"

const useIsSubscribed = (channelId: string) => {
  const { isAuthenticated, authPending } = useUserState()
  const { data: subs } = useGetSubscriptionsQuery(undefined, {
    skip: !channelId || !isAuthenticated || authPending,
  })
  return channelId ? subs?.some((s) => s.authorId === channelId) ?? false : false
}

export default useIsSubscribed
