import { invidiousApi } from "@/shared/api/invidiousAPI"

/** Элемент потока из `/streams/:id` (Piped API). */
export type PipedStreamSource = {
  url: string
  mimeType?: string
  quality?: string
  bitrate?: number
  codec?: string
  format?: string
  fps?: number
  height?: number
  width?: number
  videoOnly?: boolean
  /** Для клиентской сборки DASH (как в Piped DashUtils). */
  itag?: number
  audioTrackId?: string
  indexStart?: number
  indexEnd?: number
  initStart?: number
  initEnd?: number
}

/** Элемент из `relatedStreams` в `/streams/:id`. */
export type PipedRelatedStream = {
  url: string
  type?: string
  title: string
  thumbnail: string
  uploaderName: string
  uploaderUrl?: string
  uploaderAvatar?: string
  uploaderVerified?: boolean
  duration?: number
  views?: number
  uploaded?: number
  uploadedDate?: string
  isShort?: boolean
}

export type PipedStreamResponse = {
  title: string
  description?: string
  thumbnailUrl?: string
  uploader?: string
  uploaderUrl?: string
  uploaderAvatar?: string
  uploaderVerified?: boolean
  uploaderSubscriberCount?: number
  duration?: number
  views?: number
  likes?: number
  dislikes?: number
  uploadDate?: string
  /** Unix time в миллисекундах (как в ответе Piped). */
  uploaded?: number
  livestream?: boolean
  hls?: string | null
  dash?: string | null
  videoStreams?: PipedStreamSource[]
  audioStreams?: PipedStreamSource[]
  subtitles?: unknown[]
  relatedStreams?: PipedRelatedStream[]
}

/** Ответ `GET /playlists/:playlistId` (Piped API). */
export type PipedPlaylistResponse = {
  name: string
  thumbnailUrl?: string
  bannerUrl?: string
  uploader?: string
  uploaderUrl?: string
  uploaderAvatar?: string
  uploaderVerified?: boolean
  videos?: number
  relatedStreams?: PipedRelatedStream[]
  nextpage?: string | null
}

/** Ответ `GET /channel/:channelId` (Piped API). */
export type PipedChannelResponse = {
  id: string
  name: string
  avatarUrl?: string
  bannerUrl?: string
  description?: string
  subscriberCount?: number
  verified?: boolean
  relatedStreams?: PipedRelatedStream[]
  nextpage?: string | null
}

export const videoSlice = invidiousApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideo: builder.query<PipedStreamResponse, string>({
      query: (videoId) => ({
        url: `/v1/video/${encodeURIComponent(videoId)}`,
      }),
    }),
    getPlaylist: builder.query<PipedPlaylistResponse, string>({
      query: (playlistId) => ({
        url: `/v1/playlists/${encodeURIComponent(playlistId)}`,
      }),
      transformResponse: (raw: unknown): PipedPlaylistResponse => {
        const r = raw as PipedPlaylistResponse & { title?: string }
        return {
          ...r,
          name: r.name ?? r.title ?? "",
        }
      },
    }),
    getPlaylistNextPage: builder.query<
      PipedPlaylistResponse,
      { playlistId: string; nextPageData: string }
    >({
      query: ({ playlistId, nextPageData }) => ({
        url: `/v1/nextpage/playlists/${encodeURIComponent(playlistId)}`,
        params: { nextpage: nextPageData },
      }),
    }),
    getChannel: builder.query<PipedChannelResponse, string>({
      query: (channelId) => ({
        url: `/v1/channel/${encodeURIComponent(channelId)}`,
      }),
      transformResponse: (raw: unknown): PipedChannelResponse => {
        const r = raw as PipedChannelResponse & { title?: string }
        return {
          ...r,
          name: r.name ?? r.title ?? "",
          id: r.id ?? "",
        }
      },
    }),
    getChannelNextPage: builder.query<
      PipedChannelResponse,
      { channelId: string; nextPageData: string }
    >({
      query: ({ channelId, nextPageData }) => ({
        url: `/v1/nextpage/channel/${encodeURIComponent(channelId)}`,
        params: { nextpage: nextPageData },
      }),
    }),
  }),
})

export const {
  useGetVideoQuery,
  useGetPlaylistQuery,
  useLazyGetPlaylistNextPageQuery,
  useGetChannelQuery,
  useLazyGetChannelNextPageQuery,
} = videoSlice
