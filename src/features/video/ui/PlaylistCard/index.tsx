import {
  AspectRatio,
  Avatar,
  Box,
  Button,
  Card,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconPencil, IconPlaylist, IconTrash } from "@tabler/icons-react"
import Link from "next/link"
import type { CSSProperties, FC, ReactNode } from "react"
import { DeletePlaylistModal, RenamePlaylistModal } from "@/features/playlists/ui"
import { parsePlaylistIdFromPipedUrl } from "@/features/video/lib/parsePlaylistId"
import type { PlaylistShortType } from "@/shared/types"

function PlaylistOuterLink({
  url,
  style,
  children,
}: {
  url: string
  style?: CSSProperties
  children: ReactNode
}) {
  const id = parsePlaylistIdFromPipedUrl(url)
  if (id) {
    return (
      <Link
        href={`/playlist?list=${encodeURIComponent(id)}`}
        prefetch={false}
        style={{ display: "block", textDecoration: "none", color: "inherit", ...style }}
      >
        {children}
      </Link>
    )
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "block", textDecoration: "none", color: "inherit", ...style }}
    >
      {children}
    </a>
  )
}

export type PlaylistCardProps = {
  item: PlaylistShortType
  noChannel?: boolean
}

function pluralizeVideos(n: number): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m100 >= 11 && m100 <= 14) return "роликов"
  if (m10 === 1) return "ролик"
  if (m10 >= 2 && m10 <= 4) return "ролика"
  return "роликов"
}

const PlaylistCard: FC<PlaylistCardProps> = ({ item, noChannel }) => {
  const isMyPlaylist = item.authorUrl === ""
  const playlistUrl = `/playlist?list=${encodeURIComponent(item.playlistId)}`
  const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false)
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false)

  const videosLabel =
    item.videoCount > 0
      ? `${item.videoCount.toLocaleString("ru")} ${pluralizeVideos(item.videoCount)}`
      : null

  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      h="100%"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card.Section>
        <PlaylistOuterLink url={playlistUrl}>
          <Box pos="relative">
            <AspectRatio ratio={16 / 9}>
              <Image src={item.playlistThumbnail} alt="" fit="cover" />
            </AspectRatio>
            <Group
              gap={6}
              pos="absolute"
              bottom={8}
              left={8}
              right={8}
              justify="space-between"
              wrap="nowrap"
            >
              <Group
                gap={4}
                px={8}
                py={4}
                style={{
                  borderRadius: 4,
                  backgroundColor: "rgba(0,0,0,0.75)",
                  color: "#fff",
                }}
              >
                <IconPlaylist size={14} stroke={1.5} aria-hidden />
                <Text size="xs" fw={600}>
                  Плейлист
                </Text>
              </Group>
              {videosLabel ? (
                <Text
                  size="xs"
                  fw={600}
                  px={6}
                  py={2}
                  style={{
                    borderRadius: 4,
                    backgroundColor: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {videosLabel}
                </Text>
              ) : null}
            </Group>
          </Box>
        </PlaylistOuterLink>
      </Card.Section>
      <Stack gap="xs" mt="sm" style={{ flex: 1 }} justify="space-between">
        <PlaylistOuterLink
          url={playlistUrl}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Text fw={500} size="sm" lineClamp={2}>
            {item.title}
          </Text>
        </PlaylistOuterLink>
        {isMyPlaylist && item.playlistId ? (
          <>
            <Group gap={6} grow wrap="nowrap">
              <Button
                size="compact-sm"
                variant="light"
                flex={1}
                leftSection={<IconPencil size={14} stroke={1.5} />}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  openRename()
                }}
              >
                Изменить
              </Button>
              <Button
                size="compact-sm"
                variant="light"
                color="red"
                flex={1}
                leftSection={<IconTrash size={14} stroke={1.5} />}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  openDelete()
                }}
              >
                Удалить
              </Button>
            </Group>
            <RenamePlaylistModal
              opened={renameOpened}
              onClose={closeRename}
              playlistId={item.playlistId}
              initialName={item.title}
            />
            <DeletePlaylistModal
              opened={deleteOpened}
              onClose={closeDelete}
              playlistId={item.playlistId}
              playlistName={item.title}
            />
          </>
        ) : null}

        {!noChannel && !isMyPlaylist && (
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <Avatar
              alt=""
              name={item.author}
              color="initials"
              radius="xl"
              size="md"
            />
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" fw={500} lineClamp={1}>
                {item.author}
              </Text>
            </Stack>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

export default PlaylistCard
