import {
  Avatar,
  Box,
  Button,
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
import useUserState from "@/models/profile/hooks/useUserState"
import { useSubscription } from "@/models/subscription"
import {
  useGetChannelQuery,
} from "@/models/video"
import { formatSubscriberCountRu } from "@/shared/lib/formatSubscriberCountRu"
import ChannelVideosGrid from "./ui/ChannelVideoGrid"

interface ChannelViewProps {
  channelId: string
}

const ChannelView: FC<ChannelViewProps> = ({ channelId }) => {
  const { isAuthenticated, authPending } = useUserState()
  const { data, isLoading, isError, error } = useGetChannelQuery(channelId)
  const { isSubscribed, subscribe, unsubscribe, isLoading: subLoading } =
    useSubscription(channelId)

  const errText =
    error && typeof error === "object" && "data" in error && error.data != null
      ? JSON.stringify(error.data)
      : "Не удалось загрузить канал."

  const title = data?.name ?? "Канал"

  return (
    <>
      <Head>
        <title>
          {data?.name ? `${data.name} — канал — Piped Video` : "Канал — Piped Video"}
        </title>
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

            <Group align="flex-start" wrap="nowrap" gap="md">
              <Avatar
                src={data.avatarUrl ?? undefined}
                alt=""
                name={data.name}
                color="initials"
                radius="xl"
                size={80}
                style={{ flexShrink: 0 }}
              />
              <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                <Group gap="sm" align="center" wrap="wrap">
                  <Title order={2} style={{ wordBreak: "break-word" }}>
                    {title}
                  </Title>
                  {data.verified ? (
                    <Text size="sm" c="blue" component="span" aria-label="Верифицирован">
                      ✓
                    </Text>
                  ) : null}
                </Group>
                {data.subscriberCount != null && data.subscriberCount >= 0 ? (
                  <Text size="sm" c="dimmed">
                    {formatSubscriberCountRu(data.subscriberCount)}
                  </Text>
                ) : null}
                {isAuthenticated && !authPending && !subLoading ? (
                  <Group gap="sm">
                    {isSubscribed ? (
                      <Button variant="default" size="sm" onClick={() => void unsubscribe(channelId)}>
                        Отписаться
                      </Button>
                    ) : (
                      <Button color="red" size="sm" onClick={() => void subscribe(channelId)}>
                        Подписаться
                      </Button>
                    )}
                  </Group>
                ) : null}
              </Stack>
            </Group>

            {data.description ? (
              <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {data.description}
              </Text>
            ) : null}

            <Title order={3} mt="md">
              Видео
            </Title>

            <ChannelVideosGrid
              key={channelId}
              channelId={channelId}
              initialStreams={data.relatedStreams ?? []}
              initialNextPage={data.nextpage ?? null}
            />
          </Stack>
        ) : null}
      </Container>
    </>
  )
}

export default ChannelView
