import type { FC } from "react"
import { Button, Group, SimpleGrid, Stack } from "@mantine/core"
import type { VideoGridItemType } from "@/shared/types"
import ChannelCard from "../ChannelCard"
import PlaylistCard from "../PlaylistCard"
import VideoCard from "../VideoCard"

interface VideoGridProps {
    data: VideoGridItemType[]
    noChannel?: boolean
    /** Курсор следующей страницы (Piped `nextpage`). */
    nextPage?: string | null
    onLoadMore?: () => void
    isLoadingMore?: boolean
}

const VideoGrid: FC<VideoGridProps> = ({
    data,
    noChannel,
    nextPage,
    onLoadMore,
    isLoadingMore,
}) => {
    const showLoadMore = Boolean(nextPage && onLoadMore)

    return (
        <Stack gap="md">
            <SimpleGrid
                cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4, xl: 5 }}
                spacing={{ base: "sm", sm: "md" }}
            >
                {data.map((item) =>
                    item.type === "playlist" ? (
                        <PlaylistCard noChannel={noChannel} key={item.playlistId} item={item} />
                    ) : item.type === "channel" ? (
                        <ChannelCard key={item.authorId} item={item} />
                    ) : item.type === "hashtag" ? (
                        <div></div>
                    ) : (
                        <VideoCard noChannel={noChannel} key={item.videoId} item={item} />
                    )
                )}
            </SimpleGrid>
            {showLoadMore ? (
                <Group justify="center">
                    <Button
                        variant="light"
                        onClick={onLoadMore}
                        loading={isLoadingMore}
                    >
                        Показать ещё
                    </Button>
                </Group>
            ) : null}
        </Stack>
    )
}

export default VideoGrid