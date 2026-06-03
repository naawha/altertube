import {
  Container,
  Group,
  Loader,
  Text,
  Title,
} from "@mantine/core"
import Head from "next/head"
import type { FC } from "react"
import useUserState from "@/models/profile/hooks/useUserState"
import {
  useGetSubscriptionsQuery,
} from "@/models/subscription/api/subscriptionSlice"
import { VideoGrid } from "@/features/video"
import { VideoGridItemType } from "@/shared/types"


const SubscriptionsView: FC = () => {
  const { isAuthenticated, authPending } = useUserState()
  const { data, isLoading, isError, error } = useGetSubscriptionsQuery(undefined, {
    skip: !isAuthenticated || authPending,
  })

  const _data: VideoGridItemType[] = (data || []).map((channel) => ({
    type: "channel",
    description: "",
    name: channel.name,
    subscribers: -1,
    thumbnail: channel.avatar ?? "",
    url: channel.url,
    verified: channel.verified,
    videos: -1,
  }))

  const errText =
    error && typeof error === "object" && "data" in error && error.data != null
      ? JSON.stringify(error.data)
      : "Не удалось загрузить подписки."

  if (!isAuthenticated && !authPending) {
    return (
      <>
        <Head>
          <title>Подписки — Piped Video</title>
        </Head>
        <Container py="xl" size="md">
          <Text c="dimmed">Войдите через «Авторизация», чтобы видеть список подписок.</Text>
        </Container>
      </>
    )
  }

  if (authPending) {
    return (
      <>
        <Head>
          <title>Подписки — Piped Video</title>
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
        <title>Подписки — Piped Video</title>
      </Head>
      <Container py="xl" size="md">
        <Title order={2} mb="lg">
          Подписки
        </Title>

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
          <Text c="dimmed">Вы ни на кого не подписаны.</Text>
        ) : null}

        {data && data.length > 0 && (
          <VideoGrid data={_data} />
        )}
      </Container>
    </>
  )
}

export default SubscriptionsView
