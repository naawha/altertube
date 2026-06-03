import { VideoGrid } from "@/features/video"
import { PipedRelatedStream, useLazyGetChannelNextPageQuery } from "@/models/video"
import { VideoGridItemType } from "@/shared/types"
import { FC, useCallback, useMemo, useState } from "react"
import { pipedRelatedToGridItem } from "./helpers"

interface ChannelVideosGridProps {
    channelId: string
    initialStreams: PipedRelatedStream[]
    initialNextPage: string | null
}

/** Отдельный инстанс на каждый `channelId` через `key` — сброс пагинации без эффектов. */
const ChannelVideosGrid: FC<ChannelVideosGridProps> = ({
    channelId,
    initialStreams,
    initialNextPage,
}) => {
    const [extraStreams, setExtraStreams] = useState<PipedRelatedStream[]>([])
    /** `undefined` — курсор из `initialNextPage` (подтягивается при отложенной загрузке). */
    const [nextPageOverride, setNextPageOverride] = useState<string | null | undefined>(
        undefined,
    )
    const [fetchNextPage, { isFetching: isLoadingMore }] =
        useLazyGetChannelNextPageQuery()

    const nextCursor =
        nextPageOverride === undefined ? initialNextPage : nextPageOverride

    const gridItems = useMemo((): VideoGridItemType[] => {
        return [...initialStreams, ...extraStreams].map(pipedRelatedToGridItem)
    }, [initialStreams, extraStreams])

    const handleLoadMore = useCallback(async () => {
        if (!nextCursor) return
        try {
            const res = await fetchNextPage({
                channelId,
                nextPageData: nextCursor,
            }).unwrap()
            setExtraStreams((prev) => [...prev, ...(res.relatedStreams ?? [])])
            setNextPageOverride(res.nextpage ?? null)
        } catch {
            /* ignore */
        }
    }, [channelId, nextCursor, fetchNextPage])

    return (
        <VideoGrid
            noChannel
            data={gridItems}
            nextPage={nextCursor}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
        />
    )
}

export default ChannelVideosGrid