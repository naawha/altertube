import { invidiousApi } from "@/shared/api/invidiousAPI"
import { RTK_TAGS } from "@/shared/api/rtkTags"
import { SubscriptionType } from "@/shared/types"

type InvidiousSubscriptionRow = {
  author: string
  authorId: string
}

const subscriptionSlice = invidiousApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<SubscriptionType[], void>({
      query: () => ({
        url: "/v1/subscriptions",
      }),
      transformResponse: (rows: InvidiousSubscriptionRow[]): SubscriptionType[] =>
        rows.map((s) => ({
          authorId: s.authorId,
          name: s.author,
          avatar: "",
          url: `/channel/${encodeURIComponent(s.authorId)}`,
          verified: false,
        })),
      providesTags: [RTK_TAGS.SUBSCRIPTIONS],
    }),

    subscribe: builder.mutation<void, string>({
      query: (channelId) => ({
        url: `/v1/subscriptions/${encodeURIComponent(channelId)}`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: [RTK_TAGS.SUBSCRIPTIONS, RTK_TAGS.IS_SUBSCRIBED],
    }),

    unsubscribe: builder.mutation<void, string>({
      query: (channelId) => ({
        url: `/v1/subscriptions/${encodeURIComponent(channelId)}`,
        method: "DELETE",
      }),
      invalidatesTags: [RTK_TAGS.SUBSCRIPTIONS, RTK_TAGS.IS_SUBSCRIBED],
    }),
  }),
})

export const {
  useGetSubscriptionsQuery,
  useSubscribeMutation,
  useUnsubscribeMutation,
} = subscriptionSlice
