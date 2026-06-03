"use client"

import { Center, Container, Loader, Text } from "@mantine/core"
import { useRouter } from "next/router"
import ChannelView from "@/destinations/ChannelView"
import { serverSideDataResolverWrapper } from "@/core/api/wrapper"

const ChannelPage = () => {
    const router = useRouter()
    const raw = router.query.channelId
    const channelId =
        typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined

    if (!router.isReady) {
        return (
            <Center py="xl">
                <Loader size="md" />
            </Center>
        )
    }

    if (!channelId) {
        return (
            <Container py="xl" size="lg">
                <Text c="dimmed">Укажите канал в адресе, например /channel/UC…</Text>
            </Container>
        )
    }

    return <ChannelView channelId={channelId} />
}

export const getServerSideProps = serverSideDataResolverWrapper({
    config: {
        general: [["getChannel", (ctx) => ctx!.query.channelId]],
        authenticated: [],
    },
    wrapped: () => ({
        props: {},
    }),
})

export default ChannelPage
