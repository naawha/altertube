import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core"
import type { FC, SubmitEvent } from "react"
import { useState } from "react"
import { useCreateUserPlaylistMutation } from "@/models/playlists"

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
  return "Не удалось создать плейлист."
}

export type PlaylistModalProps = {
  opened: boolean
  onClose: () => void
}

const PlaylistModal: FC<PlaylistModalProps> = ({ opened, onClose }) => {
  const [name, setName] = useState("")
  const [createPlaylist, { isLoading, isError, error, reset }] =
    useCreateUserPlaylistMutation()

  const handleClose = () => {
    setName("")
    reset()
    onClose()
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    reset()
    try {
      await createPlaylist({ name: trimmed }).unwrap()
      handleClose()
    } catch {
      /* ошибка через isError */
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Новый плейлист" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Название"
            placeholder="Например, Смотреть позже"
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
              Создать
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default PlaylistModal
