import { Container, Text } from "@mantine/core"
import { FC } from "react"
import { useFeed, useUserState } from "@/models/profile"
import { VideoGrid } from "@/features/video"

const IndexView: FC = () => {
    const { isAuthenticated, authPending } = useUserState()
    const { data, isLoading, isError } = useFeed()

    const gridItems = data ? [...data.videos, ...data.shorts] : []

    return (
        <Container py="xl" size="xl">
            {!isAuthenticated && !authPending ? (
                <Text c="dimmed">
                    Войдите через «Авторизация», чтобы видеть ленту подписок.
                </Text>
            ) : null}

            {isAuthenticated && isLoading ? <Text>Загрузка ленты…</Text> : null}

            {isError ? (
                <Text c="red" size="sm">
                    Не удалось загрузить ленту
                </Text>
            ) : null}

            {gridItems.length > 0 ? <VideoGrid data={gridItems} /> : null}

            {isAuthenticated &&
            data &&
            data.videos.length === 0 &&
            data.shorts.length === 0 &&
            !isLoading ? (
                <Text c="dimmed">Подписок пока нет или лента пуста.</Text>
            ) : null}
        </Container>
    )
}

export default IndexView
