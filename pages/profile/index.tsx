import { serverSideDataResolverWrapper } from "@/core/api/wrapper"
import ProfileView from "@/destinations/ProfileView"
import { FC } from "react"

const ProfilePage: FC = () => {
    return <ProfileView />
}

export const getServerSideProps = serverSideDataResolverWrapper({
    config: {
        general: [],
        authenticated: [["getAuthPreferences"]],
    },
    wrapped: () => ({
        props: {},
    }),
})



export default ProfilePage