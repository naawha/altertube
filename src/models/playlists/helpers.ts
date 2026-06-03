import { PlaylistShortType } from "@/shared/types"
import { PipedUserPlaylistType } from "./types"

export const convertUserPlaylistToYouTubePlaylist = (
  playlist: PipedUserPlaylistType,
): PlaylistShortType => {
  const id = String(playlist.id)
  return {
    type: "playlist",
    title: playlist.name,
    playlistId: id,
    playlistThumbnail: playlist.thumbnail ?? "",
    author: "",
    authorId: "",
    authorUrl: "",
    authorVerified: false,
    videoCount: playlist.videos,
    videos: [
      {
        title: "",
        videoId: "",
        lengthSeconds: 0,
        videoThumbnails: [
          {
            quality: "medium",
            url: "",
            width: 0,
            height: 0,
          },
        ],
      },
    ],
  }
}
