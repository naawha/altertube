import { Box, Flex, Group, Loader, Stack, Text, Title } from "@mantine/core"
import Head from "next/head"
import type { FC } from "react"
import { Player } from "@/features/video"
import { useGetVideoQuery } from "@/models/video"
import DateDisplay from "@/shared/ui/DateDisplay"
import ChannelBlock from "./ui/ChannelBlock"
import DescriptionSection from "./ui/DescriptionSection"
import CommentsSection from "./ui/CommentsSection"
import RelatedVideoList from "./ui/RelatedVideoList"

interface WatchViewProps {
  videoId: string
}

const WatchView: FC<WatchViewProps> = ({ videoId }) => {
  const { data, isLoading, isError, error } = useGetVideoQuery(videoId)

  const errText =
    error && typeof error === "object" && "data" in error && error.data != null
      ? JSON.stringify(error.data)
      : "Не удалось загрузить видео."

  const related = data?.relatedStreams?.filter(Boolean) ?? []

  return (
    <>
      <Head>
        <title>
          {data?.title ? `${data.title} — Piped Video` : "Просмотр — Piped Video"}
        </title>
      </Head>

      <Box
        component="main"
        px={{ base: "md", sm: "lg", xl: 48 }}
        py={{ base: "md", sm: 24 }}
        maw={1920}
        mx="auto"
      >
        {isLoading ? (
          <Flex justify="center" py="xl">
            <Loader size="md" />
          </Flex>
        ) : null}

        {isError ? (
          <Text c="red" size="sm">
            {errText}
          </Text>
        ) : null}

        {data ? (
          <Flex
            gap={{ base: "lg", lg: 24 }}
            align="flex-start"
            direction={{ base: "column", lg: "row" }}
            wrap="nowrap"
          >
            <Stack
              gap="md"
              style={{ flex: 1, minWidth: 0 }}
              maw={{ lg: "calc(100% - 424px)" }}
            >
              <Player key={videoId} data={data} />

              <Stack gap="sm">
                <Title order={1} size="h4" fw={600} style={{ lineHeight: 1.3 }}>
                  {data.title}
                </Title>

                <Flex
                  direction={{ base: "column", sm: "row" }}
                  gap="md"
                  justify="space-between"
                  align={{ sm: "center" }}
                  wrap="wrap"
                >
                  <ChannelBlock data={data} />

                  <Group gap="xs" wrap="wrap">
                    <Group gap="xs" c="dimmed" fz="sm">
                      {data.likes != null ? (
                        <span>{data.likes.toLocaleString("ru")} лайков</span>
                      ) : null}
                      {data.views != null ? (
                        <span>{data.views.toLocaleString("ru")} просмотров</span>
                      ) : null}
                      {data.uploaded != null ? (
                        <DateDisplay timestamp={data.uploaded} />
                      ) : null}
                    </Group>
                  </Group>
                </Flex>

                {data.description && (
                  <DescriptionSection description={data.description} />
                )}

                <CommentsSection videoId={videoId} />

                {data.livestream ? (
                  <Text size="sm" c="orange" fw={500}>
                    В эфире
                  </Text>
                ) : null}
              </Stack>
            </Stack>

            <RelatedVideoList related={related} />
          </Flex>
        ) : null}
      </Box>
    </>
  )
}

export default WatchView
