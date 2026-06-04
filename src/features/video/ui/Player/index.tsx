import { AspectRatio, Text } from "@mantine/core"
import type { PipedStreamResponse } from "@/models/video/api/videoSlice"
import { pickPlayback } from "@/models/video/lib/pickPlayback"
import { usePrefersNativePlayback } from "@/models/video/lib/playbackPlatform"
import ShakaPlayer from "../ShakaPlayer"
import HTML5Player from "../HTML5Player"
import NativePlayer from "../NativePlayer"
import type { FC } from "react"

interface PlayerProps {
  data: PipedStreamResponse
}

const Player: FC<PlayerProps> = ({ data }) => {
  const preferNative = usePrefersNativePlayback()
  const pick = pickPlayback(data, { preferNative })

  if (!pick) {
    return (
      <Text c="dimmed" size="sm">
        Не удалось подобрать поток для воспроизведения.
      </Text>
    )
  }

  const inner =
    pick.kind === "shaka" ? (
      <ShakaPlayer
        src={pick.url}
        mimeType={pick.mimeType}
        qualities={pick.qualities}
      />
    ) : pick.kind === "native" ? (
      <NativePlayer src={pick.url} qualities={pick.qualities} />
    ) : (
      <HTML5Player
        key={`${pick.videoUrl}|${pick.audioUrl}`}
        videoUrl={pick.videoUrl}
        audioUrl={pick.audioUrl}
        qualities={pick.qualities}
      />
    )

  return (
    <AspectRatio ratio={16 / 9}>
      <div style={{ width: "100%", height: "100%", background: "black" }}>{inner}</div>
    </AspectRatio>
  )
}

export default Player
