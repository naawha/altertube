import { invidiousApi } from "@/shared/api/invidiousAPI"
import { RTK_TAGS } from "@/shared/api/rtkTags"
import {
  mapInvidiousFeedVideoToGridItem,
  mergeInvidiousFeedItems,
  type InvidiousFeedResponse,
} from "@/shared/lib/invidiousFeed"
import type { VideoShortType } from "@/shared/types"

export type AuthStatus = {
  authenticated: boolean
}

const profileSlice = invidiousApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/v1/auth/profile — 200 вошли, 403 гость. */
    getAuthPreferences: builder.query<AuthStatus, void>({
      query: () => ({
        url: "/v1/auth/profile",
      }),
      providesTags: [RTK_TAGS.AUTH],
    }),

    login: builder.mutation<void, { username: string; password: string }>({
      query: ({ username, password }) => ({
        url: "/v1/auth/login",
        method: "POST",
        body: { username, password },
      }),
      invalidatesTags: [RTK_TAGS.AUTH, RTK_TAGS.FEED, RTK_TAGS.SUBSCRIPTIONS, RTK_TAGS.USER_PLAYLISTS],
    }),

    register: builder.mutation<void, { username: string; password: string }>({
      query: ({ username, password }) => ({
        url: "/v1/auth/register",
        method: "POST",
        body: { username, password },
      }),
      invalidatesTags: [RTK_TAGS.AUTH, RTK_TAGS.FEED, RTK_TAGS.SUBSCRIPTIONS, RTK_TAGS.USER_PLAYLISTS],
    }),

    signout: builder.mutation<void, void>({
      query: () => ({
        url: "/v1/auth/logout",
        method: "POST",
      }),
      transformResponse: () => undefined,
      invalidatesTags: [RTK_TAGS.AUTH, RTK_TAGS.FEED, RTK_TAGS.SUBSCRIPTIONS, RTK_TAGS.USER_PLAYLISTS],
    }),

    getFeed: builder.query<{
      videos: VideoShortType[],
      shorts: VideoShortType[]
    }, void>({
      query: () => ({
        url: "/v1/auth/feed",
      }),
      transformResponse: (response: InvidiousFeedResponse) => {
        const items = mergeInvidiousFeedItems(response)
        return {
          videos: items
            .filter((v) => v.type !== "shortVideo")
            .map(mapInvidiousFeedVideoToGridItem),
          shorts: items
            .filter((v) => v.type === "shortVideo")
            .map(mapInvidiousFeedVideoToGridItem),
        }
      },
      transformErrorResponse: (response) => {
        return {
          error: {
            status: response.status,
            data: { error: "Не удалось получить ленту" },
          },
        }
      },
      providesTags: [RTK_TAGS.FEED],
    }),
  }),
})

export const {
  useGetAuthPreferencesQuery,
  useLoginMutation,
  useRegisterMutation,
  useSignoutMutation,
  useGetFeedQuery,
} = profileSlice
