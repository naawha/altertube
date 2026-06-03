import {
  Anchor,
  Button,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
} from "@mantine/core"
import Link from "next/link"
import type { FC, FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  useAddVideosToUserPlaylistMutation,
  useGetUserPlaylistsQuery,
} from "@/models/playlists"
import useUserState from "@/models/profile/hooks/useUserState"

function getErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "data" in err &&
    typeof (err as { data: unknown }).data === "object" &&
    (err as { data: { error?: string } | null }).data &&
    typeof (err as { data: { error?: string } }).data.error === "string"
  ) {
    return (err as { data: { error: string } }).data.error
  }
  if (err instanceof Error) {
    return err.message
  }
  return "Не удалось добавить в плейлист."
}

export type AddToPlaylistModalProps = {
  opened: boolean
  onClose: () => void
  /** Id ролика (например из `parseVideoIdFromPipedWatchUrl`). */
  videoId: string | null
  videoTitle?: string
}

const AddToPlaylistModal: FC<AddToPlaylistModalProps> = ({
  opened,
  onClose,
  videoId,
  videoTitle,
}) => {
  const { isAuthenticated, authPending } = useUserState()
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const { data: playlists, isLoading: listsLoading } = useGetUserPlaylistsQuery(
    undefined,
    { skip: !opened || !isAuthenticated || authPending },
  )
  const [addVideos, { isLoading: addLoading, isError, error, reset }] =
    useAddVideosToUserPlaylistMutation()

  const selectData = useMemo(
    () =>
      (playlists ?? []).map((p) => ({
        value: String(p.id),
        label: p.name,
      })),
    [playlists],
  )

  useEffect(() => {
    if (opened) {
      setPlaylistId(null)
      reset()
    }
  }, [opened, reset])

  const handleClose = () => {
    setPlaylistId(null)
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!videoId || !playlistId) return
    reset()
    try {
      await addVideos({
        playlistId,
        videoIds: [videoId],
      }).unwrap()
      handleClose()
    } catch {
      /* isError */
    }
  }

  const title = videoTitle
    ? `Добавить в плейлист: ${videoTitle.length > 48 ? `${videoTitle.slice(0, 45)}…` : videoTitle}`
    : "Добавить в плейлист"

  return (
    <Modal opened={opened} onClose={handleClose} title={title} centered size="sm">
      {authPending ? (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      ) : !isAuthenticated ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Войдите в аккаунт, чтобы сохранять ролики в плейлисты.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              Закрыть
            </Button>
          </Group>
        </Stack>
      ) : !videoId ? (
        <Stack gap="md">
          <Text size="sm" c="red">
            Не удалось определить id видео по ссылке.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              Закрыть
            </Button>
          </Group>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {listsLoading ? (
              <Group justify="center" py="md">
                <Loader size="sm" />
              </Group>
            ) : selectData.length === 0 ? (
              <Text size="sm" c="dimmed">
                У вас ещё нет плейлистов.{" "}
                <Anchor component={Link} href="/playlists" size="sm">
                  Создать на странице «Плейлисты»
                </Anchor>
                .
              </Text>
            ) : (
              <Select
                label="Плейлист"
                placeholder="Выберите плейлист"
                data={selectData}
                value={playlistId}
                onChange={setPlaylistId}
                searchable
                required
              />
            )}
            {isError ? (
              <Text size="sm" c="red">
                {getErrorMessage(error)}
              </Text>
            ) : null}
            <Group justify="flex-end" gap="sm">
              <Button type="button" variant="default" onClick={handleClose}>
                Отмена
              </Button>
              <Button
                type="submit"
                loading={addLoading}
                disabled={!playlistId || selectData.length === 0 || listsLoading}
              >
                Добавить
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  )
}

export default AddToPlaylistModal
