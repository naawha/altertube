import { PlaylistShortType } from "@/shared/types"
import { PipedUserPlaylistType } from "./types"

export const convertUserPlaylistToYouTubePlaylist = (
  playlist: PipedUserPlaylistType,
): PlaylistShortType => {
  const id = String(playlist.id)
  return {
    type: "playlist",
    name: playlist.name,
    playlistType: "NORMAL",
    thumbnail: playlist.thumbnail ?? "",
    url: `/playlists/${id}`,
    uploaderName: "",
    uploaderUrl: "",
    uploaderVerified: false,
    videos: playlist.videos,
  }
}
