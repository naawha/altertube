import SubscriptionsView from "@/destinations/SubscriptionsView"
import { serverSideDataResolverWrapper } from "@/core/api/wrapper"
import type { FC } from "react"

const SubscriptionsPage: FC = () => {
  return <SubscriptionsView />
}

export const getServerSideProps = serverSideDataResolverWrapper({
  config: {
    general: [],
    authenticated: [["getSubscriptions"]],
  },
  wrapped: () => ({
    props: {},
  }),
})

export default SubscriptionsPage
