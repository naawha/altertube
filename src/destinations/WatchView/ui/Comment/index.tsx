"use client"

import type { FC } from "react"
import { useState } from "react"
import { Avatar, Badge, Button, Group, Stack, Text } from "@mantine/core"
import { IconChevronDown, IconChevronUp, IconThumbUp } from "@tabler/icons-react"
import type { PipedCommentType } from "@/models/comments"
import CommentRepliesSection from "../CommentReplies"

export type CommentProps = {
    comment: PipedCommentType
    videoId: string
}

function pluralizeReplies(n: number): string {
    const m10 = n % 10
    const m100 = n % 100
    if (m100 >= 11 && m100 <= 14) return "ответов"
    if (m10 === 1) return "ответ"
    if (m10 >= 2 && m10 <= 4) return "ответа"
    return "ответов"
}

const Comment: FC<CommentProps> = ({ comment, videoId }) => {
    const [repliesOpen, setRepliesOpen] = useState(false)
    const canLoadReplies = Boolean(comment.repliesPage && comment.replyCount > 0)

    return (
        <Stack gap={0}>
            <Group wrap="nowrap" align="flex-start" gap="md">
                <Avatar src={comment.thumbnail || undefined} alt="" radius="xl" size={40} color="gray">
                    {(comment.author || "?").slice(0, 1).toUpperCase()}
                </Avatar>
                <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                    <Group gap={8} wrap="wrap">
                        <Text size="sm" fw={600} component="span">
                            {comment.author}
                        </Text>
                        {comment.verified ? (
                            <Badge size="xs" variant="light" color="blue">
                                ✓
                            </Badge>
                        ) : null}
                        {comment.pinned ? (
                            <Badge size="xs" variant="filled" color="gray">
                                Закреплено
                            </Badge>
                        ) : null}
                        {comment.channelOwner ? (
                            <Badge size="xs" variant="light" color="orange">
                                Автор
                            </Badge>
                        ) : null}
                        <Text size="xs" c="dimmed" component="span">
                            {comment.commentedTime}
                        </Text>
                    </Group>
                    <Text
                        component="div"
                        size="sm"
                        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                        <span dangerouslySetInnerHTML={{ __html: comment.commentText }} />
                    </Text>
                    <Group gap="md">
                        {comment.likeCount > 0 ? (
                            <Group gap={4} c="dimmed">
                                <IconThumbUp size={16} stroke={1.5} />
                                <Text size="xs">{comment.likeCount.toLocaleString("ru")}</Text>
                            </Group>
                        ) : null}
                        {canLoadReplies ? (
                            <Button
                                variant="subtle"
                                size="compact-xs"
                                px={4}
                                leftSection={
                                    repliesOpen ? (
                                        <IconChevronUp size={14} stroke={1.5} />
                                    ) : (
                                        <IconChevronDown size={14} stroke={1.5} />
                                    )
                                }
                                onClick={() => setRepliesOpen((v) => !v)}
                            >
                                {repliesOpen
                                    ? "Скрыть ответы"
                                    : `${comment.replyCount.toLocaleString("ru")} ${pluralizeReplies(comment.replyCount)}`}
                            </Button>
                        ) : comment.replyCount > 0 ? (
                            <Text size="xs" c="dimmed">
                                {comment.replyCount.toLocaleString("ru")} {pluralizeReplies(comment.replyCount)}
                            </Text>
                        ) : null}
                    </Group>
                </Stack>
            </Group>

            {repliesOpen && comment.repliesPage ? (
                <CommentRepliesSection videoId={videoId} nextPageData={comment.repliesPage} />
            ) : null}
        </Stack>
    )
}

export default Comment
