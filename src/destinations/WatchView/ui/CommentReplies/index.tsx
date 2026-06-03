import type { FC } from "react"
import { useState } from "react"
import { Stack, Loader, Text, Button } from "@mantine/core"
import { useGetCommentsRepliesQuery } from "@/models/comments"
import Comment from "../Comment"

interface CommentRepliesSectionProps {
    videoId: string
    nextPageData: string
}

const CommentRepliesSection: FC<CommentRepliesSectionProps> = ({
    videoId,
    nextPageData,
}) => {
    const { data, isLoading, isError, error } = useGetCommentsRepliesQuery(
        { videoId, nextPageData },
        { skip: !nextPageData }
    )
    const [showNextPage, setShowNextPage] = useState(false)

    if (isLoading) {
        return (
            <Stack pl="xl" pt="xs">
                <Loader size="sm" />
            </Stack>
        )
    }

    if (isError) {
        const msg =
            error && typeof error === "object" && "data" in error && error.data != null
                ? JSON.stringify(error.data)
                : "Не удалось загрузить ответы."
        return (
            <Text size="xs" c="red" pl="xl">
                {msg}
            </Text>
        )
    }

    if (!data) return null

    const replies = data.comments ?? []

    return (
        <Stack
            gap="md"
            pl="md"
            ml="sm"
            pt="xs"
            style={{
                borderLeft: "2px solid var(--mantine-color-default-border)",
            }}
        >
            {replies.map((c) => (
                <Comment key={c.commentId} comment={c} videoId={videoId} />
            ))}
            {data.nextpage && !showNextPage ? (
                <Button variant="subtle" size="xs" onClick={() => setShowNextPage(true)}>
                    Показать ещё
                </Button>
            ) : null}
            {data.nextpage && showNextPage ? (
                <CommentRepliesSection videoId={videoId} nextPageData={data.nextpage} />
            ) : null}
        </Stack>
    )
}

export default CommentRepliesSection