import {
  ActionIcon,
  AspectRatio,
  Avatar,
  Box,
  Card,
  Group,
  Image,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconPlaylistAdd, IconShare } from "@tabler/icons-react"
import type { VideoShortType } from "@/shared/types"
import { FC, useMemo } from "react"
import { AddToPlaylistModal } from "@/features/playlists"
import { shareVideoUrl } from "./helpers"
import ShortsTag from "../ShortsTag"
import DateDisplay from "@/shared/ui/DateDisplay"
import UrlHelper from "@/shared/helpers/UrlHelper"

export type VideoCardProps = {
  item: VideoShortType
  noChannel?: boolean
}

const VideoCard: FC<VideoCardProps> = ({ item, noChannel }) => {
  const [playlistModalOpened, { open: openPlaylistModal, close: closePlaylistModal }] =
    useDisclosure(false)

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
        <a
          href={UrlHelper.watch(item.videoId)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Box pos="relative">
            <AspectRatio ratio={16 / 9}>
              <Image src={item.videoThumbnails[0].url} alt="" fit="cover" />
            </AspectRatio>
            {item.type === "shortVideo" ? <ShortsTag /> : null}
          </Box>
        </a>
      </Card.Section>
      <Stack gap="xs" mt="sm" style={{ flex: 1 }} justify="space-between">
        <a
          href={UrlHelper.watch(item.videoId)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Text fw={500} size="sm" lineClamp={2}>
            {item.title}
          </Text>
        </a>
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            {!noChannel && (
              <Text size="xs" fw={500} lineClamp={1}>
                {item.author}
              </Text>
            )}
            <Group gap="xs" align="center" wrap="nowrap" justify="space-between">
              <DateDisplay timestamp={item.published!} />
              <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                <Tooltip
                  label={
                    item.videoId ? "Добавить в плейлист" : "Не удалось определить видео по ссылке"
                  }
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label="Добавить в плейлист"
                    disabled={!item.videoId}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (item.videoId) openPlaylistModal()
                    }}
                  >
                    <IconPlaylistAdd size={16} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Поделиться">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label="Поделиться"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      void shareVideoUrl(UrlHelper.watch(item.videoId), item.title)
                    }}
                  >
                    <IconShare size={16} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Stack>
        </Group>
      </Stack>
      <AddToPlaylistModal
        opened={playlistModalOpened}
        onClose={closePlaylistModal}
        videoId={item.videoId}
        videoTitle={item.title}
      />
    </Card>
  )
}

export default VideoCard
