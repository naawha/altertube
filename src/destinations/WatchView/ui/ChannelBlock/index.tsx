import { parseChannelIdFromPipedUrl } from "@/features/video/lib/parseChannelId"
import useUserState from "@/models/profile/hooks/useUserState"
import { useSubscription } from "@/models/subscription"
import type { PipedStreamResponse } from "@/models/video/api/videoSlice"
import { formatSubscriberCountRu } from "@/shared/lib/formatSubscriberCountRu"
import { Avatar, Button, Group, Stack, Text } from "@mantine/core"
import Link from "next/link"
import { useCallback } from "react"

interface ChannelBlockProps {
    data: PipedStreamResponse
}

const ChannelBlock = ({ data }: ChannelBlockProps) => {
    const { isAuthenticated, authPending } = useUserState()
    const channelId =
        (data?.uploaderUrl && parseChannelIdFromPipedUrl(data.uploaderUrl)) ??
        data?.uploaderUrl?.split("/")[2] ??
        ""
    const { isSubscribed, subscribe, unsubscribe, isLoading } = useSubscription(channelId)

    const handleSubscribe = useCallback(() => {
        subscribe(channelId)
    }, [subscribe, channelId])

    const handleUnsubscribe = useCallback(() => {
        unsubscribe(channelId)
    }, [unsubscribe, channelId])

    return (

        <Group gap="sm" wrap="nowrap" align="center">
            <Avatar
                src={data.uploaderAvatar ?? undefined}
                alt=""
                radius="xl"
                size={40}
                color="gray"
            >
                {(data.uploader ?? "?").slice(0, 1).toUpperCase()}
            </Avatar>
            <Stack gap={0}>
                <Group gap={6} wrap="nowrap">
                    {data.uploaderUrl && channelId ? (
                        <Text
                            component={Link}
                            href={`/channel/${encodeURIComponent(channelId)}`}
                            prefetch={false}
                            size="sm"
                            fw={600}
                            c="inherit"
                            style={{ textDecoration: "none" }}
                        >
                            {data.uploader ?? "—"}
                        </Text>
                    ) : data.uploaderUrl ? (
                        <Text component={Link} href={data.uploaderUrl} size="sm" fw={600} c="inherit" style={{ textDecoration: "none" }}>
                            {data.uploader ?? "—"}
                        </Text>
                    ) : (
                        <Text size="sm" fw={600}>
                            {data.uploader ?? "—"}
                        </Text>
                    )}
                </Group>
                <Text size="xs" c="dimmed" visibleFrom="sm">
                    {data.uploaderSubscriberCount != null
                        ? formatSubscriberCountRu(data.uploaderSubscriberCount)
                        : null}
                </Text>
            </Stack>
            {channelId && !isLoading && isAuthenticated && !authPending ? (
                <>
                    {isSubscribed ? (
                        <Button color="dark" radius="sm" size="sm" visibleFrom="sm" onClick={handleUnsubscribe}>
                            Отписаться
                        </Button>
                    ) : (
                        <Button color="red" radius="sm" size="sm" visibleFrom="sm" onClick={handleSubscribe}>
                            Подписаться
                        </Button>
                    )}
                </>
            ) : null}

        </Group>
    )
}

export default ChannelBlock