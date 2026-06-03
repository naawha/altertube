import { Group, Loader, Stack, Text } from "@mantine/core"
import type { FC } from "react"
import { useGetComments } from "@/models/comments"
import Comment from "../Comment"

export type CommentsSectionProps = {
  videoId: string
}

const CommentsSection: FC<CommentsSectionProps> = ({ videoId }) => {
  const { data, isLoading, isError, error } = useGetComments(videoId)

  if (isLoading) {
    return (
      <Group justify="center" py="md">
        <Loader size="sm" />
      </Group>
    )
  }

  if (isError) {
    const msg =
      error && typeof error === "object" && "data" in error && error.data != null
        ? JSON.stringify(error.data)
        : "Не удалось загрузить комментарии."
    return (
      <Text size="sm" c="red">
        {msg}
      </Text>
    )
  }

  if (!data) return null

  if (data.disabled) {
    return (
      <Text size="sm" c="dimmed">
        Комментарии отключены.
      </Text>
    )
  }

  const list = data.comments ?? []

  return (
    <Stack gap="md" mt="lg">
      <Text fw={700} size="lg">
        {data.commentCount.toLocaleString("ru")}{" "}
        {pluralizeComments(data.commentCount)}
      </Text>

      {list.length === 0 ? (
        <Text size="sm" c="dimmed">
          Комментариев пока нет.
        </Text>
      ) : (
        <Stack gap="lg">
          {list.map((c) => (
            <Comment key={c.commentId} comment={c} videoId={videoId} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

function pluralizeComments(n: number): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m100 >= 11 && m100 <= 14) return "комментариев"
  if (m10 === 1) return "комментарий"
  if (m10 >= 2 && m10 <= 4) return "комментария"
  return "комментариев"
}


export default CommentsSection
