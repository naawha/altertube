import PlaylistsView from "@/destinations/PlaylistsView"
import { serverSideDataResolverWrapper } from "@/core/api/wrapper"
import type { FC } from "react"

const PlaylistsPage: FC = () => {
  return <PlaylistsView />
}

export const getServerSideProps = serverSideDataResolverWrapper({
  config: {
    general: [],
    authenticated: [["getUserPlaylists"]],
  },
  wrapped: () => ({
    props: {},
  }),
})

export default PlaylistsPage
