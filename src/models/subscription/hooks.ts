import {
  useGetSubscriptionsQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
} from "./api/subscriptionSlice"
import useUserState from "@/models/profile/hooks/useUserState"

export const useSubscription = (channelId: string) => {
  const { isAuthenticated, authPending } = useUserState()
  const { data: subs, isLoading } = useGetSubscriptionsQuery(undefined, {
    skip: !channelId || !isAuthenticated || authPending,
  })
  const [subscribe] = useSubscribeMutation()
  const [unsubscribe] = useUnsubscribeMutation()

  const isSubscribed = channelId
    ? subs?.some((s) => s.authorId === channelId) ?? false
    : false

  return {
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  }
}
