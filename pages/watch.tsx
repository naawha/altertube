"use client"

import { Center, Container, Loader, Text } from "@mantine/core"
import { useRouter } from "next/router"
import WatchView from "@/destinations/WatchView"
import { serverSideDataResolverWrapper } from "@/core/api/wrapper"

const WatchPage = () => {
    const router = useRouter()
    const raw = router.query.v
    const videoId =
        typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined

    if (!router.isReady) {
        return (
            <Center py="xl">
                <Loader size="md" />
            </Center>
        )
    }

    if (!videoId) {
        return (
            <Container py="xl" size="lg">
                <Text c="dimmed">Укажите видео в адресе: /watch?v=ID</Text>
            </Container>
        )
    }

    return <WatchView videoId={videoId} />
}


export const getServerSideProps = serverSideDataResolverWrapper({
    config: {
        general: [["getVideo", (ctx) => ctx!.query.v]],
        authenticated: [],
    },
    wrapped: (ctx) => {
        return {
            props: {
                videoId: ctx.query.v,
            },
        }
    },
})


export default WatchPage