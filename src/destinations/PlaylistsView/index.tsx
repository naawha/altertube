import { Button, Container, Group, Loader, Text, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconPlaylistAdd } from "@tabler/icons-react"
import Head from "next/head"
import type { FC } from "react"
import { PlaylistModal } from "@/features/playlists"
import { VideoGrid } from "@/features/video"
import {
  useGetUserPlaylistsQuery,
  convertUserPlaylistToYouTubePlaylist,
} from "@/models/playlists"
import useUserState from "@/models/profile/hooks/useUserState"
import type { VideoGridItemType } from "@/shared/types"

const PlaylistsView: FC = () => {
  const { isAuthenticated, authPending } = useUserState()
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false)
  const { data, isLoading, isError, error } = useGetUserPlaylistsQuery(undefined, {
    skip: !isAuthenticated || authPending,
  })

  const gridItems: VideoGridItemType[] = (data ?? []).map(
    convertUserPlaylistToYouTubePlaylist,
  )

  const errText =
    error && typeof error === "object" && "data" in error && error.data != null
      ? JSON.stringify(error.data)
      : "Не удалось загрузить плейлисты."

  if (!isAuthenticated && !authPending) {
    return (
      <>
        <Head>
          <title>Мои плейлисты — Piped Video</title>
        </Head>
        <Container py="xl" size="md">
          <Text c="dimmed">Войдите, чтобы видеть свои плейлисты.</Text>
        </Container>
      </>
    )
  }

  if (authPending) {
    return (
      <>
        <Head>
          <title>Мои плейлисты — Piped Video</title>
        </Head>
        <Container py="xl" size="md">
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        </Container>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Мои плейлисты — Piped Video</title>
      </Head>
      <Container py="xl" size="xl">
        <Group justify="space-between" align="center" mb="lg" wrap="wrap" gap="sm">
          <Title order={2}>Мои плейлисты</Title>
          <Button
            leftSection={<IconPlaylistAdd size={18} stroke={1.5} />}
            onClick={openCreate}
          >
            Новый плейлист
          </Button>
        </Group>

        {isLoading ? (
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        ) : null}

        {isError ? (
          <Text size="sm" c="red">
            {errText}
          </Text>
        ) : null}

        {!isLoading && !isError && data && data.length === 0 ? (
          <Text c="dimmed">У вас пока нет плейлистов.</Text>
        ) : null}

        {data && data.length > 0 ? <VideoGrid data={gridItems} /> : null}

        <PlaylistModal opened={createOpened} onClose={closeCreate} />
      </Container>
    </>
  )
}

export default PlaylistsView
