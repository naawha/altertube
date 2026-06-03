import { Button, Group, Modal, Stack, Text } from "@mantine/core"
import type { FC } from "react"
import { useDeleteUserPlaylistMutation } from "@/models/playlists"

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
  return "Не удалось удалить плейлист."
}

export type DeletePlaylistModalProps = {
  opened: boolean
  onClose: () => void
  playlistId: string
  playlistName: string
}

const DeletePlaylistModal: FC<DeletePlaylistModalProps> = ({
  opened,
  onClose,
  playlistId,
  playlistName,
}) => {
  const [deletePlaylist, { isLoading, isError, error, reset }] =
    useDeleteUserPlaylistMutation()

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleDelete = async () => {
    if (!playlistId) return
    reset()
    try {
      await deletePlaylist({ playlistId }).unwrap()
      handleClose()
    } catch {
      /* ошибка через isError */
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Удалить плейлист?" centered>
      <Stack gap="md">
        <Text size="sm">
          Плейлист «{playlistName}» будет удалён без возможности восстановления.
        </Text>
        {isError ? (
          <Text size="sm" c="red">
            {getErrorMessage(error)}
          </Text>
        ) : null}
        <Group justify="flex-end" gap="sm">
          <Button type="button" variant="default" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="button" color="red" loading={isLoading} onClick={handleDelete}>
            Удалить
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default DeletePlaylistModal
