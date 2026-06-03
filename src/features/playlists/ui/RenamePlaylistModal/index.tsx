import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core"
import type { FC, FormEvent } from "react"
import { useEffect, useState } from "react"
import { useRenameUserPlaylistMutation } from "@/models/playlists"

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
  return "Не удалось переименовать плейлист."
}

export type RenamePlaylistModalProps = {
  opened: boolean
  onClose: () => void
  playlistId: string
  initialName: string
}

const RenamePlaylistModal: FC<RenamePlaylistModalProps> = ({
  opened,
  onClose,
  playlistId,
  initialName,
}) => {
  const [name, setName] = useState(initialName)
  const [renamePlaylist, { isLoading, isError, error, reset }] =
    useRenameUserPlaylistMutation()

  useEffect(() => {
    if (opened) {
      setName(initialName)
      reset()
    }
  }, [opened, initialName, reset])

  const handleClose = () => {
    setName(initialName)
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !playlistId) return
    reset()
    try {
      await renamePlaylist({ playlistId, newName: trimmed }).unwrap()
      handleClose()
    } catch {
      /* ошибка через isError */
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Переименовать плейлист"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Название"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoFocus
            required
          />
          {isError ? (
            <Text size="sm" c="red">
              {getErrorMessage(error)}
            </Text>
          ) : null}
          <Group justify="flex-end" gap="sm">
            <Button type="button" variant="default" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" loading={isLoading}>
              Сохранить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default RenamePlaylistModal
