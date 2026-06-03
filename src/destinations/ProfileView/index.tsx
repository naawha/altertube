import { useGetAuthPreferencesQuery } from "@/models/profile"
import { FC } from "react"

const ProfileView: FC = () => {
    const { data, isLoading, isError } = useGetAuthPreferencesQuery()
    console.log(data)
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (isError) {
        return <div>Error: {isError}</div>
    }
    return <div>ProfileView</div>
}

export default ProfileView