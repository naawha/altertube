import { serverSideDataResolverWrapper } from "@/core/api/wrapper"
import IndexView from "@/destinations/IndexView"
import { FC } from "react"

const IndexPage: FC = () => {
  return <IndexView />
}

export const getServerSideProps = serverSideDataResolverWrapper({
  config: {
    general: [["getFeed"]],
    authenticated: [],
  }
})



export default IndexPage
