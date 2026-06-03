import { VideoGrid } from "@/features/video"
import { useLazyGetSearchNextPageQuery } from "@/models/search"
import type { VideoGridItemType } from "@/shared/types"
import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"

export type SearchResultsGridProps = {
  q: string
  filter?: string
  initialItems: VideoGridItemType[]
  initialNextPage: string | null
}

/** Отдельный инстанс на каждый запрос через `key` — сброс пагинации без эффектов. */
const SearchResultsGrid: FC<SearchResultsGridProps> = ({
  q,
  filter = "all",
  initialItems,
  initialNextPage,
}) => {
  const [extraItems, setExtraItems] = useState<VideoGridItemType[]>([])
  /** `undefined` — курсор из `initialNextPage` (подтягивается при отложенной загрузке). */
  const [nextPageOverride, setNextPageOverride] = useState<string | null | undefined>(
    undefined,
  )
  const [fetchNextPage, { isFetching: isLoadingMore }] =
    useLazyGetSearchNextPageQuery()

  const nextCursor =
    nextPageOverride === undefined ? initialNextPage : nextPageOverride

  const gridItems = useMemo((): VideoGridItemType[] => {
    return [...initialItems, ...extraItems]
  }, [initialItems, extraItems])

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) return
    try {
      const res = await fetchNextPage({
        q,
        filter,
        nextPageData: nextCursor,
      }).unwrap()
      setExtraItems((prev) => [...prev, ...res.items])
      setNextPageOverride(res.nextpage ?? null)
    } catch {
      /* ignore */
    }
  }, [q, filter, nextCursor, fetchNextPage])

  return (
    <VideoGrid
      data={gridItems}
      nextPage={nextCursor}
      onLoadMore={handleLoadMore}
      isLoadingMore={isLoadingMore}
    />
  )
}

export default SearchResultsGrid
