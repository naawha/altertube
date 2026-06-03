import {
  Avatar,
  Box,
  Container,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import Head from "next/head"
import type { FC } from "react"
import { WatchRelatedCard } from "@/features/video"
import { useGetPlaylistQuery, type PipedRelatedStream } from "@/models/video"

export type PlaylistViewProps = {
  playlistId: string
}


const PlaylistView: FC<PlaylistViewProps> = ({ playlistId }) => {
  const { data, isLoading, isError, error } = useGetPlaylistQuery(playlistId)

  const errText =
    error && typeof error === "object" && "data" in error && error.data != null
      ? JSON.stringify(error.data)
      : "Не удалось загрузить плейлист."

  const title = data?.name ?? "Плейлист"
  const videoCountLabel =
    data?.videos != null && data.videos > 0
      ? data.videos
      : data?.relatedStreams && data.relatedStreams.length > 0
        ? data.relatedStreams.length
        : null

  return (
    <>
      <Head>
        <title>{data?.name ? `${data.name} — плейлист — Piped Video` : "Плейлист — Piped Video"}</title>
      </Head>

      <Container py="xl" size="xl">
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader size="md" />
          </Group>
        ) : null}

        {isError ? (
          <Text size="sm" c="red">
            {errText}
          </Text>
        ) : null}

        {data ? (
          <Stack gap="lg">
            {data.bannerUrl ? (
              <Box
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  maxHeight: 200,
                }}
              >
                <Image src={data.bannerUrl} alt="" fit="cover" h={180} />
              </Box>
            ) : null}

            <Stack gap="xs">
              <Title order={2} style={{ wordBreak: "break-word" }}>
                {title}
              </Title>
              {data.uploader ? (
                <Group gap="sm" wrap="nowrap">
                  <Avatar
                    src={data.uploaderAvatar ?? undefined}
                    alt=""
                    name={data.uploader}
                    color="initials"
                    radius="xl"
                    size="md"
                  />
                  <Stack gap={2}>
                    <Group gap={6} wrap="wrap">
                      <Text size="sm" fw={600}>
                        {data.uploader}
                      </Text>
                      {data.uploaderVerified ? (
                        <Text size="xs" c="blue" component="span" aria-label="Верифицирован">
                          ✓
                        </Text>
                      ) : null}
                    </Group>
                    {data.uploaderUrl ? (
                      <Text
                        component="a"
                        href={data.uploaderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        c="dimmed"
                      >
                        Канал
                      </Text>
                    ) : null}
                  </Stack>
                </Group>
              ) : null}
              {videoCountLabel != null ? (
                <Text size="sm" c="dimmed">
                  {videoCountLabel.toLocaleString("ru")} видео
                </Text>
              ) : null}
            </Stack>

            {data.relatedStreams && data.relatedStreams.length > 0 ? (
              <Stack gap="md">
                {data.relatedStreams.map((item: PipedRelatedStream, i: number) => (
                  <WatchRelatedCard key={`${item.url}-${i}`} item={item} />
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" size="sm">
                В плейлисте пока нет видео.
              </Text>
            )}
          </Stack>
        ) : null}
      </Container>
    </>
  )
}

export default PlaylistView
