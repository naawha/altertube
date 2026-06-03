import { invidiousApi } from "@/shared/api/invidiousAPI"
import { RTK_TAGS } from "@/shared/api/rtkTags"
import { PipedUserPlaylistType } from "../types"

type InvidiousPlaylistListItem = {
  type?: string
  title: string
  playlistId: string
  videoCount: number
  authorThumbnails?: { url: string }[]
}

const playlistsSlice = invidiousApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserPlaylists: builder.query<PipedUserPlaylistType[], void>({
      query: () => ({
        url: "/v1/playlists",
      }),
      transformResponse: (rows: InvidiousPlaylistListItem[]): PipedUserPlaylistType[] =>
        rows.map((p) => ({
          id: p.playlistId,
          name: p.title,
          shortDescription: null,
          thumbnail: p.authorThumbnails?.[0]?.url ?? "",
          videos: p.videoCount,
        })),
      providesTags: [RTK_TAGS.USER_PLAYLISTS],
    }),

    createUserPlaylist: builder.mutation<unknown, { name: string }>({
      query: ({ name }) => ({
        url: "/v1/playlists",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: [RTK_TAGS.USER_PLAYLISTS],
    }),

    renameUserPlaylist: builder.mutation<
      unknown,
      { playlistId: string; newName: string }
    >({
      query: ({ playlistId, newName }) => ({
        url: `/v1/playlists/${encodeURIComponent(playlistId)}`,
        method: "PATCH",
        body: { title: newName },
      }),
      invalidatesTags: [RTK_TAGS.USER_PLAYLISTS],
    }),

    deleteUserPlaylist: builder.mutation<unknown, { playlistId: string }>({
      query: ({ playlistId }) => ({
        url: `/v1/playlists/${encodeURIComponent(playlistId)}`,
        method: "DELETE",
      }),
      invalidatesTags: [RTK_TAGS.USER_PLAYLISTS],
    }),

    addVideosToUserPlaylist: builder.mutation<
      unknown,
      { playlistId: string; videoIds: string[] }
    >({
      async queryFn({ playlistId, videoIds }, _api, _extraOptions, baseQuery) {
        for (const videoId of videoIds) {
          const result = await baseQuery({
            url: `/v1/playlists/${encodeURIComponent(playlistId)}/videos`,
            method: "POST",
            body: { videoId },
          })
          if (result.error) {
            return { error: result.error }
          }
        }
        return { data: undefined }
      },
      invalidatesTags: [RTK_TAGS.USER_PLAYLISTS],
    }),
  }),
})

export const {
  useGetUserPlaylistsQuery,
  useCreateUserPlaylistMutation,
  useRenameUserPlaylistMutation,
  useDeleteUserPlaylistMutation,
  useAddVideosToUserPlaylistMutation,
} = playlistsSlice
