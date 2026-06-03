import { FC } from "react"
import SubscriptionsView from "@/destinations/SubscriptionsView"
import { serverSideDataResolverWrapper } from "@/core/api/wrapper"

const SubcriptionsPage: FC = () => {
    return <SubscriptionsView />
}

export const getServerSideProps = serverSideDataResolverWrapper({
    config: {
        general: [],
        authenticated: [["getSubscriptions"]],
    },
})
export default SubcriptionsPage