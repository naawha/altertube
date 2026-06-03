import { Avatar, Badge, Card, Group, Stack, Text } from "@mantine/core"
import { IconUserCircle } from "@tabler/icons-react"
import Link from "next/link"
import type { CSSProperties, FC, ReactNode } from "react"
import { parseChannelIdFromPipedUrl } from "@/features/video/lib/parseChannelId"
import type { ChannelShortType } from "@/shared/types"

function ChannelOuterLink({
    url,
    style,
    children,
}: {
    url: string
    style?: CSSProperties
    children: ReactNode
}) {
    const id = parseChannelIdFromPipedUrl(url)
    if (id) {
        return (
            <Link
                href={`/channel/${encodeURIComponent(id)}`}
                prefetch={false}
                style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, textDecoration: "none", color: "inherit", ...style }}
            >
                {children}
            </Link>
        )
    }
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, textDecoration: "none", color: "inherit", ...style }}
        >
            {children}
        </a>
    )
}

export type ChannelCardProps = {
    item: ChannelShortType
}

function formatSubscribers(n: number): string {
    if (!Number.isFinite(n) || n < 0) return ""
    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} млн подписчиков`
    }
    if (n >= 1_000) {
        return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")} тыс. подписчиков`
    }
    return `${n.toLocaleString("ru")} подписчиков`
}

function pluralizeVideos(n: number): string {
    const m10 = n % 10
    const m100 = n % 100
    if (m100 >= 11 && m100 <= 14) return "роликов"
    if (m10 === 1) return "ролик"
    if (m10 >= 2 && m10 <= 4) return "ролика"
    return "роликов"
}

const ChannelCard: FC<ChannelCardProps> = ({ item }) => {
    const subsLabel = formatSubscribers(item.subscribers)
    const videosLabel =
        item.videos > 0
            ? `${item.videos.toLocaleString("ru")} ${pluralizeVideos(item.videos)}`
            : null

    return (
        <Card
            padding="sm"
            radius="md"
            withBorder
            h="100%"
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <ChannelOuterLink url={item.url}>
                <Stack gap="sm" align="center">
                    <Avatar
                        src={item.thumbnail || undefined}
                        alt=""
                        name={item.name}
                        color="initials"
                        radius="xl"
                        size={88}
                    />
                    <Badge
                        size="xs"
                        variant="light"
                        color="gray"
                        leftSection={<IconUserCircle size={12} stroke={1.5} />}
                    >
                        Канал
                    </Badge>
                    <Group gap={6} justify="center" wrap="wrap">
                        <Text fw={600} size="sm" ta="center" lineClamp={2}>
                            {item.name}
                        </Text>
                    </Group>
                </Stack>
                <Stack gap="xs" mt="sm" style={{ flex: 1 }} justify="flex-end">
                    {subsLabel ? (
                        <Text size="xs" c="dimmed" ta="center">
                            {subsLabel}
                        </Text>
                    ) : null}
                    {videosLabel ? (
                        <Text size="xs" c="dimmed" ta="center">
                            {videosLabel}
                        </Text>
                    ) : null}
                    {item.description ? (
                        <Text size="xs" c="dimmed" lineClamp={3} style={{ lineHeight: 1.45 }}>
                            {item.description}
                        </Text>
                    ) : null}
                </Stack>
            </ChannelOuterLink>
        </Card>
    )
}

export default ChannelCard
