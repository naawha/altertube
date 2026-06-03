import PlaylistView from "@/destinations/PlaylistView"
import { serverSideDataResolverWrapper } from "@/core/api/wrapper"
import type { FC } from "react"

interface PlaylistPageProps {
  playlistId: string
}

const PlaylistPage: FC<PlaylistPageProps> = ({ playlistId }) => {
  return <PlaylistView playlistId={playlistId} />
}

export const getServerSideProps = serverSideDataResolverWrapper({
  config: {
    general: [["getPlaylist", (ctx) => ctx!.query.list]],
    authenticated: [],
  },
  wrapped: (ctx) => ({
    props: {
      playlistId: ctx!.query.list,
    },
  }),
})

export default PlaylistPage
