import { invidiousApi } from "@/shared/api/invidiousAPI"
import { PipedCommentsResponseType } from "../types"

const commentsSlice = invidiousApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<PipedCommentsResponseType, string>({
      query: (videoId) => ({
        url: `/v1/comments/${encodeURIComponent(videoId)}`,
      }),
    }),
    getCommentsReplies: builder.query<
      PipedCommentsResponseType,
      { videoId: string; nextPageData: string }
    >({
      query: ({ videoId, nextPageData }) => ({
        url: `/v1/comments/${encodeURIComponent(videoId)}/replies`,
        params: { nextpage: nextPageData },
      }),
    }),
  }),
})

export const { useGetCommentsQuery, useGetCommentsRepliesQuery } = commentsSlice
