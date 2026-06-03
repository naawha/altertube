import { useGetCommentsQuery } from "./api/commentsSlice"

export function useGetComments(videoId: string) {
  return useGetCommentsQuery(videoId, { skip: !videoId })
}
