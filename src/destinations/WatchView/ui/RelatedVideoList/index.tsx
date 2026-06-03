import { WatchRelatedCard } from "@/features/video"
import type { PipedRelatedStream } from "@/models/video"
import { Box, Text, Stack } from "@mantine/core"
import { FC } from "react"

interface RelatedVideoListProps {
    related: PipedRelatedStream[]
}

const RelatedVideoList: FC<RelatedVideoListProps> = ({ related }) => {
    return (
        <Box
            w={{ base: "100%", lg: 400 }}
            style={{ flexShrink: 0 }}
            pl={{ lg: 0 }}
        >
            <Text size="sm" fw={700} tt="uppercase" c="dimmed" mb="md" style={{ letterSpacing: 0.5 }}>
                Следующее
            </Text>
            <Stack gap="md">
                {related.length > 0 ? (
                    related.map((item, i) => (
                        <WatchRelatedCard key={`${item.url}-${i}`} item={item} />
                    ))
                ) : (
                    <Text size="sm" c="dimmed">
                        Нет связанных видео.
                    </Text>
                )}
            </Stack>
        </Box>
    )
}

export default RelatedVideoList