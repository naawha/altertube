import { AspectRatio, Box, Group, Image, Stack, Text, UnstyledButton } from "@mantine/core"
import Link from "next/link"
import type { PipedRelatedStream } from "@/models/video/api/videoSlice"
import { parseVideoIdFromPipedWatchUrl } from "@/features/video/lib/parseVideoId"
import { FC } from "react"

function formatDuration(seconds: number): string {
  if (seconds == null || seconds < 0 || !Number.isFinite(seconds)) return ""
  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }
  return `${m}:${String(sec).padStart(2, "0")}`
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} млн просмотров`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")} тыс. просмотров`
  return `${n.toLocaleString("ru")} просмотров`
}

export type WatchRelatedCardProps = {
  item: PipedRelatedStream
}

const WatchRelatedCard: FC<WatchRelatedCardProps> = ({ item }) => {
  const id = parseVideoIdFromPipedWatchUrl(item.url)
  if (!id) return null

  const durationLabel = formatDuration(item.duration ?? NaN)

  const inner = (
    <Group wrap="nowrap" align="flex-start" gap="sm" w="100%">
      <Box pos="relative" w={168} style={{ flexShrink: 0 }}>
        <AspectRatio ratio={16 / 9}>
          <Image src={item.thumbnail} alt="" fit="cover" radius="sm" />
        </AspectRatio>
        {durationLabel ? (
          <Text
            size="xs"
            fw={600}
            px={6}
            py={2}
            style={{
              position: "absolute",
              right: 4,
              bottom: 4,
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "#fff",
              borderRadius: 4,
              lineHeight: 1.2,
            }}
          >
            {durationLabel}
          </Text>
        ) : null}
      </Box>
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} lineClamp={2} style={{ lineHeight: 1.35 }}>
          {item.title}
        </Text>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {item.uploaderName}
        </Text>
        {item.views != null && item.views >= 0 ? (
          <Text size="xs" c="dimmed">
            {formatViews(item.views)}
          </Text>
        ) : null}
      </Stack>
    </Group>
  )

  return (
    <UnstyledButton
      component={Link}
      href={`/watch?v=${encodeURIComponent(id)}`}
      prefetch={false}
      style={{ display: "block", width: "100%", textAlign: "left", color: "inherit" }}
    >
      {inner}
    </UnstyledButton>
  )
}

export default WatchRelatedCard